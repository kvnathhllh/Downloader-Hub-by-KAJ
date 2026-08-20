:root {
  --ink: #0b0d10;
  --panel: #15181d;
  --panel-raised: #1b1f26;
  --line: rgba(255, 255, 255, 0.09);
  --line-strong: rgba(255, 255, 255, 0.18);

  --text-main: #f2f3f5;
  --text-muted: #9aa0ab;
  --text-subtle: #5b6270;

  --signal: #2f6fed;
  --signal-mint: #17c79a;
  --success: #17c79a;
  --danger: #f0533d;

  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: "IBM Plex Mono", ui-monospace, SFMono-Regular, monospace;

  --radius-sm: 8px;
  --radius: 14px;
}

* { margin: 0; padding: 0; box-sizing: border-box; }
html { -webkit-tap-highlight-color: transparent; }

body {
  position: relative;
  min-height: 100vh;
  background-color: var(--ink);
  color: var(--text-main);
  font-family: var(--font-body);
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
}

/* Latar belakang bergerak: grid tipis bergeser pelan + dua cahaya lembut yang "bernapas" */
body::before,
body::after {
  content: "";
  position: fixed;
  z-index: -1;
  pointer-events: none;
}

body::before {
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 28px 28px;
  animation: gridDrift 50s linear infinite;
}

body::after {
  inset: -15%;
  background:
    radial-gradient(ellipse 640px 420px at 22% 25%, rgba(47, 111, 237, 0.17), transparent 60%),
    radial-gradient(ellipse 600px 400px at 80% 78%, rgba(23, 199, 154, 0.12), transparent 60%);
  filter: blur(6px);
  animation: glowDrift 22s ease-in-out infinite;
}

@keyframes gridDrift {
  from { background-position: 0 0, 0 0; }
  to { background-position: 280px 280px, 280px 280px; }
}

@keyframes glowDrift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  50% { transform: translate(3%, -4%) scale(1.08); }
}

@media (prefers-reduced-motion: reduce) {
  body::before, body::after { animation: none; }
}

.container { width: min(880px, 92%); margin: 0 auto; flex: 1; }

/* Header */
header {
  padding: 18px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid var(--line);
  flex-wrap: wrap;
}

