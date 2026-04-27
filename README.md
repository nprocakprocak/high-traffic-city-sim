# High traffic city simulator

A demo application showing how to handle heavy WebSocket traffic and render
a frequently changing dashboard.

The backend generates dozens of new pedestrians every second and sends them to the frontend.
Each pedestrian is randomly updated by the backend every few seconds, and removed after a few minutes.

All pedestrians are displayed in the frontend dashboard, which updates live despite heavy traffic.

You can see a live demo here: (try it also on your mobile phone 📱)

[https://high-traffic-city-sim.vercel.app/](https://high-traffic-city-sim.vercel.app/)

## Performance Optimizations

To keep the pedestrian dashboard responsive under heavy traffic, I applied the following optimizations:

- Above 1,500 pedestrians, WebSocket stream buffering turns on automatically. Incoming messages are queued and processed in batches every 200 ms.
- State was moved from local React state to Zustand so frequently updated arrays do not trigger full-app re-renders.
- Filtering and sorting use efficient algorithms that avoid nested loops.
- The pedestrian list uses virtualization to reduce the number of visual updates.
- Virtualized list rows receive stable props and avoid unnecessary updates from changing references.
- Selected dashboard sections are memoized to avoid redundant re-renders (for example chart calculations and map item projections).

### Trade-offs

- The visual street map of moving pedestrians cannot currently handle thousands of on-screen items without performance impact, so visible pedestrians are capped at 200. With more time, I could explore a more efficient animation/rendering approach; however, a denser map also reduces readability, so this was treated as a lower-priority issue.

## Architecture

The monorepo contains:

- `apps/frontend` — frontend Next.js + TypeScript
- `apps/backend` — backend Node.js + Express
- `apps/types` — shared types for both apps

## Running

```bash
   npm install
   npm run dev
```

Open the frontend at `http://localhost:3000` and the backend at `http://localhost:4000`.
