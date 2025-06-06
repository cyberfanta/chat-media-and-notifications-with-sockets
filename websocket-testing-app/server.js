const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.static('public'));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'websocket-testing-app',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Servir la aplicación de testing
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint de información
app.get('/info', (req, res) => {
  res.json({
    name: 'WebSocket Testing Client',
    description: 'Testing client for Notifications Service WebSocket connections',
    version: '1.0.0',
    services: {
      auth: 'http://localhost:5900',
      media: 'http://localhost:5901', 
      comments: 'http://localhost:5902',
      notifications: 'http://localhost:5903'
    },
    websocket: 'ws://localhost:5903/notifications'
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 WebSocket Testing App ejecutándose en: http://localhost:${PORT}`);
  console.log(`📋 Health check disponible en: http://localhost:${PORT}/health`);
  console.log(`ℹ️  Información del servicio: http://localhost:${PORT}/info`);
  console.log(`🔧 Cliente de testing: http://localhost:${PORT}`);
}); 