function TypingIndicator({ typingUsers = [] }) {
  if (!typingUsers.length) return null;

  return (
    <div style={{ marginTop: 8, minHeight: 20, fontSize: 13, color: '#666' }}>
      {typingUsers.join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
    </div>
  );
}

export default TypingIndicator;