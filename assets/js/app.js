// ========================================================
// LOGIKA INTI: fetch API, render hasil — struktur data API tidak diubah
// ========================================================
const API_URL = "https://api.nexray.eu.cc/downloader/aio";

const urlInput = document.getElementById("urlInput");
const clearBtn = document.getElementById("clearBtn");
const pasteBtn = document.getElementById("pasteBtn");
const downloadBtn = document.getElementById("downloadBtn");
const statusBox = document.getElementById("statusBox");
const statusText = document.getElementById("statusText");
const errorBox = document.getElementById("errorBox");
const resultCard = document.getElementById("resultCard");
const previewWrapper = document.getElementById("previewWrapper");
const formatsGrid = document.getElementById("formatsGrid");
const resultTitle = document.getElementById("resultTitle");
const mediaAuthor = document.getElementById("mediaAuthor");
const gateNotice = document.getElementById("gateNotice");
const gateOpenBtn = document.getElementById("gateOpenBtn");

let isProcessing = false;

urlInput.addEventListener("input", () => {
  clearBtn.style.display = urlInput.value.trim() ? "flex" : "none";
});

clearBtn.addEventListener("click", () => {
  urlInput.value = "";
  clearBtn.style.display = "none";
  urlInput.focus();
});

pasteBtn.addEventListener("click", async () => {
  clearError();
  try {
    if (!navigator.clipboard || !navigator.clipboard.readText) {
      showError("⚠️ Browser Anda tidak mendukung penempelan otomatis. Silakan tahan lama kolom input lalu pilih Tempel.");
      return;
    }
    const text = await navigator.clipboard.readText();
    if (text && text.trim() !== "") {
      urlInput.value = text.trim();
      clearBtn.style.display = "flex";
      urlInput.focus();
    } else {
      showError("⚠️ Papan klip (clipboard) Anda kosong. Silakan salin tautan media terlebih dahulu.");
    }
  } catch (err) {
    showError("⚠️ Izin menempel ditolak atau tidak diizinkan oleh browser. Silakan izinkan akses papan klip pada browser Anda.");
  }
});

function showError(message) {
  errorBox.textContent = message;
  errorBox.style.display = "block";
}

function clearError() {
  errorBox.textContent = "";
  errorBox.style.display = "none";
}

function resetResult() {
  resultCard.style.display = "none";
  previewWrapper.innerHTML = "";
  formatsGrid.innerHTML = "";
}

function setLoading(loading, message = "Sedang memproses...") {
  isProcessing = loading;
  statusBox.style.display = loading ? "block" : "none";
  statusText.textContent = message;
  downloadBtn.disabled = loading;
  downloadBtn.textContent = loading ? "Memproses..." : "Unduh";
}

// Fallback tanpa membuka tab baru: memakai iframe tersembunyi,
// bukan window/tab baru.
function triggerBackgroundDownload(url) {
  const iframe = document.createElement("iframe");
  iframe.style.display = "none";
  iframe.src = url;
  document.body.appendChild(iframe);
  setTimeout(() => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  }, 8000);
}

// Coba ambil file beberapa kali sebelum menyerah — kegagalan fetch ke CDN
// pihak ketiga sering bersifat sementara (timeout/CORS sesaat), jadi retry
// otomatis di sini menghindari user harus klik tombol berkali-kali.
async function fetchBlobWithRetry(url, maxAttempts, onAttempt) {
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (onAttempt) onAttempt(attempt, maxAttempts);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      const response = await fetch(url, { method: "GET", mode: "cors", signal: controller.signal });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const blob = await response.blob();
      if (!blob || blob.size === 0) throw new Error("File kosong");
      return blob;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 600 * attempt));
      }
    }
  }
  throw lastError;
}

