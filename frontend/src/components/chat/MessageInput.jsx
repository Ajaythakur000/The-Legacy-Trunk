import { useState } from 'react';

function MessageInput({ onSend, onTyping, disabled }) {
  const [text, setText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    onSend(text.trim());
    setText('');
    onTyping(''); // stop typing indicator immediately
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      gap: '12px',
      marginTop: '16px',
      background: '#ffffff',
      padding: '8px 12px',
      borderRadius: '20px',
      border: isFocused ? '2px solid #3b82f6' : '2px solid #e2e8f0',
      boxShadow: isFocused ? '0 8px 25px rgba(59, 130, 246, 0.15)' : '0 4px 15px rgba(0,0,0,0.04)',
      transition: 'all 0.3s ease',
      alignItems: 'center'
    }}>
      <input
        type="text"
        value={text}
        placeholder={disabled ? "Connecting to Vault..." : "Share a thought..."}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => {
          const val = e.target.value;
          setText(val);

          if (val.trim()) {
            onTyping(val);   // trigger typing
          } else {
            onTyping('');    // clear typing
          }
        }}
        disabled={disabled}
        autoComplete="off"
        style={{
          flex: 1,
          border: 'none',
          padding: '12px 8px',
          outline: 'none',
          background: 'transparent',
          fontSize: '16px',
          color: '#1e293b'
        }}
      />

      <button type="submit" disabled={disabled || !text.trim()} style={{
        padding: '12px 24px',
        background: (disabled || !text.trim()) ? '#cbd5e1' : 'linear-gradient(135deg, #111827 0%, #334155 100%)',
        color: '#ffffff',
        border: 'none',
        borderRadius: '14px',
        fontWeight: '800',
        fontSize: '15px',
        cursor: (disabled || !text.trim()) ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        transform: (disabled || !text.trim()) ? 'scale(1)' : 'scale(1.02)',
        boxShadow: (disabled || !text.trim()) ? 'none' : '0 4px 12px rgba(17, 24, 39, 0.3)'
      }}>
        Send 🚀
      </button>
    </form>
  );
}

export default MessageInput;