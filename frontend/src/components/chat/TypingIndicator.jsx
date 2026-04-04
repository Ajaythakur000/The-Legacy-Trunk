function TypingIndicator({ typingUsers = [] }) {
  // 🔥 SMART EXTRACTION: Handle both Strings and Objects to prevent [object Object]
  const names = typingUsers.map(u => {
    if (typeof u === 'object') return u?.senderName || u?.name || 'Someone';
    return u;
  }).filter(Boolean);

  const uniqueNames = [...new Set(names)];

  // Agar koi type nahi kar raha, toh khali height do taaki screen jump na kare
  if (uniqueNames.length === 0) return <div style={{ height: '24px' }} />;

  return (
    <div style={{ padding: '4px 12px', fontSize: '13px', color: '#2563eb', fontWeight: '700', fontStyle: 'italic', height: '24px' }}>
      {uniqueNames.join(', ')} {uniqueNames.length > 1 ? 'are' : 'is'} typing...
    </div>
  );
}

export default TypingIndicator;