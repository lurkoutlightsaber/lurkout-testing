let PAIRED_KEY = null;
const statusEl = document.getElementById('status');
const dataEl = document.getElementById('data');
const debugEl = document.getElementById('debug-log');
const debugPanel = document.getElementById('debug');
const loginCard = document.getElementById('login-card');
const controlPanel = document.getElementById('control-panel');
const pairedKeyEl = document.getElementById('paired-key');

function log(msg) {
  const t = new Date().toLocaleTimeString();
  debugEl.innerHTML += `<br>[${t}] ${msg}`;
  debugPanel.scrollTop = debugPanel.scrollHeight;
}

function login() {
  const input = document.getElementById('input-key').value.trim();
  if (!input) return alert("Enter a key!");
  PAIRED_KEY = input;
  pairedKeyEl.textContent = PAIRED_KEY;
  loginCard.style.display = 'none';
  controlPanel.style.display = 'block';
  statusEl.textContent = "Paired! Ready to send.";
  statusEl.className = "status-ok";
  log(`Paired with key: ${PAIRED_KEY}`);
  loadData();
}

function toggleDebug() { debugPanel.classList.toggle('show'); }

// === SEND COMMANDS VIA URL PARAMS (Roblox will poll) ===
function sendCommand(type) {
  const url = `api/command.json?t=${Date.now()}`;
  fetch(url).then(r => r.json()).then(data => {
    if (data.key !== PAIRED_KEY) {
      alert("Invalid session key! Re-login.");
      return;
    }
    if (data.command !== type) {
      log(`Sending command: ${type}`);
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: PAIRED_KEY, command: type, timestamp: Date.now() })
      }).then(() => log(`Command sent: ${type}`));
    }
  });
}

function sendFullTree() { sendCommand('full_tree'); }
function sendWorkspace() { sendCommand('workspace'); }
function sendPlayers() { sendCommand('players'); }

// === LOAD DATA ===
async function loadData() {
  try {
    const res = await fetch(`api/data.json?t=${Date.now()}`);
    log(`Fetch data → ${res.status}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (json.key !== PAIRED_KEY) {
      statusEl.textContent = "Key mismatch! Re-login.";
      statusEl.className = "status-error";
      return;
    }

    const count = json.parts?.length || Object.keys(json.tree || {}).length || json.players?.length || 0;
    const time = json.lastUpdate ? new Date(json.lastUpdate).toLocaleTimeString() : 'never';
    statusEl.textContent = `Live: ${time} | ${count} items`;
    statusEl.className = "status-ok";
    dataEl.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.className = "status-error";
    log(`Load failed: ${err.message}`);
  }
}

setInterval(loadData, 3000);
log("Control panel ready.");