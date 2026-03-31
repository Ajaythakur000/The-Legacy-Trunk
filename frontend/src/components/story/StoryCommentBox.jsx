import { useState } from 'react';

function StoryCommentBox({ storyId, comments = [], onCommentSubmit }) {
  const [text, setText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onCommentSubmit(storyId, text);
    setText(''); // Submit hone ke baad input clear kar do
  };

  return (
    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #eee' }}>
      
      {/* 📝 Comments List */}
      {comments.length > 0 && (
        <div style={{ marginBottom: '12px', maxHeight: '150px', overflowY: 'auto' }}>
          <b style={{ fontSize: '13px', color: '#555' }}>Comments:</b>
          {comments.map((c, idx) => (
            <div key={c._id || idx} style={{ fontSize: '14px', marginTop: '6px', background: '#f9fafb', padding: '8px', borderRadius: '6px' }}>
              <b style={{ color: '#374151' }}>{c?.user?.name || 'Someone'}:</b> <span style={{ color: '#4b5563' }}>{c.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* ✍️ Add Comment Input */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write a comment..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #ccc', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none' }}>
          Post
        </button>
      </form>
    </div>
  );
}

export default StoryCommentBox;