import app from './app';
import { config } from './config/environment';

const PORT = config.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
🏥 OralVis Healthcare API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port: ${PORT}
🌍 Environment: ${config.NODE_ENV}
📱 Client URL: ${config.CLIENT_URL}
📊 API Base URL: http://localhost:${PORT}/api
⚡ Health Check: http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});

// Handle server errors
server.on('error', (error: any) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  switch (error.code) {
    case 'EACCES':
      console.error(`❌ Port ${PORT} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(`❌ Port ${PORT} is already in use`);
      process.exit(1);
      break;
    default:
      throw error;
  }
});

export default server;