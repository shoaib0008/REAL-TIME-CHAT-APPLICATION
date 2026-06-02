import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatApp from './components/ChatApp';

export default function App() {
  const [session, setSession] = useState(null); // { username, avatar, room }

  return session
    ? <ChatApp
        username={session.username}
        avatar={session.avatar}
        initialRoom={session.room}
        onLogout={() => setSession(null)}
      />
    : <LoginScreen onJoin={setSession} />;
}
