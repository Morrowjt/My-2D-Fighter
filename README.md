# Neon Clash

A small two-player browser fighting game built with JavaScript, Canvas, and Vite. Requires Node.js 20.19+ or 22.12+ (Node 24 recommended).

```sh
npm ci
npm run dev
```

Open the development server in a browser. Both players share a keyboard.

| Fighter | Move | Jump | Punch | Kick |
| --- | --- | --- | --- | --- |
| Echo | A / D | W | F | G |
| Nova | Left / Right | Up | K | L |

Rounds last 90 seconds. Reduce the opponent's health to zero or have more health when time expires. Click Restart round to reset. A desktop keyboard is required; touch controls are not included.

Run `npm test` for combat and physics checks, and `npm run build` to create `dist/`. Run `npm run preview` to serve the production build. No accounts, credentials, or backend services are needed.
