const ROOMS = [
  { id: 'general', label: 'General', icon: '💬', desc: 'Open chat for all' },
  { id: 'tech',    label: 'Tech',    icon: '💻', desc: 'Dev & coding talk'  },
  { id: 'random',  label: 'Random',  icon: '🎲', desc: 'Anything goes'      },
];

export default function SidebarLeft({ currentRoom, onSwitchRoom, username, avatar, unreadCounts, onLogout }) {
  return (
    <aside className="sidebar-left">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-row">
          <div className="brand-icon">⚡</div>
          <span className="brand-name">NexusChat</span>
        </div>
      </div>

      {/* Rooms */}
      <div className="sidebar-section">
        <p className="sidebar-section-title">Rooms</p>
        {ROOMS.map(room => {
          const unread = unreadCounts[room.id] || 0;
          return (
            <div
              key={room.id}
              id={`room-nav-${room.id}`}
              className={`room-item${currentRoom === room.id ? ' active' : ''}`}
              onClick={() => onSwitchRoom(room.id)}
              title={room.desc}
            >
              <span className="room-icon">{room.icon}</span>
              <span className="room-name">{room.label}</span>
              {unread > 0 && currentRoom !== room.id && (
                <span className="room-badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Current User */}
      <div className="sidebar-user">
        <img
          src={avatar}
          alt={username}
          className="user-avatar-sm"
        />
        <div className="user-info-sm">
          <div className="uname">{username}</div>
          <div className="ustatus">Online</div>
        </div>
        <button
          className="logout-btn"
          onClick={onLogout}
          title="Logout"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}
