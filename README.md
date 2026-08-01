# WB Chat

## Cara upload ke GitHub (pakai GitHub Desktop, tanpa command line)

1. Install GitHub Desktop: https://desktop.github.com — install, login pakai akun GitHub kamu.
2. Extract folder ini dari zip.
3. Di GitHub Desktop: **File → Add Local Repository** → pilih folder ini → klik **"create a repository"** → **Create Repository**.
4. Isi kolom pesan commit bebas (misal "upload chat") → klik **Commit to main**.
5. Klik **Publish repository** di kanan atas → kasih nama → **Publish**.

## Cara deploy ke Vercel

1. Buka vercel.com → **Add New → Project** → pilih repo yang barusan di-publish.
2. **Root Directory**: biarkan default (folder ini adalah root-nya, tidak perlu diubah).
3. Sebelum klik Deploy, buka bagian **Environment Variables**, isi 10 variable ini (nilainya dari project Firebase & Cloudinary kamu):
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
4. Klik **Deploy**.

Kalau ada tulisan merah/error saat deploy, screenshot bagian **Build Logs** dan kirim ke saya.
