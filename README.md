# Studygram 📚

A collaborative learning platform where students ask doubts, share knowledge, and learn together.

## Features
- 🎓 **Doubt-solving feed** — post questions & knowledge across subjects (Maths, Physics, Chemistry, English, CS…)
- 📝 **Comments & likes** — discuss and upvote the most helpful answers
- 🔍 **Instant search & filters** — find posts by subject, keyword, or sort by latest / popular / most discussed
- 🧊 **Immersive UI** — WebGL 3D hero, glassmorphism, aurora gradients, and 3D tilt post cards
- 🔐 **Google sign-in** — OAuth sessions via NextAuth

## Tech Stack
- **Next.js 15** (App Router) · React 18
- **MongoDB + Mongoose**
- **NextAuth (Google OAuth)**
- **Tailwind CSS** · React Three Fiber

## Quick Start
```bash
cp .env.example .env   # fill in your Google OAuth + MongoDB credentials
npm install
npm run dev            # http://localhost:3000
```

## Deployment
Deployed on Vercel. Pushes to `main` auto-deploy. Required env vars:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `MONGODB_URI`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

MongoDB Atlas must allow access from anywhere (`0.0.0.0/0`) — Vercel uses dynamic IPs. Google OAuth requires the production callback URL `https://<your-domain>/api/auth/callback/google`.