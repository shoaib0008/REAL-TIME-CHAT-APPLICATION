import { useEffect, useRef } from 'react';

const ROOM_META = {
  general: { icon: '💬', label: 'General' },
  tech:    { icon: '💻', label: 'Tech'    },
  random:  { icon: '🎲', label: 'Random'  },
};

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDateLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function groupMessagesByDate(messages) {
  const groups = [];
  let lastLabel = null;
  messages.forEach(msg => {
    const label = formatDateLabel(msg.timestamp);
    if (label !== lastLabel) {
      groups.push({ type: 'divider', label, key: `divider-${msg.timestamp}` });
      lastLabel = label;
    }
    groups.push({ type: 'msg', data: msg, key: msg.id });
  });
  return groups;
}

export default function MessageList({ messages, currentUsername, currentRoom, typingUsers, onlineCount }) {
  const bottomRef = useRef(null);
  const containerRef = useRef(null);
  const prevLenRef = useRef(0);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (messages.length !== prevLenRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevLenRef.current = messages.length;
    }
  }, [messages]);

  const meta = ROOM_META[currentRoom] || { icon: '💬', label: currentRoom };
  const grouped = groupMessagesByDate(messages);
  const typingList = Object.values(typingUsers).filter(u => u.username !== currentUsername);

  return (
    <div className="chat-main">
      {/* Header */}
      <header className="chat-header">
        <div className="chat-header-icon">{meta.icon}</div>
        <div className="chat-header-info">
          <h2>#{meta.label}</h2>
          <p>{onlineCount} {onlineCount === 1 ? 'member' : 'members'} online</p>
        </div>
      </header>

      {/* Messages */}
      <div className="messages-container" ref={containerRef} id="messages-container">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon">{meta.icon}</div>
            <h3>Welcome to #{meta.label}!</h3>
            <p>No messages yet. Be the first to say something and get the conversation going!</p>
          </div>
        )}

        {grouped.map(item => {
          if (item.type === 'divider') {
            return (
              <div key={item.key} className="messages-date-divider">
                {item.label}
              </div>
            );
          }

          const msg = item.data;

          if (msg.type === 'system') {
            return (
              <div key={item.key} className="msg-system">
                {msg.text}
              </div>
            );
          }

          const isOwn = msg.username === currentUsername;

          return (
            <div
              key={item.key}
              id={`msg-${msg.id}`}
              className={`msg-row${isOwn ? ' own' : ''}`}
            >
              <img
                src={msg.avatar}
                alt={msg.username}
                className="msg-avatar"
              />
              <div className="msg-body">
                <div className="msg-meta">
                  <span className="msg-username">
                    {isOwn ? 'You' : msg.username}
                  </span>
                  <span className="msg-time">{formatTime(msg.timestamp)}</span>
                </div>
                <div className="msg-bubble">{msg.text}</div>
              </div>
            </div>
          );
        })}

        {/* Typing indicators */}
        {typingList.length > 0 && (
          <div className="typing-indicator" id="typing-indicator">
            <div className="typing-dots">
              <span /><span /><span />
            </div>
            <span>
              {typingList.length === 1
                ? `${typingList[0].username} is typing…`
                : `${typingList.map(u => u.username).join(', ')} are typing…`}
            </span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
