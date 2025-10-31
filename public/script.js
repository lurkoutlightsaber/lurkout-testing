// === SESSION KEY ===
const SESSION_KEY = crypto.randomUUID().toUpperCase();
const keyEl = document.getElementById('key');
const statusEl = document.getElementById('status');
const dataEl = document.getElementById('data');

keyEl.textContent = SESSION_KEY;

// === UI FUNCTIONS ===
function copyKey() {
  navigator.clipboard.writeText(SESSION_KEY).then(() => {
    alert('Session key copied to clipboard!');
  });
}

function newKey() {
  if (confirm('Generate a new key? Current session will be invalidated.')) {
    location.reload();
  }
}

// === LOAD DATA FROM api/data.json ===
async function loadData() {
  try {
    const res = await fetch(`api/data.json?t=${Date.now()}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const count = json.parts?.length || 0;
    const time = json.lastUpdate ? new Date(json.lastUpdate).toLocaleTimeString() : 'never';

    statusEl.textContent = `Last update: ${time} | Parts: ${count}`;
    statusEl.style.color = '#00ff88';

    dataEl.textContent = JSON.stringify(json, null, 2);
  } catch (err) {
    statusEl.textContent = `Error: ${err.message}`;
    statusEl.style.color = '#ff6666';
    dataEl.textContent = 'Failed to load data. Is the workflow running?';
  }
}

// Auto-refresh every 3 seconds
loadData();
setInterval(loadData, 3000);

// Optional: expose for debugging
window.SESSION_KEY = SESSION_KEY;