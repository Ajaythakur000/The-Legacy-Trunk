import { useState } from 'react';
import { Link } from 'react-router-dom';
import StoryCommentBox from './StoryCommentBox';

function StoryCard({ story, currentUser, onLike, onComment, onDelete, onEdit, isDetailView = false }) {
  const isAuthor = currentUser && story?.user?._id === currentUser._id;
  
  // 🔥 Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(story.title);
  const [editContent, setEditContent] = useState(story.content);
  const [editTags, setEditTags] = useState(story.tags ? story.tags.join(', ') : '');

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(story._id, { title: editTitle, content: editContent, tags: editTags });
      setIsEditing(false);
    }
  };

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '16px', marginBottom: '16px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      
      {/* 👤 Header: Title & Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          {/* 🔥 Edit Mode Form OR Normal Title */}
          {isEditing ? (
            <input 
              value={editTitle} 
              onChange={(e) => setEditTitle(e.target.value)} 
              style={{ width: '90%', padding: '6px', marginBottom: '8px', fontSize: '16px', fontWeight: 'bold', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          ) : (
            isDetailView ? (
              <h3 style={{ margin: '0 0 4px 0', color: '#111827' }}>{story.title}</h3>
            ) : (
              <Link to={`/vault-stories/${story._id}`} style={{ textDecoration: 'none' }}>
                <h3 style={{ margin: '0 0 4px 0', color: '#2563eb', cursor: 'pointer' }}>{story.title} 🔗</h3>
              </Link>
            )
          )}
          <small style={{ color: '#6b7280', display: 'block' }}>by <b>{story?.user?.name || 'Unknown'}</b></small>
        </div>
        
        {/* 🔥 Actions: Edit & Delete Buttons */}
        {isAuthor && !isEditing && (
          <div style={{ display: 'flex', gap: '8px' }}>
            {onEdit && (
              <button onClick={() => setIsEditing(true)} style={{ background: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                ✏️ Edit
              </button>
            )}
            {onDelete && (
              <button onClick={() => { if(window.confirm('Are you sure you want to delete this story?')) onDelete(story._id); }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}>
                🗑️ Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* 📜 Content (Edit Mode vs Normal) */}
      {isEditing ? (
        <div style={{ marginTop: '12px' }}>
          <textarea 
            value={editContent} 
            onChange={(e) => setEditContent(e.target.value)} 
            rows={4}
            style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <input 
            value={editTags} 
            onChange={(e) => setEditTags(e.target.value)} 
            placeholder="Tags (comma separated)"
            style={{ width: '100%', padding: '8px', marginBottom: '12px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={handleSaveEdit} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>💾 Save</button>
            <button onClick={() => { setIsEditing(false); setEditTitle(story.title); setEditContent(story.content); }} style={{ background: '#9ca3af', color: 'white', border: 'none', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>❌ Cancel</button>
          </div>
        </div>
      ) : (
        <p style={{ marginTop: '12px', color: '#374151', lineHeight: '1.5' }}>{story.content}</p>
      )}

      {/* 🖼️ Media Section */}
      {!isEditing && story?.mediaUrl && (story?.mediaType === 'photo' || story?.mediaType === 'image' || story?.mediaType === 'img') && (
        <img src={story.mediaUrl} alt={story.title} style={{ width: '100%', maxHeight: isDetailView ? '600px' : '400px', objectFit: 'contain', borderRadius: '8px', marginTop: '12px', background: '#f3f4f6' }} />
      )}
      
      {!isEditing && story?.mediaUrl && story?.mediaType === 'video' && (
        <video controls style={{ width: '100%', maxHeight: isDetailView ? '600px' : '400px', borderRadius: '8px', marginTop: '12px' }}>
          <source src={story.mediaUrl} />
        </video>
      )}

      {/* 👍 Actions (Like) */}
      {!isEditing && (
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
          <button onClick={() => onLike(story._id)} style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '20px', border: '1px solid #e5e7eb', background: '#f3f4f6', color: '#4b5563', fontWeight: '500' }}>
            👍 Like ({story?.likes?.length || 0})
          </button>
        </div>
      )}

      {/* 💬 Comments Box */}
      {!isEditing && (
        <StoryCommentBox storyId={story._id} comments={story.comments} onCommentSubmit={onComment} />
      )}
    </div>
  );
}

export default StoryCard;