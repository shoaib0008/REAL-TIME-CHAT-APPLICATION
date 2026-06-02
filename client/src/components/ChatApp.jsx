import { useState, useCallback, useEffect, useRef } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import SidebarLeft   from './SidebarLeft';
import SidebarRight  from './SidebarRight';
import MessageList   from './MessageList';
import MessageInput  from './MessageInput';

export default function ChatApp({ username, avatar, initialRoom, onLogout }) {
  const [currentRoom, setCurrentRoom]   = useState(initialRoom);
  const [messagesByRoom, setMsgByRoom]  = useState({ general: [], tech: [], random: [] });
  const [usersByRoom, setUsersByRoom]   = useState({ general: [], tech: [], random: [] });
  const [typingUsers, setTypingUsers]   = useState({});
  const [unreadCounts, setUnreadCounts] = useState({ general: 0, tech: 0, random: 0 });
  const [toast, setToast]               = useState({ text: '', show: false });
  const currentRoomRef = useRef(currentRoom);

  useEffect(() => { currentRoomRef.current = currentRoom; }, [currentRoom]);

  // Toast helper
  const showToast = useCallback((text) => {
    setToast({ text, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2500);
  }, []);

  // Handle all WebSocket messages
  const handleMessage = useCallback((data) => {
    switch (data.type) {
      case 'history':
        setMsgByRoom(prev => ({ ...prev, [data.room]: data.messages }));
        break;

      case 'message': {
        const msg = data.message;
        const room = msg.room;
        setMsgByRoom(prev => ({
          ...prev,
          [room]: [...(prev[room] || []), msg],
        }));
        // Increment unread if not current room
        if (room !== currentRoomRef.current) {
          setUnreadCounts(prev => ({ ...prev, [room]: (prev[room] || 0) + 1 }));
        }
        break;
      }

      case 'users':
        setUsersByRoom(prev => ({ ...prev, [data.room]: data.users }));
        break;

      case 'typing': {
        const { userId, username: uname, isTyping } = data;
        setTypingUsers(prev => {
          const next = { ...prev };
          if (isTyping) next[userId] = { username: uname };
          else delete next[userId];
          return next;
        });
        // Auto-clear typing after 3s
        if (isTyping) {
          setTimeout(() => {
            setTypingUsers(prev => {
              const next = { ...prev };
              delete next[userId];
              return next;
            });
          }, 3000);
        }
        break;
      }

      case 'room_switched':
        setCurrentRoom(data.room);
        setTypingUsers({});
        setUnreadCounts(prev => ({ ...prev, [data.room]: 0 }));
        break;

      default: break;
    }
  }, []);

  const { status, send } = useWebSocket({
    username,
    avatar,
    room: initialRoom,
    onMessage: handleMessage,
  });

  // Status toast on connection change
  const prevStatus = useRef(status);
  useEffect(() => {
    if (prevStatus.current === 'connecting' && status === 'connected') {
      showToast('✅ Connected to server');
    } else if (prevStatus.current === 'connected' && status === 'disconnected') {
      showToast('⚠️ Disconnected — reconnecting…');
    }
    prevStatus.current = status;
  }, [status, showToast]);

  const handleSend = useCallback((text) => {
    send({ type: 'message', text });
  }, [send]);

  const handleTyping = useCallback((isTyping) => {
    send({ type: 'typing', isTyping });
  }, [send]);

  const handleSwitchRoom = useCallback((room) => {
    if (room === currentRoomRef.current) return;
    send({ type: 'switch_room', room });
    setTypingUsers({});
    setUnreadCounts(prev => ({ ...prev, [room]: 0 }));
  }, [send]);

  const messages  = messagesByRoom[currentRoom] || [];
  const users     = usersByRoom[currentRoom]    || [];

  const connLabel =
    status === 'connected'  ? 'Connected'   :
    status === 'connecting' ? 'Connecting…' : 'Reconnecting…';

  return (
    <>
      {/* Toast notification */}
      <div
        id="conn-toast"
        className={`toast${toast.show ? ' show' : ''}`}
        role="status"
        aria-live="polite"
      >
        {toast.text}
      </div>

      <div className="chat-app">
        <SidebarLeft
          currentRoom={currentRoom}
          onSwitchRoom={handleSwitchRoom}
          username={username}
          avatar={avatar}
          unreadCounts={unreadCounts}
          onLogout={onLogout}
        />

        {/* Center: messages + input */}
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
          {/* Connection badge fixed in header area */}
          <div style={{
            position: 'absolute', top: 14, right: 16, zIndex: 20,
            display: 'flex', gap: 8
          }}>
            <div
              id="connection-status"
              className={`conn-badge ${status}`}
              title={`WebSocket: ${status}`}
            >
              <div className="conn-dot" />
              {connLabel}
            </div>
          </div>

          <MessageList
            messages={messages}
            currentUsername={username}
            currentRoom={currentRoom}
            typingUsers={typingUsers}
            onlineCount={users.length}
          />

          <MessageInput
            onSend={handleSend}
            onTyping={handleTyping}
            disabled={status !== 'connected'}
            connectionStatus={status}
          />
        </div>

        {/* Right Sidebar */}
        <SidebarRight
          users={users}
          currentUsername={username}
        />
      </div>
    </>
  );
}