async function directDownloadFile(downloadUrl, fileName, button, fileType, thumbnailUrl) {
  const confirmed = confirm(`Apakah Anda yakin ingin mengunduh file ${fileType.toUpperCase()} ini?`);
  if (!confirmed) return;

  const originalText = button.innerHTML;
  button.disabled = true;
  button.innerHTML = "⏳ Sedang mengunduh...";

  try {
    const blob = await fetchBlobWithRetry(downloadUrl, 3, (attempt, max) => {
      if (attempt > 1) button.innerHTML = `⏳ Mencoba lagi (${attempt}/${max})...`;
    });

    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = fileName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);

    button.innerHTML = "✓ Sudah diunduh, cek folder Download";
    if (typeof addHistoryEntry === "function") addHistoryEntry(fileName, fileType, thumbnailUrl, downloadUrl);
    if (typeof touchLastActive === "function") touchLastActive();
  } catch (error) {
    // Semua percobaan gagal — tetap di halaman yang sama, tidak membuka tab baru
    triggerBackgroundDownload(downloadUrl);
    button.innerHTML = "Dibuka via unduhan latar, cek folder Download";
  }

  setTimeout(() => {
    button.innerHTML = originalText;
    button.disabled = false;
  }, 3500);
}

async function downloadSlideImage(url, index) {
  try {
    const blob = await fetchBlobWithRetry(url, 3);
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = `slide_${index}.jpg`;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      if (document.body.contains(link)) document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);
    if (typeof addHistoryEntry === "function") addHistoryEntry(`Slide ${index}`, "jpg", url, url);
    if (typeof touchLastActive === "function") touchLastActive();
  } catch {
    triggerBackgroundDownload(url);
  }
}

async function startDownload() {
  if (isProcessing) return;
  if (typeof isLoggedIn === "function" && !isLoggedIn()) {
    if (typeof openAuthModal === "function") openAuthModal();
    return;
  }

  const url = urlInput.value.trim();
  clearError();
  resetResult();

  if (!url) {
    showError("⚠️ Masukkan URL media terlebih dahulu.");
    return;
  }

  try {
    new URL(url);
  } catch {
    showError("⚠️ Format URL tidak valid. Pastikan diawali dengan http:// atau https://");
    return;
  }

  setLoading(true, "Sedang mengekstrak media...");

  try {
    const response = await fetch(`${API_URL}?url=${encodeURIComponent(url)}`);
    if (!response.ok) throw new Error("Gagal terhubung ke server API.");

    const data = await response.json();
    const payload = data.result || data.data || data;

    if (data.status === false || !payload) {
      throw new Error(data.message || "Media tidak ditemukan atau tautan tidak didukung.");
    }

    displayResult(payload);
  } catch (error) {
    console.error("API Error:", error);
    showError(error.message || "Terjadi kesalahan saat mengekstrak media.");
  } finally {
    setLoading(false);
  }
}

// Deteksi konten multi-slide (misal carousel foto Instagram)
function extractSlideImages(data) {
  const candidates = [data.slides, data.images, data.photos];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length > 1) {
      return candidate.map((it) => (typeof it === "string" ? it : (it.url || it.link || it.image))).filter(Boolean);
    }
  }
  const pool = [
    ...(Array.isArray(data.medias) ? data.medias : []),
    ...(Array.isArray(data.formats) ? data.formats : []),
    ...(Array.isArray(data.downloads) ? data.downloads : []),
  ];
  const photoItems = pool.filter((it) => {
    const t = String(it.type || it.quality || it.ext || it.extension || "").toLowerCase();
    return t.includes("image") || t.includes("photo") || t.includes("jpg") || t.includes("jpeg") || t.includes("png");
  });
  if (photoItems.length > 1) {
    return photoItems.map((it) => it.url || it.link).filter(Boolean);
  }
  return [];
}

