import { useEffect, useMemo, useState } from 'react';
import {
  addCommentToStoryApi,
  createStoryApi,
  getCircleFeedApi,
  toggleLikeStoryApi,
} from '../api/storyApi';

function VaultStoriesPage() {
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
    setLoadingFeed(true);
    setError('');
    try {
      const data = await getCircleFeedApi();
      setStories(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.response?.data?.message || 'Failed to load circle feed');
    } finally {
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

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
      setError(e2?.response?.data?.message || 'Failed to create story');
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
      {error ? <p style={{ color: 'crimson' }}>{error}</p> : null}
      {success ? <p style={{ color: 'green' }}>{success}</p> : null}

      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12, marginBottom: 16 }}>
        <h3>Create Story</h3>
        <form onSubmit={handleCreateStory}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" style={{ width: '100%', padding: 10, marginBottom: 8 }} />
          <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Content" rows={4} style={{ width: '100%', padding: 10, marginBottom: 8 }} />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags (comma separated)" style={{ width: '100%', padding: 10, marginBottom: 8 }} />
          <input type="file" accept="image/*,video/*,audio/*" onChange={(e) => setMediaFile(e.target.files?.[0] || null)} />
          <div style={{ marginTop: 8 }}>
            <label>
              <input type="checkbox" checked={isGlobalPublic} onChange={(e) => setIsGlobalPublic(e.target.checked)} /> Make global public
            </label>
          </div>
          <button type="submit" disabled={uploading} style={{ marginTop: 10 }}>
            {uploading ? 'Uploading...' : 'Post Story'}
          </button>
        </form>
      </div>

      <div style={{ border: '1px solid #ddd', borderRadius: 12, padding: 12 }}>
        <h3>Circle Feed</h3>
        {loadingFeed ? <p>Loading...</p> : null}
        {sortedStories.map((s) => (
          <div key={s._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 10, marginBottom: 10 }}>
            <b>{s.title}</b>
            <p>{s.content}</p>
            <small>by {s?.user?.name || 'Unknown'}</small>
            <div style={{ marginTop: 8 }}>
              <button onClick={() => handleLike(s._id)} disabled={actionLoadingId === s._id}>Like/Unlike</button>
              <span style={{ marginLeft: 8 }}>Likes: {s?.likes?.length || 0}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <input
                value={commentTextByStory[s._id] || ''}
                onChange={(e) => setCommentTextByStory((p) => ({ ...p, [s._id]: e.target.value }))}
                placeholder="Comment..."
                style={{ flex: 1 }}
              />
              <button onClick={() => handleCommentSubmit(s._id)} disabled={actionLoadingId === s._id}>Comment</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default VaultStoriesPage;