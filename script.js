// === AUTO SESSION KEY ===
const SESSION_KEY = crypto.randomUUID().toUpperCase();
const REPO_OWNER = "lurkoutlightsaber";
const REPO_NAME = "lurkout-testing";

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
    setTimeout(() => statusEl.textContent = "Waiting for data...", 2000);
  });
}

function newKey() {
  if (confirm("Generate new key? Current session will end.")) {
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
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();
    const count = json.tree ? Object.keys(json.tree).length : 0;
    const time = json.lastUpdate ? new Date(json.lastUpdate).toLocaleTimeString() : 'never';

    statusEl.textContent = `Connected: ${time} | ${count} objects`;
    statusEl.className = "status-ok";

    dataEl.textContent = JSON.stringify(json, null, 2);
    log(`Data loaded: ${count} objects`);
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.className = "status-error";
    log(`Load failed: ${err.message}`);
  }
}

// Auto-refresh
loadData();
setInterval(loadData, 3000);

// Expose for debugging
window.SESSION_KEY = SESSION_KEY;
window.REPO = { owner: REPO_OWNER, name: REPO_NAME };
log("Session key generated.");