function renderCarousel(images) {
  let current = 0;
  const wrap = document.createElement("div");
  wrap.className = "carousel";

  const imgEl = document.createElement("img");
  imgEl.className = "carousel-img";
  imgEl.src = images[0];
  imgEl.alt = "Slide 1";

  const prevBtn = document.createElement("button");
  prevBtn.type = "button";
  prevBtn.className = "carousel-nav carousel-prev";
  prevBtn.innerHTML = "‹";
  prevBtn.setAttribute("aria-label", "Slide sebelumnya");

  const nextBtn = document.createElement("button");
  nextBtn.type = "button";
  nextBtn.className = "carousel-nav carousel-next";
  nextBtn.innerHTML = "›";
  nextBtn.setAttribute("aria-label", "Slide berikutnya");

  const counter = document.createElement("div");
  counter.className = "carousel-counter";
  counter.textContent = `1 / ${images.length}`;

  function update() {
    imgEl.src = images[current];
    imgEl.alt = `Slide ${current + 1}`;
    counter.textContent = `${current + 1} / ${images.length}`;
    updateCurrentLabel();
  }

  function goPrev() { current = (current - 1 + images.length) % images.length; update(); }
  function goNext() { current = (current + 1) % images.length; update(); }

  prevBtn.onclick = goPrev;
  nextBtn.onclick = goNext;

  // Geser (swipe) langsung di gambar untuk pindah slide — tanpa perlu pencet panah.
  // Dipasang di imgEl saja (bukan di wrap) supaya tidak mengganggu klik tombol panah/unduh.
  imgEl.draggable = false;
  let swipeStartX = 0;
  let swipeStartY = 0;
  let isSwiping = false;
  const SWIPE_THRESHOLD = 45;

  imgEl.addEventListener("pointerdown", (e) => {
    isSwiping = true;
    swipeStartX = e.clientX;
    swipeStartY = e.clientY;
    try { imgEl.setPointerCapture(e.pointerId); } catch (err) {}
  });

  imgEl.addEventListener("pointerup", (e) => {
    if (!isSwiping) return;
    isSwiping = false;
    const deltaX = e.clientX - swipeStartX;
    const deltaY = e.clientY - swipeStartY;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) goNext(); else goPrev();
    }
  });

  imgEl.addEventListener("pointercancel", () => { isSwiping = false; });

  wrap.appendChild(imgEl);
  wrap.appendChild(prevBtn);
  wrap.appendChild(nextBtn);
  wrap.appendChild(counter);
  previewWrapper.appendChild(wrap);

  // Tombol: unduh slide yang sedang tampil
  const currentRow = document.createElement("div");
  currentRow.className = "option-row";
  const currentBtn = document.createElement("button");
  currentBtn.type = "button";
  currentBtn.className = "btn-option btn-option-photo";

  function updateCurrentLabel() {
    currentBtn.innerHTML = `Unduh Slide Ini (${current + 1}/${images.length})`;
  }
  updateCurrentLabel();

  currentBtn.onclick = async () => {
    const original = currentBtn.innerHTML;
    currentBtn.disabled = true;
    currentBtn.innerHTML = "⏳ Mengunduh...";
    await downloadSlideImage(images[current], current + 1);
    currentBtn.innerHTML = "Slide sudah diunduh";
    setTimeout(() => {
      currentBtn.innerHTML = original;
      currentBtn.disabled = false;
    }, 2000);
  };
  currentRow.appendChild(currentBtn);
  formatsGrid.appendChild(currentRow);

  // Tombol: unduh semua slide sekaligus, satu per satu
  const allRow = document.createElement("div");
  allRow.className = "option-row";
  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "btn-option btn-option-video";
  allBtn.innerHTML = `Unduh Semua Slide (${images.length})`;
  allBtn.onclick = async () => {
    const confirmed = confirm(`Unduh ${images.length} gambar slide ini?`);
    if (!confirmed) return;
    allBtn.disabled = true;
    const original = allBtn.innerHTML;
    for (let i = 0; i < images.length; i++) {
      allBtn.innerHTML = `Mengunduh ${i + 1}/${images.length}...`;
      await downloadSlideImage(images[i], i + 1);
      await new Promise((r) => setTimeout(r, 400));
    }
    allBtn.innerHTML = "Semua slide sudah diunduh";
    setTimeout(() => {
      allBtn.innerHTML = original;
      allBtn.disabled = false;
    }, 3000);
  };
  allRow.appendChild(allBtn);
  formatsGrid.appendChild(allRow);
}

