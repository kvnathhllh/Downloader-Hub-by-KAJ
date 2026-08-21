// ========================================================
// PROFIL LOKAL (Masuk/Daftar) & RIWAYAT UNDUHAN
//
// PENTING — batasan yang jujur perlu diketahui:
// Ini BUKAN sistem akun cloud/aman. Tidak ada server di balik ini.
// Username dan kata sandi (yang di-hash + salt, bukan plain text)
// serta riwayat unduhan HANYA tersimpan di localStorage browser ini,
// di perangkat ini saja. Ganti browser/device = akun tidak ikut.
// Siapa pun yang punya akses ke perangkat ini secara teknis bisa
// membuka DevTools dan melihat/mengubah data ini. Untuk akun yang
// benar-benar aman & lintas perangkat, dibutuhkan backend + database
// sungguhan (mis. Supabase/Firebase Auth atau server custom).
// ========================================================

const AUTH_PROFILES_KEY = "dlhub_profiles_v1";
const AUTH_SESSION_KEY = "dlhub_session_v1";
const HISTORY_PREFIX = "dlhub_history_v1_";
const HISTORY_LIMIT = 50;

const authArea = document.getElementById("authArea");
const modalOverlay = document.getElementById("modalOverlay");
const modalContent = document.getElementById("modalContent");
const modalCloseBtn = document.getElementById("modalCloseBtn");

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

function getProfiles() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_PROFILES_KEY)) || {};
  } catch {
    return {};
  }
}

function saveProfiles(profiles) {
  try {
    localStorage.setItem(AUTH_PROFILES_KEY, JSON.stringify(profiles));
    return true;
  } catch {
    return false;
  }
}

function getSession() {
  try {
    return localStorage.getItem(AUTH_SESSION_KEY);
  } catch {
    return null;
  }
}

function setSession(username) {
  try {
    if (username) localStorage.setItem(AUTH_SESSION_KEY, username);
    else localStorage.removeItem(AUTH_SESSION_KEY);
  } catch {
    // Diamkan — kalau localStorage gagal, sesi cukup hidup sampai reload
  }
}

function bufferToHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function randomSalt() {
  const arr = crypto.getRandomValues(new Uint8Array(16));
  return bufferToHex(arr.buffer);
}

async function hashPassword(password, saltHex) {
  const encoder = new TextEncoder();
  const data = encoder.encode(saltHex + ":" + password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(digest);
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
      <label for="loginIdentifier">Email / Username</label>
      <input type="text" id="loginIdentifier" autocomplete="username" maxlength="60" required>
      <label for="loginPassword">Kata Sandi</label>
      <input type="password" id="loginPassword" autocomplete="current-password" maxlength="128" required>
      <div id="loginError" class="auth-error"></div>
      <button type="submit" class="btn btn-download" style="width:100%;margin-top:16px;">Masuk</button>
    </form>
    <form id="registerForm" class="auth-form" style="${tab === "register" ? "" : "display:none;"}">
      <label for="registerIdentifier">Email / Username</label>
      <input type="text" id="registerIdentifier" autocomplete="username" maxlength="60" required>
      <label for="registerPassword">Kata Sandi</label>
      <input type="password" id="registerPassword" autocomplete="new-password" maxlength="128" required minlength="8">
      <div class="strength-meter"><div id="strengthBar" class="strength-bar"></div></div>
      <div id="strengthLabel" class="strength-label">Minimal 8 karakter</div>
      <label for="registerPasswordConfirm">Ulangi Kata Sandi</label>
      <input type="password" id="registerPasswordConfirm" autocomplete="new-password" maxlength="128" required>
      <div id="registerError" class="auth-error"></div>
      <p class="auth-note">Akun ini tersimpan lokal di perangkat/browser ini saja (bukan akun cloud) — dipakai untuk personalisasi & menyimpan riwayat unduhan.</p>
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
      // Bersihkan pesan error lama dari tab satunya biar tidak nyangkut
      document.getElementById("loginError").style.display = "none";
      document.getElementById("registerError").style.display = "none";
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

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("loginError");
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    errorBox.style.display = "none";
    const identifier = document.getElementById("loginIdentifier").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value;

    submitBtn.disabled = true;
    try {
      const profiles = getProfiles();
      const profile = profiles[identifier];
      if (!profile) {
        errorBox.textContent = "Akun tidak ditemukan di perangkat ini.";
        errorBox.style.display = "block";
        return;
      }
      const hash = await hashPassword(password, profile.salt);
      if (hash !== profile.hash) {
        errorBox.textContent = "Email/username atau kata sandi salah.";
        errorBox.style.display = "block";
        return;
      }
      setSession(identifier);
      closeModal();
      renderAuthArea();
    } catch {
      errorBox.textContent = "Gagal memproses. Pastikan situs diakses lewat HTTPS.";
      errorBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const errorBox = document.getElementById("registerError");
    errorBox.style.display = "none";
    const identifier = document.getElementById("registerIdentifier").value.trim().toLowerCase();
    const password = document.getElementById("registerPassword").value;
    const confirmPw = document.getElementById("registerPasswordConfirm").value;

    if (identifier.length < 3) {
      errorBox.textContent = "Email/username minimal 3 karakter.";
      errorBox.style.display = "block";
      return;
    }
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
      const profiles = getProfiles();
      if (profiles[identifier]) {
        errorBox.textContent = "Email/username ini sudah terdaftar di perangkat ini.";
        errorBox.style.display = "block";
        return;
      }

      const salt = randomSalt();
      const hash = await hashPassword(password, salt);
      profiles[identifier] = { salt, hash, createdAt: Date.now() };

      if (!saveProfiles(profiles)) {
        errorBox.textContent = "Gagal menyimpan akun di perangkat ini.";
        errorBox.style.display = "block";
        return;
      }
      setSession(identifier);
      closeModal();
      renderAuthArea();
    } catch {
      errorBox.textContent = "Gagal membuat akun. Pastikan situs diakses lewat HTTPS.";
      errorBox.style.display = "block";
    } finally {
      submitBtn.disabled = false;
    }
  });
}

