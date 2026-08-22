// ========================================================
// AUTENTIKASI — Firebase Authentication (akun cloud sungguhan)
//
// Daftar, masuk, reset kata sandi via email, dan sesi login semuanya
// ditangani server Firebase — bukan lagi disimpan lokal di browser.
// Riwayat unduhan tetap disimpan lokal per perangkat (localStorage),
// tapi sekarang dikaitkan ke akun Firebase (UID), bukan username lokal.
// ========================================================

const firebaseConfig = {
  apiKey: "AIzaSyA45RBG0yg43MZv6tv-TWfgyk-OHcaPKpA",
  authDomain: "downloader-hub-kaj.firebaseapp.com",
  projectId: "downloader-hub-kaj",
  storageBucket: "downloader-hub-kaj.firebasestorage.app",
  messagingSenderId: "278820096923",
  appId: "1:278820096923:web:e2b613b6142736a0adaf3e",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// Bersihkan sisa data sistem lokal versi lama (sebelum pindah ke Firebase)
try {
  localStorage.removeItem("dlhub_profiles_v1");
  localStorage.removeItem("dlhub_session_v1");
} catch {}

const LAST_ACTIVE_KEY = "dlhub_last_active_v1";
const HAS_REGISTERED_KEY = "dlhub_has_account_v1";
const INACTIVITY_LIMIT_MS = 7 * 24 * 60 * 60 * 1000; // 7 hari
const HISTORY_PREFIX = "dlhub_history_v2_"; // v2: dikaitkan ke UID Firebase
const HISTORY_LIMIT = 50;

const authArea = document.getElementById("authArea");
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const modalCloseBtn = document.getElementById("modalCloseBtn");

let currentUser = null;
let hasCheckedInitialAuth = false;

function openModal(html) {
  modalContent.innerHTML = html;
  modalOverlay.classList.add("open");
}
function closeModal() {
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

function isLoggedIn() {
  return !!currentUser;
}

function touchLastActive() {
  try { localStorage.setItem(LAST_ACTIVE_KEY, String(Date.now())); } catch {}
}

function isInactiveTooLong() {
  try {
    const raw = localStorage.getItem(LAST_ACTIVE_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) > INACTIVITY_LIMIT_MS;
  } catch {
    return false;
  }
}

function markHasRegisteredBefore() {
  try { localStorage.setItem(HAS_REGISTERED_KEY, "1"); } catch {}
}
function hasRegisteredBefore() {
  try { return !!localStorage.getItem(HAS_REGISTERED_KEY); } catch { return false; }
}

function translateFirebaseError(code) {
  const map = {
    "auth/email-already-in-use": "Email ini sudah terdaftar. Coba menu Masuk, atau pakai email lain.",
    "auth/invalid-email": "Format email tidak valid.",
    "auth/weak-password": "Kata sandi terlalu lemah (minimal 6 karakter).",
    "auth/user-not-found": "Akun dengan email ini tidak ditemukan.",
    "auth/wrong-password": "Kata sandi salah.",
    "auth/invalid-credential": "Email atau kata sandi salah.",
    "auth/missing-password": "Kata sandi wajib diisi.",
    "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
    "auth/network-request-failed": "Gagal terhubung. Cek koneksi internet Anda.",
  };
  return map[code] || "Terjadi kesalahan. Coba lagi.";
}

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;

  const common = ["12345678", "password", "qwerty123", "11111111", "password123", "87654321", "abc12345"];
  if (common.includes(pw.toLowerCase())) score = 0;

  if (score <= 1) return { label: "Lemah", pct: 25, color: "var(--danger)" };
  if (score <= 3) return { label: "Sedang", pct: 60, color: "#f5b942" };
  return { label: "Kuat", pct: 100, color: "var(--success)" };
}

function renderAuthForm(tab) {
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
    <div class="auth-tabs">
      <button type="button" class="auth-tab ${tab === "login" ? "active" : ""}" data-tab="login">Masuk</button>
      <button type="button" class="auth-tab ${tab === "register" ? "active" : ""}" data-tab="register">Daftar</button>
    </div>
    <form id="loginForm" class="auth-form" style="${tab === "login" ? "" : "display:none;"}">
      <label for="loginEmail">Email</label>
      <input type="email" id="loginEmail" autocomplete="email" maxlength="120" required>
      <label for="loginPassword">Kata Sandi</label>
      <input type="password" id="loginPassword" autocomplete="current-password" maxlength="128" required>
      <label class="auth-checkbox">
        <input type="checkbox" id="loginRemember" checked>
        <span>Ingat saya di perangkat ini</span>
      </label>
      <button type="button" id="forgotPasswordBtn" class="auth-link-btn">Lupa sandi?</button>
      <div id="forgotPasswordNote" class="auth-note" style="display:none;"></div>
      <div id="loginError" class="auth-error"></div>
      <button type="submit" class="btn btn-download" style="width:100%;margin-top:16px;">Masuk</button>
    </form>
    <form id="registerForm" class="auth-form" style="${tab === "register" ? "" : "display:none;"}">
      <label for="registerEmail">Email</label>
      <input type="email" id="registerEmail" autocomplete="email" maxlength="120" required>
      <label for="registerPassword">Kata Sandi</label>
      <input type="password" id="registerPassword" autocomplete="new-password" maxlength="128" required minlength="8">
      <div class="strength-meter"><div id="strengthBar" class="strength-bar"></div></div>
      <div id="strengthLabel" class="strength-label">Minimal 8 karakter</div>
      <label for="registerPasswordConfirm">Ulangi Kata Sandi</label>
      <input type="password" id="registerPasswordConfirm" autocomplete="new-password" maxlength="128" required>
      <div id="registerError" class="auth-error"></div>
      <p class="auth-note">Akun ini akun cloud (Firebase) — bisa dipakai masuk dari perangkat lain, dan kata sandi bisa direset lewat email kalau lupa.</p>
      <button type="submit" class="btn btn-download" style="width:100%;margin-top:6px;">Daftar</button>
    </form>
  `;
}

function wireAuthForm() {
  const tabs = modalContent.querySelectorAll(".auth-tab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      const isLogin = tab.dataset.tab === "login";
      loginForm.style.display = isLogin ? "" : "none";
      registerForm.style.display = isLogin ? "none" : "";
      document.getElementById("loginError").style.display = "none";
      document.getElementById("registerError").style.display = "none";
      document.getElementById("forgotPasswordNote").style.display = "none";
      (isLogin ? loginForm : registerForm).querySelector("input").focus();
    });
  });

  const pwInput = document.getElementById("registerPassword");
  const strengthBar = document.getElementById("strengthBar");
  const strengthLabel = document.getElementById("strengthLabel");
  pwInput.addEventListener("input", () => {
    if (!pwInput.value) {
      strengthBar.style.width = "0%";
      strengthLabel.textContent = "Minimal 8 karakter";
      return;
    }
    const result = scorePassword(pwInput.value);
    strengthBar.style.width = result.pct + "%";
    strengthBar.style.background = result.color;
    strengthLabel.textContent = `Kekuatan kata sandi: ${result.label}`;
  });

  const forgotBtn = document.getElementById("forgotPasswordBtn");
  const forgotNote = document.getElementById("forgotPasswordNote");
  forgotBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    if (!email) {
      forgotNote.textContent = 'Isi dulu email di atas, baru tap "Lupa sandi?".';
      forgotNote.style.display = "block";
      return;
    }
    const original = forgotBtn.textContent;
    forgotBtn.disabled = true;
    forgotBtn.textContent = "Mengirim...";
    try {
      await auth.sendPasswordResetEmail(email);
      forgotNote.textContent = `Link reset kata sandi sudah dikirim ke ${email}. Cek inbox (atau folder spam).`;
      forgotNote.style.display = "block";
    } catch (err) {
      console.error("Firebase Auth error:", err.code, err.message);
      forgotNote.textContent = translateFirebaseError(err.code);
      forgotNote.style.display = "block";
    } finally {
      forgotBtn.disabled = false;
      forgotBtn.textContent = original;
    }
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("loginError");
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    errorBox.style.display = "none";
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("loginRemember").checked;

    submitBtn.disabled = true;
    try {
      await auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
      await auth.signInWithEmailAndPassword(email, password);
      markHasRegisteredBefore();
      touchLastActive();
      closeModal();
    } catch (err) {
      console.error("Firebase Auth error:", err.code, err.message);
      errorBox.textContent = translateFirebaseError(err.code);
      errorBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("registerError");
    errorBox.style.display = "none";
    const email = document.getElementById("registerEmail").value.trim();
    const password = document.getElementById("registerPassword").value;
    const confirmPw = document.getElementById("registerPasswordConfirm").value;

    if (password.length < 8) {
      errorBox.textContent = "Kata sandi minimal 8 karakter.";
      errorBox.style.display = "block";
      return;
    }
    if (password !== confirmPw) {
      errorBox.textContent = "Konfirmasi kata sandi tidak cocok.";
      errorBox.style.display = "block";
      return;
    }

    const submitBtn = registerForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    try {
      await auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      await auth.createUserWithEmailAndPassword(email, password);
      markHasRegisteredBefore();
      touchLastActive();
      closeModal();
    } catch (err) {
      console.error("Firebase Auth error:", err.code, err.message);
      errorBox.textContent = translateFirebaseError(err.code);
      errorBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function openAuthModal(tab) {
  openModal(renderAuthForm(tab || (hasRegisteredBefore() ? "login" : "register")));
  wireAuthForm();
  const firstInput = modalContent.querySelector("input");
  if (firstInput) firstInput.focus();
}

function getHistory(uid) {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_PREFIX + uid)) || [];
  } catch {
    return [];
  }
}

function addHistoryEntry(title, type, thumbnail, url) {
  if (!currentUser) return;
  try {
    const history = getHistory(currentUser.uid);
    history.unshift({ title, type, time: Date.now(), thumbnail: thumbnail || null, url: url || null });
    if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;
    localStorage.setItem(HISTORY_PREFIX + currentUser.uid, JSON.stringify(history));
  } catch {}
}

function formatRelativeTime(ts) {
  const diffMin = Math.floor((Date.now() - ts) / 60000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return `${Math.floor(diffHour / 24)} hari lalu`;
}

function badgeColor(type) {
  if (type === "mp3") return "var(--signal-mint)";
  if (type === "jpg") return "#475569";
  return "var(--signal)";
}

function renderHistoryModal() {
  const history = currentUser ? getHistory(currentUser.uid) : [];

  const items = history.length
    ? history.map((h, idx) => {
        const canPlay = (h.type === "mp4" || h.type === "mp3") && h.url;
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
                <span>${formatRelativeTime(h.time)}</span>
                <span class="history-item-badge" style="background:${badgeColor(h.type)}">${escapeHtml(String(h.type).toUpperCase())}</span>
              </div>
            </div>
            ${canPlay ? `<button class="history-play-btn" type="button" data-idx="${idx}">▶</button>` : ""}
          </div>
          ${canPlay ? `<div class="history-player" id="historyPlayer${idx}"></div>` : ""}
        `;
      }).join("")
    : `<div class="history-empty">Belum ada riwayat unduhan.</div>`;

  openModal(`
    <h3>Riwayat Unduhan</h3>
    <div id="historyList" class="history-list">${items}</div>
    ${history.length ? `<button id="clearHistoryBtn" class="btn btn-paste" style="width:100%;margin-top:14px;">Hapus Riwayat</button>` : ""}
  `);

  modalContent.querySelectorAll(".history-play-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = Number(btn.dataset.idx);
      const entry = history[idx];
      const player = document.getElementById("historyPlayer" + idx);
      if (!player || !entry) return;

      const isOpen = player.style.display === "block";
      if (isOpen) {
        player.style.display = "none";
        player.innerHTML = "";
        btn.textContent = "▶";
        return;
      }

      player.innerHTML = "";
      const mediaEl = document.createElement(entry.type === "mp3" ? "audio" : "video");
      mediaEl.controls = true;
      mediaEl.src = entry.url;
      mediaEl.style.width = "100%";
      mediaEl.style.display = "block";
      if (entry.type !== "mp3") mediaEl.style.maxHeight = "220px";
      mediaEl.onerror = () => {
        player.innerHTML = `<div class="history-player-error">Link media ini sudah kedaluwarsa — unduh ulang dari tautan aslinya untuk mendapat link baru.</div>`;
      };
      player.appendChild(mediaEl);
      player.style.display = "block";
      btn.textContent = "❚❚";
      mediaEl.play().catch(() => {});
    });
  });

  const clearBtn = document.getElementById("clearHistoryBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const confirmed = confirm("Hapus semua riwayat unduhan di perangkat ini?");
      if (!confirmed) return;
      try { localStorage.removeItem(HISTORY_PREFIX + currentUser.uid); } catch {}
      renderHistoryModal();
    });
  }
}

