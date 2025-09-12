"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const environment_1 = require("@/config/environment");
const PORT = environment_1.config.PORT || 5000;
const server = app_1.default.listen(PORT, () => {
    console.log(`
🏥 OralVis Healthcare API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running on port: ${PORT}
🌍 Environment: ${environment_1.config.NODE_ENV}
📱 Client URL: ${environment_1.config.CLIENT_URL}
📊 API Base URL: http://localhost:${PORT}/api
⚡ Health Check: http://localhost:${PORT}/api/health
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
});
server.on('error', (error) => {
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
exports.default = server;
//# sourceMappingURL=index.js.map