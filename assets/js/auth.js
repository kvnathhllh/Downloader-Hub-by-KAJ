// ========================================================
// PROFIL NAMA (tanpa akun/password) + RIWAYAT UNDUHAN
//
// Tidak ada sistem login sama sekali. Sebelum mengunduh file pertama
// kali, pengguna diminta memasukkan nama lewat popup sekali saja —
// nama itu disimpan di localStorage perangkat ini dan dipakai untuk
// memberi label riwayat ("Riwayat <nama>"). Riwayat menyimpan
// thumbnail, tanggal & jam persis, link asli, dan bisa diputar ulang
// maupun diunduh ulang langsung dari situ.
//
// Riwayat sendiri MILIK PERANGKAT (bukan per-nama) — supaya ganti
// nama tidak menghilangkan riwayat yang sudah ada.
// ========================================================

const USERNAME_KEY = "dlhub_username_v1";
const HISTORY_KEY = "dlhub_history_v3";
const HISTORY_LIMIT = 50;

const authArea = document.getElementById("authArea");
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const modalCloseBtn = document.getElementById("modalCloseBtn");

function cleanupHistoryPlayers() {
  // Bersihkan blob URL video/audio riwayat yang mungkin masih aktif,
  // supaya tidak ada kebocoran memori setiap kali isi modal diganti —
  // baik karena ditutup, maupun karena di-refresh (mis. setelah unduh ulang).
  modalContent.querySelectorAll(".history-player[data-blob-url]").forEach((p) => {
    URL.revokeObjectURL(p.dataset.blobUrl);
  });
}

function openModal(html) {
  cleanupHistoryPlayers();
  modalContent.innerHTML = html;
  modalOverlay.classList.add("open");
}
function closeModal() {
  cleanupHistoryPlayers();
  modalOverlay.classList.remove("open");
  modalContent.innerHTML = "";
}
modalCloseBtn.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modalOverlay.classList.contains("open")) closeModal();
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str == null ? "" : String(str);
  return div.innerHTML;
}

// ========================================================
// NAMA PENGGUNA (bukan akun — cuma label lokal)
// ========================================================
function getUsername() {
  try { return localStorage.getItem(USERNAME_KEY) || null; } catch { return null; }
}

function setUsername(name) {
  try { localStorage.setItem(USERNAME_KEY, name); } catch {}
  renderAuthArea();
}

function renderUsernameFormHtml(title, note, submitLabel, currentValue) {
  return `
    <div class="modal-brand">
      <img
        src="https://cdn.phototourl.com/free/2026-07-21-89e694b0-1b75-4e80-9292-c28626f827e2.png"
        alt="KAJ Logo"
        class="modal-brand-logo"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='grid';"
      >
      <div class="modal-brand-fallback" style="display:none;">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m0 0l-4-4m4 4l4-4M5 20h14"/></svg>
      </div>
      <div class="modal-brand-text">Downloader Hub</div>
      <div class="modal-brand-sub">by KAJ</div>
    </div>
    <h3>${title}</h3>
    <p class="auth-note" style="margin-top:0;">${note}</p>
    <form id="usernameForm" class="auth-form">
      <label for="usernameInput">Nama</label>
      <input type="text" id="usernameInput" maxlength="30" placeholder="Contoh: Krim" value="${escapeHtml(currentValue || "")}" required>
      <div id="usernameError" class="auth-error"></div>
      <button type="submit" class="btn btn-download" style="width:100%;margin-top:16px;">${submitLabel}</button>
    </form>
  `;
}

function wireUsernameForm(onSaved) {
  const form = document.getElementById("usernameForm");
  const input = document.getElementById("usernameInput");
  input.focus();
  input.select();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = input.value.trim();
    const errorBox = document.getElementById("usernameError");
    if (!name) {
      errorBox.textContent = "Nama tidak boleh kosong.";
      errorBox.style.display = "block";
      return;
    }
    setUsername(name);
    closeModal();
    if (onSaved) onSaved(name);
  });
}

