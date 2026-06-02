# REAL-TIME-CHAT-APPLICATION

*COMPANY*: CODTECH IT SOLUTIONS

*NAME*: Shoaib Akhtar

*INTERN ID*: CTIS6941

*DOMAIN*: FRONT END DEVELOPMENT

*DURATION*: 12 WEEEKS

*MENTOR*: NEELA SANTOSH

# NexusChat — Real-Time Chat Application ⚡

A beautiful, responsive, and real-time chat application built with **React**, **Vite**, and **WebSockets**. Features a modern glassmorphic design, dynamic avatars, and live typing indicators.

## 🚀 Features

- **Real-Time Messaging:** Instant message delivery using WebSockets.
- **Multiple Rooms:** Seamlessly switch between `#General`, `#Tech`, and `#Random`.
- **Live Typing Indicators:** See when other users are typing.
- **Online Presence:** Real-time list of online members in the current room.
- **Message History:** Displays the last 100 messages when joining a room.
- **Auto Avatars:** Distinct, auto-generated avatars based on usernames.
- **Emoji Support:** Integrated emoji picker in the chat input.
- **Modern Aesthetics:** Dark mode, glassmorphism, fluid animations, and custom scrollbars.
- **Auto-Reconnect:** Gracefully reconnects to the server if the connection drops.

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, CSS3 (Custom Design System).
- **Backend:** Node.js, `ws` (WebSockets).

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shoaib0008/REAL-TIME-CHAT-APPLICATION.git
   cd REAL-TIME-CHAT-APPLICATION
   ```

2. **Start the WebSocket Server (Backend)**
   ```bash
   cd server
   npm install
   npm start
   ```
   *The WebSocket server will start on `ws://localhost:8080`.*

3. **Start the React Frontend**
   Open a new terminal window/tab:
   ```bash
   cd client
   npm install
   npm run dev
   ```
   *The frontend will be accessible at `http://localhost:5173`.*

## 💡 Usage

- Open `http://localhost:5173` in your browser.
- Enter a unique username to generate your avatar.
- Select a room and start chatting!
- Open the app in multiple browser tabs to simulate multiple users.
