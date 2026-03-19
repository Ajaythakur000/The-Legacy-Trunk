import { useState } from 'react';

function MessageInput({ onSend, onTyping, disabled = false }) {
  const [text, setText] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);

    // Phase 5 typing indicator ke liye hook
    if (onTyping) onTyping(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed) return;

    onSend(trimmed);
    setText('');
    if (onTyping) onTyping(''); // typing stop trigger helper
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <input
        type="text"
        placeholder="Type a message..."
        value={text}
        onChange={handleChange}
        disabled={disabled}
        style={{
          flex: 1,
          border: '1px solid #ccc',
          borderRadius: 10,
          padding: '10px 12px',
        }}
      />
      <button type="submit" disabled={disabled}>
        Send
      </button>
    </form>
  );
}

export default MessageInput;