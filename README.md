# High traffic city simulator

A demo application showing how to handle heavy WebSocket traffic and render
a frequently changing dashboard.

The backend generates dozens of new pedestrians every second and sends them to the frontend.
Each pedestrian is randomly updated by the backend every few seconds, and removed after a few minutes.

All pedestrians are displayed in the frontend dashboard, which updates live despite heavy traffic.

You can see a live demo here:

[https://high-traffic-city-sim.vercel.app/](https://high-traffic-city-sim.vercel.app/)

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
