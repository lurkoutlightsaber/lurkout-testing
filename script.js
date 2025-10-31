let SESSION_KEY = null;
const keyEl = document.getElementById('key');
const statusEl = document.getElementById('status');
const dataEl = document.getElementById('data');
const debugEl = document.getElementById('debug-log');
const debugPanel = document.getElementById('debug');
const controlPanel = document.getElementById('control-panel');
const copyBtn = document.getElementById('copy-btn');

function log(msg) {
  const t = new Date().toLocaleTimeString();
  debugEl.innerHTML += `<br>[${t}] ${msg}`;
  debugPanel.scrollTop = debugPanel.scrollHeight;
}

function copyKey() {
  if (!SESSION_KEY) return;
  navigator.clipboard.writeText(SESSION_KEY).then(() => {
    statusEl.textContent = "Key copied!";
    statusEl.className = "status-ok";
    setTimeout(() => statusEl.textContent = "Paired!", 1500);
  });
}

function toggleDebug() { debugPanel.classList.toggle('show'); }

// === AUTO-PAIR WITH EXACT MATCH ===
async function checkPair() {
  try {
    const res = await fetch(`api/data.json?t=${Date.now()}`);
    if (!res.ok) return;
    const json = await res.json();

    const incomingKey = (json.key || "").trim();  // TRIM WHITESPACE

    if (incomingKey && !SESSION_KEY) {
      SESSION_KEY = incomingKey;
      keyEl.textContent = SESSION_KEY;
      copyBtn.style.display = "inline-block";
      controlPanel.style.display = "block";
      statusEl.textContent = "Paired! Click to send.";
      statusEl.className = "status-ok";
      log(`Paired with key: "${SESSION_KEY}" (len=${SESSION_KEY.length})`);
    }

    // EXACT MATCH
    if (incomingKey === SESSION_KEY) {
      const count = json.parts?.length || Object.keys(json.tree || {}).length || json.players?.length || 0;
      const time = json.lastUpdate ? new Date(json.lastUpdate).toLocaleTimeString() : 'never';
      statusEl.textContent = `Live: ${time} | ${count} items`;
      dataEl.textContent = JSON.stringify(json, null, 2);
    } else if (incomingKey && SESSION_KEY && incomingKey !== SESSION_KEY) {
      log(`KEY MISMATCH: site="${incomingKey}" | local="${SESSION_KEY}"`);
      statusEl.textContent = "Key mismatch! Re-execute script.";
      statusEl.className = "status-error";
    }
  } catch (err) {
    log(`Fetch error: ${err.message}`);
  }
}

// === SEND COMMAND ===
function sendCommand(type) {
  if (!SESSION_KEY) return alert("Not paired!");
  fetch('api/command.json', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: SESSION_KEY, command: type, timestamp: Date.now() })
  }).then(() => log(`Command sent: ${type}`));
}

// Auto-refresh
setInterval(checkPair, 3000);
checkPair();
log("Waiting for Roblox key...");