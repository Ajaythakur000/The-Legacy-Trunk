import { useEffect, useMemo, useState } from 'react';
import {
  addCommentToStoryApi,
  createStoryApi,
  getCircleFeedApi,
  toggleLikeStoryApi,
  deleteStoryApi
} from '../api/storyApi';
import { useAuth } from '../context/AuthContext';
import { getSocket } from '../services/socket.js';

function VaultStoriesPage() {
  const { user } = useAuth();
  
  // 🔥 STRICT BINDING
  const activeCircleId = user?.activeCircleId || null;

  const [stories, setStories] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [isGlobalPublic, setIsGlobalPublic] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState('');
  const [commentTextByStory, setCommentTextByStory] = useState({});
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadFeed = async () => {
    if (!activeCircleId) return;
    setLoadingFeed(true);
    setError('');
    try {
      // Future proofing: Agar teri API parameterized hui toh yeh activeCircleId use karegi
      const data = await getCircleFeedApi(activeCircleId); 
      setStories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load circle feed');
    } finally {
      setLoadingFeed(false);
    }
  };

  // 🔥 AUTO-REFETCH: Dropdown se circle change hone pe automatically naya feed aayega
  useEffect(() => {
    if (activeCircleId) {
      loadFeed();
    } else {
      setStories([]); // Clear screen if no circle selected
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCircleId]);

  useEffect(() => {
    const socket = getSocket();

    if (!activeCircleId || !socket) return;

    socket.emit('join_story_feed', { circleId: activeCircleId });

    const onNewStory = (incoming) => {
      setStories((prev) => {
        const exists = prev.some((x) => x._id === incoming._id);
        if (exists) return prev;
        return [incoming, ...prev];
      });
    };

    socket.on('new_story_added', onNewStory);

    return () => {
      socket.emit('leave_story_feed', { circleId: activeCircleId });
      socket.off('new_story_added', onNewStory);
    };
  }, [activeCircleId]);

  useEffect(() => {
    if (!mediaFile) return setMediaPreviewUrl('');
    const url = URL.createObjectURL(mediaFile);
    setMediaPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  const handleCreateStory = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!activeCircleId) {
      setError('Please select an Active Family from the top navigation first.');
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('content', content.trim());
    if (tags.trim()) formData.append('tags', tags.trim());
    formData.append('isGlobalPublic', isGlobalPublic ? 'true' : 'false');
    if (mediaFile) formData.append('media', mediaFile);
    
    // 🔥 EXPLICIT DATA: Backend ko batana ki yeh story KIS circle ki hai
    formData.append('circleId', activeCircleId); 

    setUploading(true);
    try {
      await createStoryApi(formData);
      setSuccess('Story created successfully');
      setTitle('');
      setContent('');
      setTags('');
      setIsGlobalPublic(false);
      setMediaFile(null);
      setMediaPreviewUrl('');
      await loadFeed();
    } catch (e2) {
      console.error('createStory failed:', e2?.response?.data || e2);
      setError(
        e2?.response?.data?.message ||
        e2?.message ||
        'Failed to create story'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleLike = async (storyId) => {
    setActionLoadingId(storyId);
    try {
      await toggleLikeStoryApi(storyId);
      await loadFeed();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to like/unlike story');
    } finally {
      setActionLoadingId('');
    }
  };

  const handleCommentSubmit = async (storyId) => {
    const text = (commentTextByStory[storyId] || '').trim();
    if (!text) return;
    setActionLoadingId(storyId);
    try {
      await addCommentToStoryApi(storyId, text);
      setCommentTextByStory((p) => ({ ...p, [storyId]: '' }));
      await loadFeed();
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to add comment');
    } finally {
      setActionLoadingId('');
    }
  };

  const sortedStories = useMemo(
    () => [...stories].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [stories]
  );

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <h1>Vault Stories</h1>
      
      {!activeCircleId ? (
        <p style={{ color: '#92400e', background: '#fffbeb', padding: 12, borderRadius: 8 }}>
          Please select a Family Circle from the top navigation to view or post stories.
        </p>
      ) : (
        <p>Posting to: <b>{activeCircleId}</b></p>
      )}

      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      {success ? <p style={{ color: 'green' }}>{success}</p> : null}

      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <h3>Create Story</h3>
        <form onSubmit={handleCreateStory}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            style={{ width: '100%', padding: 10, marginBottom: 8 }}
            disabled={!activeCircleId}
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Content"
            rows={4}
            style={{ width: '100%', padding: 10, marginBottom: 8 }}
            disabled={!activeCircleId}
          />
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            style={{ width: '100%', padding: 10, marginBottom: 8 }}
            disabled={!activeCircleId}
          />
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
            disabled={!activeCircleId}
          />
          <div style={{ marginTop: 8 }}>
            <label>
              <input
                type="checkbox"
                checked={isGlobalPublic}
                onChange={(e) => setIsGlobalPublic(e.target.checked)}
                disabled={!activeCircleId}
              />{' '}
              Make global public
            </label>
          </div>
          <button type="submit" disabled={uploading || !activeCircleId} style={{ marginTop: 10 }}>
            {uploading ? 'Uploading...' : 'Post Story'}
          </button>
        </form>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
        <h3>Circle Feed</h3>
        {loadingFeed ? <p>Loading...</p> : null}

        {sortedStories.length === 0 && !loadingFeed ? (
          <p style={{ color: '#666' }}>No stories available in this circle.</p>
        ) : (
          sortedStories.map((s) => (
            <div key={s._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 10, marginBottom: 10 }}>
              <b>{s.title}</b>
              <p>{s.content}</p>

              {/* Media */}
              {s?.mediaUrl &&
                (s?.mediaType === 'photo' || s?.mediaType === 'image' || s?.mediaType === 'img') && (
                  <img
                    src={s.mediaUrl}
                    alt={s.title || 'story-media'}
                    style={{ width: '100%', maxHeight: 360, objectFit: 'cover', borderRadius: 8, marginTop: 8 }}
                  />
                )}

              {s?.mediaUrl && s?.mediaType === 'video' && (
                <video controls style={{ width: '100%', maxHeight: 360, borderRadius: 8, marginTop: 8 }}>
                  <source src={s.mediaUrl} />
                </video>
              )}

              {s?.mediaUrl && s?.mediaType === 'audio' && (
                <audio controls style={{ width: '100%', marginTop: 8 }}>
                  <source src={s.mediaUrl} />
                </audio>
              )}

              <small>by {s?.user?.name || 'Unknown'}</small>

              <div style={{ marginTop: 8 }}>
                <button onClick={() => handleLike(s._id)} disabled={actionLoadingId === s._id}>
                  Like/Unlike
                </button>
                <span style={{ marginLeft: 8 }}>Likes: {s?.likes?.length || 0}</span>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <input
                  value={commentTextByStory[s._id] || ''}
                  onChange={(e) => setCommentTextByStory((p) => ({ ...p, [s._id]: e.target.value }))}
                  placeholder="Comment..."
                  style={{ flex: 1 }}
                />
                <button onClick={() => handleCommentSubmit(s._id)} disabled={actionLoadingId === s._id}>
                  Comment
                </button>

                {/* 🔥 COMMENTS LIST DIKHANE KA CODE */}
              {s?.comments && s.comments.length > 0 && (
                <div style={{ marginTop: 12, padding: 8, background: '#f9fafb', borderRadius: 8 }}>
                  <b style={{ fontSize: '13px', color: '#555' }}>Comments:</b>
                  {s.comments.map((c, idx) => (
                    <div key={c._id || idx} style={{ fontSize: '14px', marginTop: 4 }}>
                      <b>{c?.user?.name || 'Someone'}:</b> {c.text}
                    </div>
                  ))}
                </div>
              )}
                {/* 🔥 DELETE STORY BUTTON (Sirf agar user author hai) */}
              {user && s?.user?._id === user._id && (
                <div style={{ marginTop: 12 }}>
                  <button 
                    onClick={async () => {
                      if(window.confirm('Are you sure you want to delete this story?')) {
                        try {
                          await deleteStoryApi(s._id); // API Call
                          await loadFeed(); // Naya data laane ke liye screen refresh
                        } catch (err) {
                          alert(err?.response?.data?.message || 'Failed to delete story');
                        }
                      }
                    }} 
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    🗑️ Delete Story
                  </button>
                </div>
              )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default VaultStoriesPage;