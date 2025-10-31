const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let currentSessionKey = null;

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// POST endpoint for Roblox Lua to send data
app.post('/api/data', (req, res) => {
  const { key, data } = req.body;
  console.log('Received data attempt with key:', key ? key.slice(0, 8) + '...' : 'null');
  
  if (key !== currentSessionKey) {
    console.log('Invalid session key!');
    return res.status(401).json({ error: 'Invalid key' });
  }

  // Broadcast to all WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'data', data }));
    }
  });

  console.log(`Broadcasted ${data.length} parts`);
  res.json({ status: 'OK' });
});

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');
  
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message.toString());
      if (msg.type === 'set_session') {
        currentSessionKey = msg.key;
        console.log('Session key set:', currentSessionKey.slice(0, 8) + '...');
        ws.send(JSON.stringify({ type: 'session_set', status: 'OK' }));
      }
    } catch (e) {
      console.error('WS message error:', e);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log('📋 Copy session key from browser, paste in Lua.');
});