function displayResult(data) {
  previewWrapper.innerHTML = "";
  formatsGrid.innerHTML = "";

  const title = data.title || data.caption || "Media Download";
  resultTitle.textContent = title;
  mediaAuthor.textContent = `👤 ${data.author || data.uploader || "Sumber Publik"}`;

  let mediaList = [];
  if (Array.isArray(data.formats)) mediaList = data.formats;
  else if (Array.isArray(data.medias)) mediaList = data.medias;
  else if (Array.isArray(data.downloads)) mediaList = data.downloads;
  else if (data.url || data.link) {
    mediaList = [{ url: data.url || data.link, quality: "1080p", ext: "mp4" }];
  }

  // Preview: carousel jika lebih dari satu slide, kalau tidak pakai thumbnail tunggal
  const slideImages = extractSlideImages(data);
  const thumbnail = data.thumbnail || data.thumb || data.cover || data.image;

  if (slideImages.length > 1) {
    renderCarousel(slideImages);
  } else if (thumbnail) {
    const image = document.createElement("img");
    image.className = "preview-media";
    image.src = thumbnail;
    image.alt = "Preview Media";
    previewWrapper.appendChild(image);
  } else {
    previewWrapper.innerHTML = `<div style="color:#9ca3af;font-size:13px;padding:30px;">Pratinjau tidak tersedia</div>`;
  }

  // Klasifikasikan tiap item (video/audio/foto) dan, khusus video, cari
  // peringkat resolusinya dari angka yang tersemat (1080, 720, 480, dst).
  // Ini supaya platform dengan banyak pilihan kualitas (YouTube: 144p-1080p+)
  // tetap dapat opsi terbaik, bukan sekadar item pertama yang cocok di array.
  function classifyMediaItem(item) {
    const quality = String(item.quality || item.resolution || item.type || item.label || "").toLowerCase();
    const extension = String(item.ext || item.extension || item.format || "").toLowerCase();
    const combined = `${quality} ${extension}`;

    const isPhoto = ["image", "photo", "jpg", "jpeg", "png", "webp"].some((k) => combined.includes(k));
    if (isPhoto) return { kind: "photo" };

    const isAudio = ["mp3", "m4a", "audio"].some((k) => combined.includes(k));
    if (isAudio) return { kind: "audio" };

    // Prioritas 1: angka resolusi eksplisit (720, 1080, dst) — umum di YouTube dkk
    const numMatch = combined.match(/(\d{3,4})/);
    if (numMatch) return { kind: "video", rank: parseInt(numMatch[1], 10) };

    // Prioritas 2: label teks tanpa angka (umum di TikTok: "hd" / "sd")
    if (combined.includes("fhd")) return { kind: "video", rank: 1080 };
    if (combined.includes("hd")) return { kind: "video", rank: 720 };
    if (combined.includes("sd") || combined.includes("low")) return { kind: "video", rank: 360 };

    return { kind: "video", rank: 0 };
  }

  const videoItems = [];
  const audioItems = [];
  const photoItems = [];

  mediaList.forEach((item) => {
    const downloadUrl = item.url || item.link;
    if (!downloadUrl) return;

    const cls = classifyMediaItem(item);
    if (cls.kind === "photo") {
      // Foto yang sudah tampil di carousel slide tidak perlu tombol duplikat di sini
      if (slideImages.length > 1) return;
      photoItems.push({ downloadUrl });
    } else if (cls.kind === "audio") {
      audioItems.push({ downloadUrl });
    } else {
      videoItems.push({ downloadUrl, rank: cls.rank });
    }
  });

  videoItems.sort((a, b) => b.rank - a.rank);

  const options = [];

  if (videoItems.length > 0) {
    const best = videoItems[0];
    options.push({
      downloadUrl: best.downloadUrl,
      label: best.rank > 0 ? `Unduh MP4 ${best.rank}p` : "Unduh MP4",
      type: "mp4",
      className: "btn-option-video",
    });

    // Kalau ada tingkat kualitas lain yang jelas beda (lebih ringan), tawarkan juga
    const lighter = videoItems.find((v) => v.rank > 0 && v.rank < best.rank);
    if (lighter) {
      options.push({
        downloadUrl: lighter.downloadUrl,
        label: `Unduh MP4 ${lighter.rank}p`,
        type: "mp4",
        className: "btn-option-video",
      });
    }
  }

  if (audioItems.length > 0) {
    options.push({ downloadUrl: audioItems[0].downloadUrl, label: "Unduh MP3", type: "mp3", className: "btn-option-audio" });
  }

  if (photoItems.length > 0) {
    options.push({ downloadUrl: photoItems[0].downloadUrl, label: "Unduh Foto", type: "jpg", className: "btn-option-photo" });
  }

  options.forEach(({ downloadUrl, label, type, className }) => {
    const row = document.createElement("div");
    row.className = "option-row";

    const button = document.createElement("button");
    button.className = `btn-option ${className}`;
    button.innerHTML = label;
    button.onclick = () => {
      const safeTitle = title.replace(/[^a-zA-Z0-9À-ÿ\s_-]/g, "").trim().replace(/\s+/g, "_").substring(0, 80);
      const fileName = `${safeTitle || "DownloaderHub"}.${type}`;
      directDownloadFile(downloadUrl, fileName, button, type, thumbnail);
    };

    row.appendChild(button);
    formatsGrid.appendChild(row);
  });

  if (formatsGrid.children.length === 0) {
    showError("⚠️ Tautan unduhan tidak dapat diekstrak dari respon API.");
    return;
  }

  resultCard.style.display = "block";
}

