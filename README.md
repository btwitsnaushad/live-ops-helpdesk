# Live Ops Helpdesk

A real-time ticket management application built to help support agents manage dispatch issues and collaborate through a shared live dashboard.

Built with React, Node.js, Express.js, and Socket.IO, the application keeps ticket information synchronized across multiple connected clients without requiring a page refresh.

## Live Demo

- **Frontend:** https://live-ops-helpdesk-green.vercel.app
- **Backend:** https://live-ops-helpdesk-xox6.onrender.com/health
- **GitHub:** https://github.com/btwitsnaushad/live-ops-helpdesk

## Features

- **Live Ticket Board** – View dispatch tickets and their current status.
- **Real-Time Updates** – Newly created tickets and ticket changes appear across connected clients instantly.
- **Ticket Locking** – Agents can lock tickets before editing them.
- **Lock Visibility** – Other agents can see who is currently working on a locked ticket.
- **Edit Protection** – Prevents other agents from editing a ticket while it is locked.
- **Ticket Resolution** – Save resolutions and update ticket status.
- **Automatic Unlocking** – Releases ticket locks when an agent saves or closes the editor.
- **Disconnect Handling** – Automatically releases locks when an agent disconnects.
- **Connection Status** – Displays live server connection and reconnection status.
- **Search and Status Filtering** – Find tickets using the search field and status filter.

## Tech Stack

| Frontend | Backend | Tools & Deployment |
|---|---|---|
| React.js | Node.js | Git |
| Vite | Express.js | GitHub |
| CSS | Socket.IO | Vercel |
| Lucide React |  | Render |
| socket.io-client |  |  |

## Project Structure

```text
live-ops-helpdesk/
│
├── client/
│   ├── public/
│   └── src/
│       ├── pages/
│       │   └── Tickets.jsx
│       ├── services/
│       │   └── socket.js
│       ├── styles/
│       │   ├── global.css
│       │   ├── layout.css
│       │   ├── tickets.css
│       │   └── variables.css
│       ├── App.css
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   └── src/
│       ├── server.js
│       ├── socketHandler.js
│       └── ticketStore.js
│
└── README.md
└── PROMPTS.md
```

## Real-Time Socket Events

| Event | Description |
|---|---|
| `join_dashboard` | Joins the shared ticket dashboard |
| `lock_ticket` | Requests a ticket lock |
| `unlock_ticket` | Releases a ticket lock |
| `ticket_created` | Broadcasts a newly created ticket |
| `locks_updated` | Shares updated lock information |
| `tickets_updated` | Shares updated ticket information |
| `disconnect` | Releases locks held by a disconnected client |

Ticket locks are maintained on the server using an in-memory `Map`, associated with each connected socket.

## Local Setup

**1. Clone the repository**

```bash
git clone https://github.com/btwitsnaushad/live-ops-helpdesk.git
cd live-ops-helpdesk
```

**2. Install and start the backend**

```bash
cd server
npm install
npm start
```

**3. Install and start the frontend**

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory:

```env
VITE_SOCKET_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL provided by Vite.

## Environment Configuration

**Backend – `server/.env`**

```env
PORT=5000
CLIENT_URL=http://localhost:5173
```

**Frontend – `client/.env`**

```env
VITE_SOCKET_URL=http://localhost:5000
```

For deployment, configure the frontend and backend environment variables with their respective production URLs.

## Testing

The application was tested using two separate browser sessions to verify:

- Real-time ticket creation.
- Live ticket updates across both sessions.
- Ticket locking and lock visibility.
- Editing restrictions for other agents.
- Saving ticket resolutions.
- Automatic lock release after closing a session.
- Connection loss and reconnection behavior.

## Implementation Note

Ticket information and active locks are stored in server memory. Data is not persisted in a database, so tickets and locks reset when the backend server restarts.

---

**Project:** Live Ops Helpdesk  
**Sprint:** 19  
**Track:** Full Stack