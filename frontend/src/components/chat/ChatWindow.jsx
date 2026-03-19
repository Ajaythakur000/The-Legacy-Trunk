function ChatWindow({ messages, currentUserId }) {
  return (
    <div
      style={{
        height: '55vh',
        overflowY: 'auto',
        border: '1px solid #ddd',
        borderRadius: 12,
        padding: 12,
        background: '#fafafa',
      }}
    >
      {messages.length === 0 ? (
        <p style={{ color: '#777' }}>No messages yet. Start the conversation 👋</p>
      ) : (
        messages.map((msg, index) => {
          const isMe =
            String(msg?.senderId || msg?.sender?._id) === String(currentUserId);

          return (
            <div
              key={msg?._id || msg?.id || index}
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                marginBottom: 10,
              }}
            >
              <div
                style={{
                  maxWidth: '75%',
                  padding: '8px 12px',
                  borderRadius: 12,
                  background: isMe ? '#dbeafe' : '#e5e7eb',
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>
                  {msg?.senderName || msg?.sender?.name || 'Unknown'}
                </div>
                <div>{msg?.text || msg?.message || ''}</div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default ChatWindow;