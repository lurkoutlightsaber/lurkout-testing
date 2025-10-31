let sessionKey = crypto.randomUUID();
let ws = null;
const keyEl = document.getElementById('key');
const statusEl = document.getElementById('status');
const dataEl = document.getElementById('data');

function updateKey() {
  keyEl.textContent = sessionKey;
}

function copyKey() {
  navigator.clipboard.writeText(sessionKey).then(() => {
    alert('✅ Session Key copied! Paste it into example.lua');
  });
}

function refreshKey() {
  sessionKey = crypto.randomUUID();
  updateKey();
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: 'set_session', key: sessionKey }));
  }
}

function connectWS() {
  ws = new WebSocket('ws://localhost:3000/ws');
  
  ws.onopen = () => {
    statusEl.textContent = '✅ Connected! Set session key...';
    statusEl.className = 'connected';
    ws.send(JSON.stringify({ type: 'set_session', key: sessionKey }));
  };
  
  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'session_set') {
        statusEl.textContent = `✅ Paired! Waiting for Roblox data...`;
      } else if (msg.type === 'data') {
        dataEl.textContent = `📦 Parts Count: ${msg.data.length}\n\n` +
          JSON.stringify(msg.data, null, 2);
      }
    } catch (e) {
      console.error('WS msg error:', e);
    }
  };
  
  ws.onclose = () => {
    statusEl.textContent = '❌ Disconnected. Reconnecting...';
    statusEl.className = 'disconnected';
    setTimeout(connectWS, 2000);
  };
  
  ws.onerror = (e) => {
    console.error('WS error:', e);
  };
}

// Init
updateKey();
connectWS();
