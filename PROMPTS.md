# Prompts & Engineering Notes
## Live Ops Helpdesk — Sprint 19

**Track:** Full Stack  
**Project:** Live Ops Helpdesk  
**Client:** RapidDispatch Freight & Logistics

## 1. Understanding the Real-Time Requirement

One of the first things I needed to understand was how multiple support agents could work on the same ticket board without constantly refreshing their browsers.

A normal frontend update was not enough. If one agent created or modified a ticket, every other connected agent needed to see that change immediately.

**Questions I explored:**

- How should the frontend and backend communicate when multiple agents are connected?
- How can ticket information remain synchronized across browser sessions?
- Why would polling or refreshing the page not be a suitable approach for this requirement?
- Which information should the server broadcast, and which information should each client maintain locally?

**Implementation direction:**

I used Socket.IO to establish real-time communication between the React frontend and the Express backend. Ticket creation and updates are broadcast to connected clients through socket events.

## 2. The Most Challenging Part: Preventing Two Agents from Editing the Same Ticket

The most important problem I had to think through was ticket locking.

Imagine two support agents opening the same dispatch ticket at almost the same time. If both agents can edit it, one person's changes could overwrite the other's work.

Simply disabling a button in React would not solve the actual problem because the restriction needs to be managed by the backend.

**Questions I worked through:**

- How can the server identify which agent currently owns a ticket lock?
- What should happen if two agents request the same ticket at nearly the same time?
- How can the server prevent a second agent from acquiring an already active lock?
- How should the lock owner be identified independently of the browser's local UI state?
- How can all connected clients immediately know that a ticket is locked?
- What should happen if someone other than the lock owner attempts to release the ticket?

**Implementation direction:**

I used an in-memory JavaScript `Map` on the backend to maintain active ticket locks.

Each lock is associated with the owning socket ID and agent information. Before granting a lock, the server checks whether the ticket is already locked.

When a lock is acquired or released, the updated lock information is broadcast to all connected clients.

The frontend then displays the agent holding the lock and prevents other agents from editing that ticket.

## 3. Handling Unexpected Disconnections

Another important situation was something that could easily be overlooked during normal testing.

An agent might close the browser tab, lose their internet connection, or disconnect unexpectedly while editing a ticket.

If the server continued treating that ticket as locked, other agents would be unable to work on it.

**Questions I needed to consider:**

- How does the backend know which tickets belong to a disconnected socket?
- Should the lock remain active after its owner disconnects?
- How can the server release multiple locks held by the same socket?
- How will the remaining agents receive the updated lock information?
- What should the frontend display while the server connection is unavailable?

**Implementation direction:**

I handled the Socket.IO `disconnect` event on the backend.

When a socket disconnects, the server checks the active locks, identifies those owned by that socket, releases them, and broadcasts the updated lock state.

On the frontend, the connection status changes to:

`Connection Lost: Reconnecting...`

This ensures that an unexpected disconnection does not leave a ticket permanently locked.

## 4. Keeping Ticket Updates and Lock Updates Consistent

During implementation, I also needed to think about the difference between ticket data and lock information.

They are related, but they represent two different things.

A ticket contains information such as its truck ID, issue, status, and resolution. A lock represents which agent currently has permission to edit that ticket.

**Questions I considered:**

- Should saving a resolution and releasing a lock happen as separate operations?
- How can the application prevent other clients from displaying outdated information?
- What should happen when an agent closes the editor without saving?
- How can the application distinguish between a ticket update and a lock update?

**Implementation direction:**

I kept ticket information and active locks in separate backend structures.

Saving a resolution updates the ticket information and releases its lock. Closing the editor releases the lock without changing the resolution.

The backend broadcasts the updated information so connected clients can reflect the latest state.

## 5. Testing Real Collaboration Instead of Testing One Browser

A single browser session can show whether the interface works, but it cannot properly prove that real-time collaboration works.

I therefore considered the application from the perspective of two independent agents.

**Questions I used during verification:**

- Does a newly created ticket appear in both sessions without refreshing?
- If Agent A locks a ticket, does Agent B immediately see the lock?
- Can Agent B still edit a ticket that Agent A currently owns?
- Does saving a resolution update both sessions?
- Does closing the editor make the ticket available again?
- If Agent A closes the browser unexpectedly, can Agent B access the ticket?
- Does the frontend recover its dashboard state after reconnecting?

**Verification approach:**

I used two separate browser sessions connected to the same deployed application.

This allowed me to observe the actual interaction between clients instead of relying only on the appearance of the frontend.

## 6. Deployment and Connection Configuration

Moving the application from local development to production introduced another area that needed attention.

The frontend and backend were deployed separately, so the Socket.IO connection could not continue using the local development address.

**Questions I considered:**

- How should the frontend identify the deployed backend?
- How should the backend allow connections from the deployed frontend?
- How can I verify that the backend is running independently of the frontend?
- How can I distinguish a backend connection issue from a frontend rendering issue?

**Implementation direction:**

I deployed the React frontend on Vercel and the Node.js backend on Render.

The frontend uses the `VITE_SOCKET_URL` environment variable for its backend connection. The backend uses CORS configuration to allow the deployed frontend origin.

I also used a `/health` endpoint to verify the backend service independently.

## 7. Important Technical Decisions

| Area | Decision |
|---|---|
| Frontend | React with Vite |
| Backend | Node.js and Express.js |
| Real-time communication | Socket.IO |
| Client connection | Socket.IO Client |
| Ticket storage | In-memory JavaScript array |
| Lock management | In-memory JavaScript Map |
| Frontend styling | CSS |
| Icons | Lucide React |
| Frontend deployment | Vercel |
| Backend deployment | Render |

## 8. Current Implementation Limitations

The application uses in-memory storage for tickets and active locks. It does not use a database or persistent storage.

This means ticket information and active locks reset when the backend server restarts.

This was kept consistent with the implemented project scope.

---

## Final Reflection

The most valuable part of building this project was understanding that real-time collaboration is not just about sending updates between browsers.

The backend must also control who can edit a ticket, maintain lock ownership, handle competing requests, and clean up locks when a client disconnects.

Working through these situations helped me understand how frontend state, backend logic, and socket communication need to work together to create a reliable multi-agent application.

**Project:** Live Ops Helpdesk  
**Sprint:** 19  
**Track:** Full Stack