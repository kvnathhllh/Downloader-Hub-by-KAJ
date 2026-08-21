

```markdown
# ⚡ Downloader Hub — by KAJ

![Status](https://img.shields.io/badge/status-aktif-17c79a)
![Stack](https://img.shields.io/badge/stack-HTML%20%2F%20CSS%20%2F%20JS-2f6fed)
![PWA](https://img.shields.io/badge/PWA-installable-2f6fed)

**Downloader Hub** adalah aplikasi web *All-in-One Downloader* — solusi praktis untuk mengunduh beragam konten dari satu tempat: media sosial (TikTok, Instagram, X, dsb), platform streaming (YouTube), musik (Spotify, SoundCloud, Apple Music, dsb), hingga cloud storage (MediaFire, Mega). Bertema dark ala dashboard teknis, bukan sekadar landing page biasa.

---

## 🌟 Fitur Utama

- **⚡ Direct Fast Save** — unduh langsung tanpa proses bertingkat atau iklan mengganggu, dengan retry otomatis kalau percobaan pertama gagal (CORS/timeout sesaat ke CDN pihak ketiga).
- **📋 Auto-Paste** — memicu izin papan klip (*clipboard*) browser untuk menempelkan URL secara instan.
- **🎵 Berbagai Pilihan Format** — MP4 / MP4 HD, MP3, dan Foto (JPG).
- **🖼️ Pratinjau Media & Slide** — thumbnail biasa, atau carousel geser (*swipe*) untuk konten multi-slide (mis. carousel Instagram) — bisa unduh satu slide yang sedang tampil atau semua sekaligus.
- **📲 Bisa Dipasang sebagai App (PWA)** — tombol Install di header, statusnya tetap terlihat setelah terpasang.
- **👤 Profil Lokal & Riwayat** — Masuk/Daftar dengan email/username, riwayat unduhan tersimpan otomatis (lihat catatan penting di bawah).
- **📱 Desain Responsif** — optimal di desktop maupun mobile.

---

## 📁 Struktur Proyek

Proyek ini **multi-file**, bukan HTML tunggal — semua berkas di bawah wajib ada dan tetap di posisi relatif yang sama:

```
├── index.html
├── manifest.json
├── sw.js
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        ├── app.js
        └── auth.js
```

`index.html` memuat `style.css` dan kedua file JS lewat path relatif (`./assets/...`). Kalau strukturnya dipisah atau diacak saat upload, tampilan dan fungsinya bisa rusak.

---

## 🚀 Cara Menjalankan

### 1. Langsung Lewat Browser
Klik ganda `index.html`. Fitur unduh utama (tempel URL, ekstrak, unduh) tetap berfungsi. Tapi untuk fitur **Install App (PWA)**, browser mewajibkan halaman diakses lewat `http(s)://`, bukan file lokal — jadi tombol Install tidak akan aktif dengan cara ini.

### 2. Lewat Local Web Server (disarankan, biar semua fitur bisa dites)
`localhost` dianggap browser sebagai konteks aman, jadi semua fitur termasuk Install App bisa dites normal:

- **Python 3:**
  ```bash
  python -m http.server 8000
  ```
  Buka `http://localhost:8000`.

- **Node.js:**
  ```bash
  npx serve .
  ```

- **VS Code Live Server:** klik **Go Live** di pojok bawah editor.

---

## ✏️ Kustomisasi

- **Ganti API backend** — buka `assets/js/app.js`, ubah variabel di baris paling atas:
  ```javascript
  const API_URL = "https://api.nexray.eu.cc/downloader/aio";
  ```
- **Ganti nama `index.html`** — sebaiknya **jangan**, kecuali kamu juga update referensinya di dua tempat: `start_url` pada `manifest.json`, dan daftar `SHELL_FILES` di `sw.js`. Kalau salah satu kelewat, PWA/offline shell jadi nggak sinkron.
- **Ganti warna/tema** — semua warna terpusat sebagai CSS variable di bagian atas `assets/css/style.css` (`--signal`, `--signal-mint`, `--ink`, dst).

---

## ⚠️ Catatan Penting — soal fitur Login

Sistem Masuk/Daftar di aplikasi ini **bukan akun cloud**. Tidak ada server/database di baliknya — semua data (username, kata sandi yang sudah di-*hash* + *salt*, riwayat unduhan) tersimpan lokal lewat `localStorage`, **di browser/perangkat itu saja**. Ganti browser atau perangkat berarti akun tidak ikut pindah, dan siapa pun yang punya akses fisik ke perangkat tersebut secara teknis bisa membuka DevTools untuk melihat data itu.

Cocok untuk personalisasi ringan & riwayat unduhan pribadi — **bukan** untuk kasus yang butuh akun benar-benar aman lintas perangkat. Untuk itu, dibutuhkan backend sungguhan (mis. Supabase/Firebase Auth atau server custom).

---

## ⚠️ Aturan Pakai (Credit Requirement)

Mau *rename* atau pakai ulang proyek ini? Silakan! Tapi ingat aturan mainnya:

- ❌ **Dilarang keras** menghapus copyright / nama penulis asli.
- ✅ **Wajib** mencantumkan link repositori original ini di README kamu.

*Hargai karya orang lain sebagaimana kamu mau karyamu dihargai.* 🤝

---

## 🌐 Panduan Deploy

Semua opsi di bawah mendukung hosting statis multi-file tanpa build step, dan otomatis pakai HTTPS — jadi Install App & login jalan penuh:

1. **Vercel / Netlify / Cloudflare Pages** — hubungkan repositori GitHub, pilih folder root proyek, deploy tanpa konfigurasi tambahan.
2. **GitHub Pages** — push kode ke GitHub, masuk **Settings → Pages**, pilih branch `main`, simpan.

---

## 📜 Hak Cipta & Kredit

```text
Copyright © 2026 Downloader Hub. All rights reserved.
Created & Maintained by KAJ.
```

> **Catatan:** Penggunaan API pihak ketiga tunduk pada kebijakan dan ketentuan dari penyedia layanan backend masing-masing.
```
