# WB — Private Chat

Aplikasi chat private untuk 2 orang. Real-time messaging, foto/video/voice note, video call WebRTC, dan Firebase Anonymous Auth dengan kode rahasia.

## Fitur
- Real-time chat via Firebase Firestore
- Kirim foto, video, dan voice note (upload via Cloudinary)
- Video call 1-on-1 via WebRTC
- Dark / Light mode
- Installable sebagai PWA (Add to Home Screen)
- Login anonim dengan kode rahasia

---

## Setup Lokal

### 1. Clone & Install
```bash
git clone https://github.com/username/wb-chat.git
cd wb-chat
pnpm install
```

### 2. Buat file `.env`
Salin `.env.example` ke `.env` dan isi semua nilai:
```bash
cp .env.example .env
```

| Variable | Keterangan |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase web app config |
| `VITE_FIREBASE_PROJECT_ID` | Firebase web app config |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase web app config |
| `VITE_FIREBASE_APP_ID` | Firebase web app config |
| `VITE_FIREBASE_MEASUREMENT_ID` | Firebase web app config |
| `VITE_SECRET_CODE` | Kode rahasia untuk masuk (contoh: WB-PRIVATE-2026) |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud name Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Unsigned upload preset Cloudinary |

### 3. Firebase Setup
1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Buat project baru (atau gunakan yang sudah ada)
3. **Authentication**: Aktifkan **Anonymous** sign-in
4. **Firestore**: Buat database, deploy rules dari file `firestore.rules`
   ```bash
   firebase deploy --only firestore:rules
   ```
5. Salin konfigurasi web app ke `.env`

### 4. Cloudinary Setup
1. Daftar di [cloudinary.com](https://cloudinary.com) (gratis)
2. Settings → Upload → tambah **Unsigned Upload Preset**
3. Isi `VITE_CLOUDINARY_CLOUD_NAME` dan `VITE_CLOUDINARY_UPLOAD_PRESET`

### 5. Jalankan
```bash
pnpm dev
```

---

## Whitelist 2 UID

Secara default `firestore.rules` mengizinkan semua anonymous user yang login. Untuk membatasi hanya 2 orang:

1. Login di 2 perangkat berbeda menggunakan kode rahasia
2. Buka Firebase Console → Authentication → lihat 2 UID yang muncul
3. Edit `firestore.rules` — ganti `USER_1_UID` dan `USER_2_UID` dengan UID asli:
   ```
   allow read, write: if request.auth.uid == "uid-orang-pertama"
                      || request.auth.uid == "uid-orang-kedua";
   ```
4. Deploy rules: `firebase deploy --only firestore:rules`

---

## Upload ke GitHub

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/username/wb-chat.git
git push -u origin main
```

> ⚠️ Pastikan `.env` ada di `.gitignore` — jangan pernah push file `.env`!

---

## Deploy ke Vercel

### Cara 1 — Import dari GitHub (Disarankan)
1. Buka [vercel.com](https://vercel.com) → New Project → Import Git Repository
2. Pilih repo `wb-chat`
3. Vercel otomatis mendeteksi konfigurasi dari `vercel.json`
4. Buka **Environment Variables** dan tambahkan semua variabel dari `.env`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`
   - `VITE_SECRET_CODE`
   - `VITE_CLOUDINARY_CLOUD_NAME`
   - `VITE_CLOUDINARY_UPLOAD_PRESET`
5. Klik **Deploy**

### Override Settings di Vercel (jika perlu)
| Setting | Nilai |
|---|---|
| Framework Preset | **Other** |
| Build Command | `cd ../.. && pnpm --filter @workspace/wb-chat run build` |
| Output Directory | `artifacts/wb-chat/dist/public` |
| Install Command | `pnpm install` |

### Cara Redeploy
- Setiap `git push` ke branch `main` otomatis trigger redeploy
- Atau klik manual **Redeploy** di dashboard Vercel

---

## Struktur Project

```
src/
  firebase/       # config, auth, firestore
  cloudinary/     # uploader ke Cloudinary
  webrtc/         # WebRTC hook untuk video call
  hooks/          # useAuth, useChat, useTheme
  pages/          # LoginPage, ChatPage
  components/     # MessageBubble, VoiceRecorder, dll
  types/          # TypeScript types
```
