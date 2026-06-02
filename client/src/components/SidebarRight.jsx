export default function SidebarRight({ users, currentUsername }) {
  return (
    <aside className="sidebar-right">
      <div className="sidebar-right-header">
        <h3>Online Now</h3>
        <p className="users-count">
          {users.length} {users.length === 1 ? 'member' : 'members'} online
        </p>
      </div>

      <div className="users-list">
        {users.length === 0 && (
          <p style={{ color:'var(--text-muted)', fontSize:12, padding:'8px 8px', textAlign:'center' }}>
            No users yet…
          </p>
        )}
        {users.map(user => {
          const isYou = user.username === currentUsername;
          return (
            <div key={user.id} className="user-item">
              <div className="user-avatar-wrapper">
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="user-avatar"
                />
                <div className="user-online-dot" />
              </div>
              <span className={`user-item-name${isYou ? ' you' : ''}`}>
                {user.username}
                {isYou && <span className="you-tag"> (you)</span>}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
