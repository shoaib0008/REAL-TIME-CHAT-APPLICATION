const { WebSocketServer, WebSocket } = require('ws');
const { v4: uuidv4 } = require('uuid');

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });

// In-memory message history (last 100 messages per room)
const rooms = {
  general: { messages: [], clients: new Map() },
  tech: { messages: [], clients: new Map() },
  random: { messages: [], clients: new Map() },
};

const MAX_HISTORY = 100;

// Helper: broadcast to all clients in a room
function broadcastToRoom(room, data, excludeId = null) {
  const roomData = rooms[room];
  if (!roomData) return;
  const payload = JSON.stringify(data);
  roomData.clients.forEach((client, id) => {
    if (id !== excludeId && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  });
}

// Helper: send to a single client
function sendTo(ws, data) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// Helper: get online users in a room
function getRoomUsers(room) {
  const roomData = rooms[room];
  if (!roomData) return [];
  return Array.from(roomData.clients.values()).map(c => ({
    id: c.id,
    username: c.username,
    avatar: c.avatar,
  }));
}

wss.on('connection', (ws) => {
  const clientId = uuidv4();
  let currentRoom = null;
  let username = null;
  let avatar = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {
      case 'join': {
        username = msg.username || `User_${clientId.slice(0, 5)}`;
        avatar = msg.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(username)}`;
        const room = msg.room || 'general';

        if (!rooms[room]) {
          sendTo(ws, { type: 'error', message: 'Room not found' });
          return;
        }

        currentRoom = room;
        rooms[room].clients.set(clientId, { id: clientId, username, avatar, ws });

        // Send message history
        sendTo(ws, {
          type: 'history',
          messages: rooms[room].messages,
          room,
        });

        // Send updated user list to everyone
        const users = getRoomUsers(room);
        broadcastToRoom(room, { type: 'users', users, room });
        sendTo(ws, { type: 'users', users, room });

        // Notify others of join
        const joinMsg = {
          id: uuidv4(),
          type: 'system',
          text: `${username} joined the room`,
          timestamp: Date.now(),
          room,
        };
        broadcastToRoom(room, { type: 'message', message: joinMsg }, clientId);
        break;
      }

      case 'message': {
        if (!currentRoom || !username) return;
        const message = {
          id: uuidv4(),
          type: 'chat',
          text: msg.text,
          username,
          avatar,
          userId: clientId,
          timestamp: Date.now(),
          room: currentRoom,
        };

        // Store in history
        rooms[currentRoom].messages.push(message);
        if (rooms[currentRoom].messages.length > MAX_HISTORY) {
          rooms[currentRoom].messages.shift();
        }

        // Broadcast to all in room including sender
        broadcastToRoom(currentRoom, { type: 'message', message });
        break;
      }

      case 'typing': {
        if (!currentRoom || !username) return;
        broadcastToRoom(currentRoom, {
          type: 'typing',
          userId: clientId,
          username,
          isTyping: msg.isTyping,
          room: currentRoom,
        }, clientId);
        break;
      }

      case 'switch_room': {
        if (!rooms[msg.room]) return;

        // Leave current room
        if (currentRoom) {
          rooms[currentRoom].clients.delete(clientId);
          const leaveMsg = {
            id: uuidv4(),
            type: 'system',
            text: `${username} left the room`,
            timestamp: Date.now(),
            room: currentRoom,
          };
          broadcastToRoom(currentRoom, { type: 'message', message: leaveMsg });
          broadcastToRoom(currentRoom, { type: 'users', users: getRoomUsers(currentRoom), room: currentRoom });
        }

        // Join new room
        currentRoom = msg.room;
        rooms[currentRoom].clients.set(clientId, { id: clientId, username, avatar, ws });

        // Send history
        sendTo(ws, {
          type: 'history',
          messages: rooms[currentRoom].messages,
          room: currentRoom,
        });

        // Update user lists
        const users = getRoomUsers(currentRoom);
        broadcastToRoom(currentRoom, { type: 'users', users, room: currentRoom });
        sendTo(ws, { type: 'users', users, room: currentRoom });
        sendTo(ws, { type: 'room_switched', room: currentRoom });

        // Notify join
        const joinMsg = {
          id: uuidv4(),
          type: 'system',
          text: `${username} joined the room`,
          timestamp: Date.now(),
          room: currentRoom,
        };
        broadcastToRoom(currentRoom, { type: 'message', message: joinMsg }, clientId);
        break;
      }
    }
  });

  ws.on('close', () => {
    if (currentRoom && rooms[currentRoom]) {
      rooms[currentRoom].clients.delete(clientId);

      const leaveMsg = {
        id: uuidv4(),
        type: 'system',
        text: `${username || 'A user'} left the room`,
        timestamp: Date.now(),
        room: currentRoom,
      };
      broadcastToRoom(currentRoom, { type: 'message', message: leaveMsg });
      broadcastToRoom(currentRoom, { type: 'users', users: getRoomUsers(currentRoom), room: currentRoom });
    }
  });

  ws.on('error', (err) => console.error('WS Error:', err.message));
});

console.log(`🚀 WebSocket Chat Server running on ws://localhost:${PORT}`);