// Dipanggil sebelum unduhan dimulai. Kalau nama SUDAH ada, return true
// (boleh lanjut unduh). Kalau BELUM ada, tampilkan popup dan return
// false — pengguna cukup klik tombol unduh sekali lagi setelah mengisi
// nama (jauh lebih sederhana & aman daripada mencoba auto-lanjut).
function requireUsername() {
  if (getUsername()) return true;

  openModal(renderUsernameFormHtml(
    "Siapa Nama Anda?",
    "Nama ini dipakai untuk menandai riwayat unduhan Anda di perangkat ini. Cukup diisi sekali.",
    "Simpan & Lanjutkan"
  ));
  wireUsernameForm();
  return false;
}

function openChangeNameModal() {
  openModal(renderUsernameFormHtml(
    "Ganti Nama",
    "Riwayat unduhan yang sudah ada tidak akan hilang saat nama diganti.",
    "Simpan",
    getUsername()
  ));
  wireUsernameForm();
}

// ========================================================
// RIWAYAT UNDUHAN — milik perangkat, dilabeli nama saat ini
// ========================================================
function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
  } catch {
    return [];
  }
}

function addHistoryEntry(title, type, thumbnail, url) {
  try {
    const history = getHistory();
    history.unshift({ title, type, time: Date.now(), thumbnail: thumbnail || null, url: url || null });
    if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

function formatDateTime(ts) {
  const d = new Date(ts);
  const datePart = d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const timePart = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${datePart}, ${timePart}`;
}

function badgeColor(type) {
  if (type === "mp3") return "var(--signal-mint)";
  if (type === "jpg") return "#475569";
  return "var(--signal)";
}

function renderHistoryModal() {
  const history = getHistory();
  const nameLabel = escapeHtml(getUsername() || "Anda");

  const items = history.length
    ? history.map((h, idx) => {
        const canPlay = (h.type === "mp4" || h.type === "mp3") && h.url;
        const canDownload = !!h.url;
        const fallbackIcon = h.type === "mp3" ? "🎵" : h.type === "jpg" ? "🖼️" : "🎬";
        const thumbHtml = h.thumbnail
          ? `<img src="${escapeHtml(h.thumbnail)}" alt="" class="history-thumb-img" loading="lazy">`
          : fallbackIcon;
        return `
          <div class="history-item">
            <div class="history-thumb">${thumbHtml}</div>
            <div class="history-item-body">
              <div class="history-item-title">${escapeHtml(h.title)}</div>
              <div class="history-item-meta">
                <span>${formatDateTime(h.time)}</span>
                <span class="history-item-badge" style="background:${badgeColor(h.type)}">${escapeHtml(String(h.type).toUpperCase())}</span>
              </div>
            </div>
            <div class="history-item-actions">
              ${canPlay ? `<button class="history-play-btn" type="button" data-idx="${idx}" title="Putar" aria-label="Putar">▶</button>` : ""}
              ${canDownload ? `<button class="history-download-btn" type="button" data-idx="${idx}" title="Unduh lagi" aria-label="Unduh lagi">⬇</button>` : ""}
            </div>
          </div>
          ${canPlay ? `<div class="history-player" id="historyPlayer${idx}"></div>` : ""}
        `;
      }).join("")
    : `<div class="history-empty">Belum ada riwayat unduhan.</div>`;

  openModal(`
    <h3>Riwayat ${nameLabel}</h3>
    <div id="historyList" class="history-list">${items}</div>
    ${history.length ? `<button id="clearHistoryBtn" class="btn btn-paste" style="width:100%;margin-top:14px;">Hapus Riwayat</button>` : ""}
  `);

  // Tombol Play — fetch dulu jadi blob (bukan streaming langsung dari CDN
  // asli yang sering diblokir anti-hotlink), baru diputar
  modalContent.querySelectorAll(".history-play-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idx = Number(btn.dataset.idx);
      const entry = history[idx];
      const player = document.getElementById("historyPlayer" + idx);
      if (!player || !entry) return;

      const isOpen = player.style.display === "block";
      if (isOpen) {
        player.style.display = "none";
        if (player.dataset.blobUrl) {
          URL.revokeObjectURL(player.dataset.blobUrl);
          delete player.dataset.blobUrl;
        }
        player.innerHTML = "";
        btn.textContent = "▶";
        return;
      }

      player.innerHTML = `<div class="history-player-error"><span class="btn-spinner" style="border-top-color:var(--signal);border-color:var(--line);"></span>Memuat...</div>`;
      player.style.display = "block";
      btn.textContent = "❚❚";

      try {
        const blob = typeof fetchBlobWithRetry === "function"
          ? await fetchBlobWithRetry(entry.url, 2)
          : await fetch(entry.url).then((r) => { if (!r.ok) throw new Error("fail"); return r.blob(); });
        const blobUrl = URL.createObjectURL(blob);
        player.dataset.blobUrl = blobUrl;

        player.innerHTML = "";
        const mediaEl = document.createElement(entry.type === "mp3" ? "audio" : "video");
        mediaEl.controls = true;
        mediaEl.src = blobUrl;
        mediaEl.style.width = "100%";
        mediaEl.style.display = "block";
        if (entry.type !== "mp3") mediaEl.style.maxHeight = "220px";
        player.appendChild(mediaEl);
        mediaEl.play().catch(() => {});
      } catch {
        player.innerHTML = `<div class="history-player-error">Link media ini sudah kedaluwarsa — coba unduh ulang lewat tombol ⬇.</div>`;
        btn.textContent = "▶";
      }
    });
  });

  // Tombol Unduh lagi — pakai ulang fungsi download utama dari app.js
  modalContent.querySelectorAll(".history-download-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const idx = Number(btn.dataset.idx);
      const entry = history[idx];
      if (!entry) return;
      if (typeof directDownloadFile === "function") {
        await directDownloadFile(entry.url, entry.title, btn, entry.type, entry.thumbnail);
        // Refresh daftar supaya entry baru & urutan terbaru langsung kelihatan
        if (modalOverlay.classList.contains("open")) renderHistoryModal();
      }
    });
  });

  const clearBtn = document.getElementById("clearHistoryBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const confirmed = confirm("Hapus semua riwayat unduhan di perangkat ini?");
      if (!confirmed) return;
      try { localStorage.removeItem(HISTORY_KEY); } catch {}
      renderHistoryModal();
    });
  }
}

// ========================================================
// HEADER: dropdown nama (Riwayat / Ganti Nama)
// ========================================================
function renderAuthArea() {
  const name = getUsername();

  if (!name) {
    authArea.innerHTML = "";
    return;
  }

  authArea.innerHTML = `
    <div class="user-chip">
      <button id="userMenuBtn" class="user-name" type="button">👤 ${escapeHtml(name)} ▾</button>
      <div id="userMenu" class="user-menu">
        <button id="historyOpenBtn" type="button">📜 Riwayat</button>
        <button id="changeNameOpenBtn" type="button">✏️ Ganti Nama</button>
      </div>
    </div>
  `;
  const menuBtn = document.getElementById("userMenuBtn");
  const menu = document.getElementById("userMenu");
  menuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
  });
  document.getElementById("historyOpenBtn").addEventListener("click", () => {
    menu.classList.remove("open");
    renderHistoryModal();
  });
  document.getElementById("changeNameOpenBtn").addEventListener("click", () => {
    menu.classList.remove("open");
    openChangeNameModal();
  });
}

// Tutup dropdown nama kalau klik di luar area itu, atau tekan Escape
document.addEventListener("click", (e) => {
  const menu = document.getElementById("userMenu");
  if (menu && menu.classList.contains("open") && !menu.contains(e.target) && e.target.id !== "userMenuBtn") {
    menu.classList.remove("open");
  }
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const menu = document.getElementById("userMenu");
  if (menu) menu.classList.remove("open");
});

renderAuthArea();