function openAuthModal(tab) {
  openModal(renderAuthForm(tab || "login"));
  wireAuthForm();
  const firstInput = modalContent.querySelector("input");
  if (firstInput) firstInput.focus();
}

function getHistory(username) {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_PREFIX + username)) || [];
  } catch {
    return [];
  }
}

function addHistoryEntry(title, type) {
  const username = getSession();
  if (!username) return;
  try {
    const history = getHistory(username);
    history.unshift({ title, type, time: Date.now() });
    if (history.length > HISTORY_LIMIT) history.length = HISTORY_LIMIT;
    localStorage.setItem(HISTORY_PREFIX + username, JSON.stringify(history));
  } catch {
    // Riwayat gagal tersimpan — tidak fatal, unduhan tetap jalan
  }
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
  const username = getSession();
  const history = username ? getHistory(username) : [];

  const items = history.length
    ? history.map((h) => `
        <div class="history-item">
          <div>
            <div class="history-item-title">${escapeHtml(h.title)}</div>
            <div class="history-item-meta">${formatRelativeTime(h.time)}</div>
          </div>
          <span class="history-item-badge" style="background:${badgeColor(h.type)}">${escapeHtml(String(h.type).toUpperCase())}</span>
        </div>
      `).join("")
    : `<div class="history-empty">Belum ada riwayat unduhan.</div>`;

  openModal(`
    <h3>Riwayat Unduhan</h3>
    <div id="historyList" class="history-list">${items}</div>
    ${history.length ? `<button id="clearHistoryBtn" class="btn btn-paste" style="width:100%;margin-top:14px;">Hapus Riwayat</button>` : ""}
  `);

  const clearBtn = document.getElementById("clearHistoryBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      const confirmed = confirm("Hapus semua riwayat unduhan di perangkat ini?");
      if (!confirmed) return;
      try { localStorage.removeItem(HISTORY_PREFIX + username); } catch {}
      renderHistoryModal();
    });
  }
}

function renderAuthArea() {
  const username = getSession();

  if (!username) {
    authArea.innerHTML = `<button id="loginOpenBtn" class="btn-auth" type="button">Masuk</button>`;
    document.getElementById("loginOpenBtn").addEventListener("click", () => openAuthModal("login"));
    return;
  }

  const displayName = username.includes("@") ? username.split("@")[0] : username;
  authArea.innerHTML = `
    <div class="user-chip">
      <span class="user-name">👤 ${escapeHtml(displayName)}</span>
      <button id="historyOpenBtn" type="button">Riwayat</button>
      <button id="logoutBtn" type="button">Keluar</button>
    </div>
  `;
  document.getElementById("historyOpenBtn").addEventListener("click", renderHistoryModal);
  document.getElementById("logoutBtn").addEventListener("click", () => {
    setSession(null);
    renderAuthArea();
  });
}

renderAuthArea();
