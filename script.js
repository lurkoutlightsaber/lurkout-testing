// === PERSISTENT KEY (NO SECRETS) ===
let SESSION_KEY = localStorage.getItem('roblox_key');
if (!SESSION_KEY) {
  SESSION_KEY = "ROBLOX-" + Date.now().toString(36).toUpperCase();
  localStorage.setItem('roblox_key', SESSION_KEY);
}

const keyEl = document.getElementById('key');
const statusEl = document.getElementById('status');
const dataEl = document.getElementById('data');
const debugEl = document.getElementById('debug-log');
const debugPanel = document.getElementById('debug');

keyEl.textContent = SESSION_KEY;

function log(msg) {
  const time = new Date().toLocaleTimeString();
  debugEl.innerHTML += `<br>[${time}] ${msg}`;
  debugPanel.scrollTop = debugPanel.scrollHeight;
}

function copyKey() {
  navigator.clipboard.writeText(SESSION_KEY).then(() => {
    statusEl.textContent = "Key copied!";
    statusEl.className = "status-ok";
    setTimeout(() => statusEl.textContent = "Waiting...", 1500);
  });
}

function resetKey() {
  if (confirm("Reset key?")) {
    localStorage.removeItem('roblox_key');
    location.reload();
  }
}

function toggleDebug() {
  debugPanel.classList.toggle('show');
}

// === LOAD DATA ===
async function loadData() {
  try {
    const res = await fetch(`api/data.json?t=${Date.now()}`);
    log(`Fetch → ${res.status} ${res.statusText}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const count = json.parts?.length || 0;
    const time = json.lastUpdate ? new Date(json.lastUpdate).toLocaleTimeString() : 'never';

    statusEl.textContent = `Live: ${time} | ${count} parts`;
    statusEl.className = "status-ok";

    dataEl.textContent = JSON.stringify(json, null, 2);
    log(`Loaded ${count} parts`);
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.className = "status-error";
    log(`Load failed: ${err.message}`);
  }
}

loadData();
setInterval(loadData, 3000);
log("Session key: " + SESSION_KEY);