downloadBtn.addEventListener("click", startDownload);

urlInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    startDownload();
  }
});

// ========================================================
// PWA: tombol "Install App"
// ========================================================
let deferredPrompt;
let iosHintTimer;
const installBtn = document.getElementById("installBtn");
const iosHint = document.getElementById("iosHint");

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
}

function isStandaloneMode() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function markInstalled() {
  installBtn.disabled = true;
  installBtn.classList.add("btn-install-done");
  installBtn.innerHTML = "✓ Terpasang";
}

// Chrome / Edge / Android: tombol muncul lewat event resmi ini
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (!isStandaloneMode()) installBtn.style.display = "inline-flex";
});

// Kalau memang sudah terpasang & sedang dibuka sebagai app, tombol tetap
// tampil sebagai status "Terpasang" — bukan hilang begitu saja
if (isStandaloneMode()) {
  installBtn.style.display = "inline-flex";
  markInstalled();
} else if (isIOS()) {
  // Safari iOS tidak pernah memicu beforeinstallprompt, jadi tombol
  // ditampilkan manual dan mengarahkan ke langkah Share > Add to Home Screen
  installBtn.style.display = "inline-flex";
}

installBtn.addEventListener("click", async () => {
  if (installBtn.disabled) return;

  if (deferredPrompt) {
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (choice.outcome === "accepted") markInstalled();
    return;
  }

  // Tidak ada prompt otomatis tersedia (iOS Safari, atau prompt Chrome/Edge
  // sudah pernah dipakai sebelumnya) — selalu beri jalan manual sebagai
  // fallback, supaya tombol tidak pernah jadi dead-click.
  iosHint.style.display = "block";
  clearTimeout(iosHintTimer);
  iosHintTimer = setTimeout(() => { iosHint.style.display = "none"; }, 7000);
});

document.addEventListener("click", (event) => {
  if (iosHint.style.display === "block" && event.target !== installBtn && !iosHint.contains(event.target)) {
    iosHint.style.display = "none";
  }
});

window.addEventListener("appinstalled", markInstalled);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}

// ========================================================
// GATE AKSES: alat unduh terkunci sampai user Masuk/Daftar.
// Dipanggil ulang dari auth.js (renderAuthArea) tiap status login berubah.
// ========================================================
function applyAccessGate() {
  const loggedIn = typeof isLoggedIn === "function" && isLoggedIn();
  urlInput.disabled = !loggedIn;
  pasteBtn.disabled = !loggedIn;
  downloadBtn.disabled = !loggedIn;
  if (gateNotice) gateNotice.style.display = loggedIn ? "none" : "flex";
}

if (gateOpenBtn) {
  gateOpenBtn.addEventListener("click", () => {
    if (typeof openAuthModal === "function") openAuthModal();
  });
}

// State awal: terkunci secara default sampai Firebase memastikan status
// login yang sebenarnya (menghindari alat sempat "kebuka" sesaat).
applyAccessGate();