function renderAuthArea() {
  if (!currentUser) {
    authArea.innerHTML = `<button id="loginOpenBtn" class="btn-auth" type="button">Masuk</button>`;
    document.getElementById("loginOpenBtn").addEventListener("click", () => openAuthModal());
  } else {
    const displayName = currentUser.email.split("@")[0];
    authArea.innerHTML = `
      <div class="user-chip">
        <button id="userMenuBtn" class="user-name" type="button">👤 ${escapeHtml(displayName)} ▾</button>
        <div id="userMenu" class="user-menu">
          <button id="historyOpenBtn" type="button">📜 Riwayat</button>
          <button id="logoutBtn" type="button">🚪 Keluar</button>
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
    document.getElementById("logoutBtn").addEventListener("click", () => {
      menu.classList.remove("open");
      auth.signOut();
    });
  }
  if (typeof applyAccessGate === "function") applyAccessGate();
}

// Tutup dropdown akun kalau klik di luar area itu, atau tekan Escape
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

// Sumber kebenaran tunggal untuk status login: setiap kali Firebase
// mendeteksi perubahan (masuk, keluar, atau sesi tersimpan ditemukan
// saat halaman dibuka), UI diperbarui dari sini.
auth.onAuthStateChanged((user) => {
  currentUser = user;

  if (user) {
    if (isInactiveTooLong()) {
      // Tidak aktif lebih dari 7 hari — paksa keluar, minta masuk ulang
      auth.signOut();
      return; // onAuthStateChanged akan terpanggil lagi dengan user = null
    }
    touchLastActive();
  }

  renderAuthArea();

  if (!hasCheckedInitialAuth) {
    hasCheckedInitialAuth = true;
    if (!user) openAuthModal();
  }
});

// Perbarui "terakhir aktif" tiap kali tab ini dipakai lagi, supaya sesi
// tidak kedaluwarsa selama masih dibuka dalam 7 hari terakhir
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && currentUser) touchLastActive();
});
