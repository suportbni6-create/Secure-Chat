# WB Private Chat

An intimate, secure, real-time private messaging application designed for exactly two people.

## Features
- Real-time messaging using Firebase Firestore
- Voice notes, image, and video attachments using Cloudinary
- WebRTC Peer-to-Peer 1-on-1 Video Calling
- Dark / Light mode support
- Installable as a PWA
- End-to-end anonymity with Firebase Anonymous Auth

## Setup Guide

### 1. Environment Variables
Copy `.env.example` to `.env` (which is gitignored) and fill in your Firebase and Cloudinary credentials.
The `VITE_SECRET_CODE` must match what users will type on the login screen.

### 2. Firebase Config
1. Create a Firebase project.
2. Enable **Firestore**. Deploy the `firestore.rules` included in this repo.
3. Enable **Authentication** and turn on **Anonymous** sign-in providers.
4. Get your web app config and put the keys into `.env`.

### 3. Cloudinary Config
1. Create a free Cloudinary account.
2. Go to Settings > Upload and add an **Unsigned Upload Preset**.
3. Note your Cloud Name and the Preset name. Put these in `.env`.

### 4. Running the app
```bash
pnpm install
pnpm dev
```

### 5. Whitelisting UIDs
By default, `firestore.rules` is open to any authenticated user. Since this is a private 2-person app:
1. Log in on both your devices using the secret code.
2. Check Firebase Authentication to find the 2 generated UIDs.
3. Update `firestore.rules` to strictly check `request.auth.uid == "UID1" || request.auth.uid == "UID2"`.
4. Deploy the rules.

### 6. Deployment
Deploy easily to Vercel or Netlify. Since it's a Vite SPA:
- Build command: `pnpm build`
- Output directory: `dist/public` (or `dist`)
- Make sure to add all your `VITE_` environment variables in your deployment platform settings.