.logo { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

.logo-img {
  height: 26px; width: 26px; object-fit: contain;
  border-radius: 6px; border: 1px solid var(--line-strong);
}

.logo-fallback {
  width: 26px; height: 26px; display: grid; place-items: center;
  border-radius: 6px; background: var(--panel-raised);
  border: 1px solid var(--line-strong); color: var(--signal);
}

.logo-text { font-family: var(--font-display); font-size: 15px; font-weight: 700; letter-spacing: -0.2px; }

.by-kaj {
  padding: 3px 9px;
  border: 1px solid var(--line);
  border-radius: 100px;
  font-family: var(--font-mono);
  font-size: 10.5px;
  color: var(--text-subtle);
  letter-spacing: 0.3px;
}

.header-right { display: flex; align-items: center; gap: 8px; }

.btn-install {
  display: none;
  align-items: center;
  gap: 7px;
  padding: 7px 14px;
  border: 1px solid rgba(47, 111, 237, 0.4);
  border-radius: 100px;
  background: rgba(47, 111, 237, 0.12);
  color: #a9c2fb;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-install:hover { background: rgba(47, 111, 237, 0.2); }

/* Hero */
.hero { text-align: center; padding: 46px 0 28px; }

.hero-brand {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 12px;
  letter-spacing: -0.1px;
}

.eyebrow {
  display: inline-block; font-family: var(--font-mono); font-size: 11px;
  font-weight: 500; letter-spacing: 2px; color: var(--signal);
  margin-bottom: 18px; text-transform: uppercase;
}

.hero h1 {
  font-family: var(--font-display); font-size: clamp(30px, 5vw, 44px);
  line-height: 1.18; letter-spacing: -0.8px; margin-bottom: 14px; font-weight: 700;
}

.hero h1 em { font-style: normal; color: var(--signal-mint); }

.hero p {
  max-width: 460px; margin: 0 auto 34px; color: var(--text-muted);
  font-size: 14.5px; line-height: 1.6;
}

/* Downloader card */
.downloader-card {
  max-width: 760px; margin: 0 auto; padding: 14px;
  border: 1px solid var(--line); border-radius: var(--radius);
  background: var(--panel); box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.input-box { display: flex; gap: 8px; }

.input-wrapper {
  position: relative; flex: 1; display: flex; align-items: center;
  border: 1px solid var(--line); border-radius: var(--radius-sm);
  background: var(--ink); transition: border-color 0.2s ease;
}

.input-wrapper:focus-within { border-color: var(--signal); }

.input-icon {
  position: absolute; left: 14px; color: var(--text-subtle);
  display: flex; align-items: center; pointer-events: none;
}

.input-box input {
  width: 100%; padding: 13px 38px 13px 42px; border: 0; outline: 0;
  background: transparent; color: var(--text-main);
  font-family: var(--font-mono); font-size: 13.5px;
}

.input-box input::placeholder { color: var(--text-subtle); font-family: var(--font-body); }

.clear-btn {
  position: absolute; right: 10px; width: 22px; height: 22px; display: none;
  align-items: center; justify-content: center; border: 0; border-radius: 50%;
  background: var(--panel-raised); color: var(--text-muted); cursor: pointer;
  font-size: 11px; transition: all 0.2s ease;
}

.clear-btn:hover { background: var(--line-strong); color: #fff; }

.btn {
  border: 0; cursor: pointer; display: inline-flex; align-items: center;
  justify-content: center; gap: 8px; font-family: var(--font-body);
  font-size: 13.5px; font-weight: 600; border-radius: var(--radius-sm);
  transition: all 0.2s ease; user-select: none;
}

.btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-paste { padding: 0 18px; background: var(--panel-raised); color: var(--text-main); border: 1px solid var(--line); }
.btn-paste:hover { border-color: var(--line-strong); }

.btn-download { padding: 0 26px; background: var(--signal); color: white; }
.btn-download:hover:not(:disabled) { background: #4c82f0; }

/* Status */
.status-box { display: none; padding: 34px 20px 16px; text-align: center; }

.spinner {
  width: 24px; height: 24px; margin: 0 auto 14px; border: 2px solid var(--line);
  border-top-color: var(--signal); border-radius: 50%; animation: spin 0.7s infinite linear;
}

@keyframes spin { to { transform: rotate(360deg); } }

.status-text { font-family: var(--font-mono); color: var(--text-muted); font-size: 12.5px; }

/* Error */
.error-box {
  display: none; margin-top: 12px; padding: 12px 14px;
  border-left: 3px solid var(--danger); border-radius: 4px;
  background: rgba(240, 83, 61, 0.08); color: #ffb3a3; font-size: 13px; line-height: 1.5;
}

/* Result — styled like an extraction ticket */
.result-card {
  display: none; position: relative; margin-top: 14px; overflow: hidden;
  border: 1px solid var(--line); border-top: 1px dashed var(--line-strong);
  border-radius: var(--radius-sm); background: var(--panel-raised); animation: fadeIn 0.35s ease;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }

.result-stamp {
  position: absolute; top: 14px; right: 14px; padding: 3px 9px;
  border: 1px solid var(--signal-mint); border-radius: 4px; color: var(--signal-mint);
  font-family: var(--font-mono); font-size: 10px; font-weight: 600;
  letter-spacing: 1.5px; transform: rotate(3deg); z-index: 2;
}

.result-content { display: flex; flex-direction: column; gap: 18px; padding: 20px; }

.result-eyebrow { font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 1.5px; color: var(--text-subtle); }

.preview-wrapper {
  position: relative; width: 100%; min-height: 180px; max-height: 340px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
  border: 1px solid var(--line); border-radius: 10px; background: #000;
}

.preview-media { width: 100%; max-height: 340px; object-fit: contain; }

/* Carousel (multi-slide preview) */
.carousel { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
.carousel-img {
  width: 100%; max-height: 340px; object-fit: contain;
  touch-action: pan-y;
  cursor: grab;
  user-select: none;
  -webkit-user-drag: none;
}
.carousel-img:active { cursor: grabbing; }
.carousel-nav {
  position: absolute; top: 50%; transform: translateY(-50%); width: 34px; height: 34px;
  border-radius: 50%; background: rgba(0, 0, 0, 0.55); color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2); font-size: 19px; line-height: 1;
  display: flex; align-items: center; justify-content: center; cursor: pointer;
}
.carousel-prev { left: 10px; }
.carousel-next { right: 10px; }
.carousel-counter {
  position: absolute; bottom: 10px; right: 12px; padding: 3px 10px; border-radius: 20px;
  background: rgba(0, 0, 0, 0.6); font-family: var(--font-mono); font-size: 11px; color: #fff;
}

.result-details { display: flex; flex-direction: column; gap: 16px; }

.media-title {
  font-family: var(--font-display); color: white; font-size: 16px;
  font-weight: 600; line-height: 1.4; word-break: break-word;
}

.media-author { margin-top: 5px; font-family: var(--font-mono); color: var(--text-muted); font-size: 12px; }

.format-section-title {
  margin-bottom: 10px; padding-top: 12px; border-top: 1px solid var(--line);
  color: var(--text-subtle); font-family: var(--font-mono); font-size: 10.5px;
  font-weight: 600; letter-spacing: 1.5px;
}

.formats-grid { display: flex; flex-direction: column; gap: 10px; }
.option-row { width: 100%; display: flex; align-items: center; gap: 8px; }

.btn-option {
  flex: 1; padding: 13px; display: flex; align-items: center; justify-content: center;
  gap: 8px; border: 0; border-radius: var(--radius-sm); color: white; cursor: pointer;
  font-family: var(--font-body); font-size: 13.5px; font-weight: 600; transition: filter 0.2s ease;
}

.btn-option:hover:not(:disabled) { filter: brightness(1.12); }
.btn-option-video { background: var(--signal); }
.btn-option-audio { background: var(--signal-mint); }
.btn-option-photo { background: #475569; }

.btn-copy-direct {
  width: 44px; height: 44px; flex-shrink: 0; display: flex; align-items: center;
  justify-content: center; border: 1px solid var(--line); border-radius: var(--radius-sm);
  background: var(--ink); color: white; cursor: pointer; transition: all 0.2s ease;
}

.btn-copy-direct:hover { border-color: var(--line-strong); }

.ios-hint {
  display: none;
  position: fixed;
  left: 50%;
  bottom: 18px;
  transform: translateX(-50%);
  width: 340px;
  max-width: 92%;
  padding: 14px 16px;
  border: 1px solid var(--line-strong);
  border-radius: 12px;
  background: var(--panel-raised);
  color: var(--text-main);
  font-size: 12.5px;
  line-height: 1.55;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  z-index: 50;
}

.ios-hint strong { color: var(--signal-mint); }

/* About section */
.about {
  margin: 56px auto 0; max-width: 760px; padding: 30px;
  border: 1px solid var(--line); border-radius: var(--radius); background: var(--panel);
}

.about h2 { font-family: var(--font-display); font-size: 22px; font-weight: 700; margin-bottom: 14px; }

.about > p {
  color: var(--text-muted); font-size: 13.5px; line-height: 1.75; margin-bottom: 26px;
}

.feature-list {
  display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 26px;
}

.feature-row { display: flex; gap: 12px; align-items: flex-start; }

.feature-icon {
  flex-shrink: 0; width: 32px; height: 32px; display: grid; place-items: center;
  border-radius: 8px; background: var(--panel-raised); border: 1px solid var(--line); font-size: 14px;
}

.feature-row h4 { font-size: 13.5px; font-weight: 600; margin-bottom: 3px; }
.feature-row p { color: var(--text-muted); font-size: 12px; line-height: 1.55; }

.platform-title {
  font-family: var(--font-mono); font-size: 10.5px; letter-spacing: 1.5px;
  color: var(--text-subtle); margin-bottom: 12px; padding-top: 20px; border-top: 1px solid var(--line);
}

.platform-badges { display: flex; flex-wrap: wrap; gap: 8px; }

.platform-badge {
  padding: 6px 13px; border: 1px solid var(--line); border-radius: 100px;
  background: var(--panel-raised); font-size: 12px; color: var(--text-muted);
}

/* Footer */
footer {
  position: relative;
  padding: 30px 0 36px;
  margin-top: 40px;
  color: var(--text-subtle);
  font-family: var(--font-mono);
  font-size: 11.5px;
  text-align: center;
  line-height: 1.8;
}

footer::before {
  content: "";
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(560px, 88%);
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--line-strong), transparent);
}

footer a {
  color: var(--signal-mint);
  text-decoration: none;
  font-weight: 600;
}

footer a:hover { text-decoration: underline; }

/* Mobile */
@media (max-width: 720px) {
  .input-box { flex-direction: column; }
  .btn { height: 46px; width: 100%; }
  .feature-list { grid-template-columns: 1fr; }
  .about { padding: 22px; }
}
