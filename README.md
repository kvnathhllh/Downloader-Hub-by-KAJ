# ⚡ Downloader Hub — by KAJ

**Downloader Hub** adalah aplikasi web serbaguna (*All-in-One Downloader*) dengan antarmuka modern berdesain *glassmorphism*. Aplikasi ini memungkinkan pengguna untuk mengunduh media (video/audio) dari berbagai platform populer seperti TikTok, Instagram, YouTube, dan lainnya dengan cepat dan mudah.

---

## 🌟 Fitur Utama

* **⚡ Direct Fast Save:** Pengunduhan langsung tanpa proses bertingkat atau iklan mengganggu.
* **📋 Penempelan Otomatis (Auto-Paste):** Memicu izin papan klip (*clipboard*) browser untuk menempelkan URL secara instan.
* **🎵 Berbagai Pilihan Format:** Dukungan unduhan format video (MP4 / MP4 HD) dan audio (MP3).
* **🔗 Direct Link Copy:** Fitur untuk menyalin tautan unduhan langsung yang dapat digunakan pada *download manager* eksternal seperti IDM atau ADM.
* **🖼️ Pratinjau Media:** Menampilkan *thumbnail* dan detail media sebelum diunduh.
* **📱 Desain Responsif:** Tampilan optimal di perangkat *desktop* maupun *mobile*.

---

## 🚀 Cara Menjalankan

Karena proyek ini menggunakan teknologi murni HTML, CSS, dan JavaScript (*client-side*), Anda dapat menjalankannya di lingkungan apa pun yang mendukung file HTML atau via server lokal terminal.

### 1. Langsung Lewat Browser
Cukup klik ganda file `index.html` (atau buka file HTML tersebut melalui browser pilihan Anda).

### 2. Menggunakan Terminal / Local Web Server
Anda bisa menjalankan file ini menggunakan berbagai perintah HTTP server di terminal:

* **Menggunakan Python 3:**
  ```bash
  python -m http.server 8000

```
Lalu buka http://localhost:8000 di browser Anda.
 * **Menggunakan Node.js (serve / npx):**
   ```bash
   npx serve .
   
   ```
 * **Menggunakan Live Server (Extension VS Code):**
   Klik tombol **Go Live** pada bagian bawah editor VS Code.
## ✏️ Mengubah Nama File & Kustomisasi
Anda bebas mengubah nama file HTML ini sesuai kebutuhan:
 * Rename file index.html menjadi downloader.html, app.html, atau nama pilihan Anda.
 * Untuk mengubah API backend, buka script bagian bawah dan ubah variabel API_URL:
   ```javascript
   const API_URL = "[https://api.nexray.eu.cc/downloader/aio](https://api.nexray.eu.cc/downloader/aio)";
 * Rename kode yang ada
 * dll
   

## ⚠️ Aturan Pakai (Credit Requirement)

Mau *rename* atau pakaikan ulang project ini? Silakan! Tapi ingat aturan mainnya:
* ❌ **Dilarang keras** menghapus copyright / nama penulis asli.
* ✅ **Wajib** mencantumkan link repositori original ini di file README kamu.

*Hargai karya orang lain sebagaimana kamu mau karyamu dihargai.* 🤝

## 🌐 Panduan Deploy
Aplikasi ini dapat dengan mudah dideploy ke berbagai layanan *static web hosting* gratis:
 1. **GitHub Pages:**
   * *Push* kode ke repositori GitHub.
   * Masuk ke **Settings > Pages**, pilih branch main/master, lalu simpan.
 2. **Vercel / Netlify / Cloudflare Pages:**
   * Hubungkan repositori GitHub Anda ke platform pilihan.
   * Pilih folder utama dan jalankan proses *deploy* tanpa perlu konfigurasi *build step*.
## 📜 Hak Cipta & Kredit (Copyright)
```text
Copyright © 2026 Downloader Hub. All rights reserved.
Created & Maintained by KAJ.

```
> **Catatan:** Penggunaan API pihak ketiga tunduk pada kebijakan dan ketentuan dari penyedia layanan backend masing-masing.
> 
