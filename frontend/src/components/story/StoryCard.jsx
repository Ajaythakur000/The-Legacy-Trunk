import { Link } from 'react-router-dom';
import StoryCommentBox from './StoryCommentBox';

// 🔥 Naya prop add kiya: isDetailView (taaki pata chale ki hum feed mein hain ya detail page par)
function StoryCard({ story, currentUser, onLike, onComment, onDelete, isDetailView = false }) {
  const isAuthor = currentUser && story?.user?._id === currentUser._id;

  return (
    <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '16px', marginBottom: '16px', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          {/* 🔥 Agar Feed mein hain, toh Title pe click karke Detail page pe ja sakte hain */}
          {isDetailView ? (
            <h3 style={{ margin: '0 0 4px 0', color: '#111827' }}>{story.title}</h3>
          ) : (
            <Link to={`/vault-stories/${story._id}`} style={{ textDecoration: 'none' }}>
              <h3 style={{ margin: '0 0 4px 0', color: '#2563eb', cursor: 'pointer' }}>{story.title} 🔗</h3>
            </Link>
          )}
          <small style={{ color: '#6b7280' }}>by <b>{story?.user?.name || 'Unknown'}</b></small>
        </div>
        
        {isAuthor && (
          <button
            onClick={() => {
              if(window.confirm('Are you sure you want to delete this story?')) {
                onDelete(story._id);
              }
            }}
            style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
          >
            🗑️ Delete
          </button>
        )}
      </div>

      <p style={{ marginTop: '12px', color: '#374151', lineHeight: '1.5' }}>{story.content}</p>

      {story?.mediaUrl && (story?.mediaType === 'photo' || story?.mediaType === 'image' || story?.mediaType === 'img') && (
        <img src={story.mediaUrl} alt={story.title} style={{ width: '100%', maxHeight: isDetailView ? '600px' : '400px', objectFit: 'contain', borderRadius: '8px', marginTop: '12px', background: '#f3f4f6' }} />
      )}
      
      {story?.mediaUrl && story?.mediaType === 'video' && (
        <video controls style={{ width: '100%', maxHeight: isDetailView ? '600px' : '400px', borderRadius: '8px', marginTop: '12px' }}>
          <source src={story.mediaUrl} />
        </video>
      )}
      
      {story?.mediaUrl && story?.mediaType === 'audio' && (
        <audio controls style={{ width: '100%', marginTop: '12px' }}>
          <source src={story.mediaUrl} />
        </audio>
      )}

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', marginBottom: '8px' }}>
        <button 
          onClick={() => onLike(story._id)} 
          style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '20px', border: '1px solid #e5e7eb', background: '#f3f4f6', color: '#4b5563', fontWeight: '500' }}
        >
          👍 Like ({story?.likes?.length || 0})
        </button>
      </div>

      <StoryCommentBox storyId={story._id} comments={story.comments} onCommentSubmit={onComment} />
    </div>
  );
}

export default StoryCard;