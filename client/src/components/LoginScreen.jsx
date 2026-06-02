import { useState } from 'react';

const ROOMS = [
  { id: 'general', label: '💬 General', icon: '💬' },
  { id: 'tech',    label: '💻 Tech',    icon: '💻' },
  { id: 'random',  label: '🎲 Random',  icon: '🎲' },
];

export default function LoginScreen({ onJoin }) {
  const [username, setUsername] = useState('');
  const [room, setRoom]         = useState('general');
  const [error, setError]       = useState('');

  const avatarUrl = username.trim()
    ? `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username.trim())}`
    : null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const name = username.trim();
    if (!name) { setError('Please enter a username.'); return; }
    if (name.length < 2) { setError('Username must be at least 2 characters.'); return; }
    if (name.length > 20) { setError('Username must be under 20 characters.'); return; }
    setError('');
    onJoin({ username: name, room, avatar: avatarUrl });
  };

  return (
    <div className="login-screen">
      <div className="login-bg">
        <div className="login-orb" />
        <div className="login-orb" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">⚡</div>
          <h1>NexusChat</h1>
        </div>

        <p className="login-subtitle">
          Real-time messaging powered by WebSockets.<br />
          Pick a name and jump right in.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          {/* Avatar Preview */}
          {avatarUrl && (
            <div style={{ display:'flex', justifyContent:'center', marginBottom:8 }}>
              <img
                src={avatarUrl}
                alt="avatar preview"
                style={{ width:72, height:72, borderRadius:'50%',
                         border:'3px solid var(--accent)',
                         boxShadow:'0 0 20px var(--accent-glow)',
                         background:'var(--bg-input)' }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="username-input">Username</label>
            <input
              id="username-input"
              className="form-input"
              type="text"
              placeholder="e.g. cosmic_coder"
              value={username}
              maxLength={20}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              autoFocus
              autoComplete="off"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Choose a Room</label>
            <div className="room-grid">
              {ROOMS.map(r => (
                <button
                  key={r.id}
                  type="button"
                  id={`room-btn-${r.id}`}
                  className={`room-btn${room === r.id ? ' active' : ''}`}
                  onClick={() => setRoom(r.id)}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color:'var(--error)', fontSize:13, marginTop:-4 }}>{error}</p>
          )}

          <button
            id="join-chat-btn"
            type="submit"
            className="login-btn"
            disabled={!username.trim()}
          >
            Join Chat →
          </button>
        </form>
      </div>
    </div>
  );
}
