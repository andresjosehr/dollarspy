import http from 'http';
import { getMonitoredGroups, saveMonitoredGroups } from './utils/storage.js';

const PORT = process.env.API_PORT || 3847;

let whatsappClient = null;
let server = null;

/**
 * Inicia el servidor HTTP
 * @param {import('whatsapp-web.js').Client} client
 */
export function startServer(client) {
  whatsappClient = client;

  server = http.createServer(async (req, res) => {
    // CORS para desarrollo
    res.setHeader('Content-Type', 'application/json');

    try {
      const url = new URL(req.url, `http://localhost:${PORT}`);
      const path = url.pathname;

      // GET /status - Estado del cliente
      if (req.method === 'GET' && path === '/status') {
        const state = await whatsappClient.getState();
        return sendJson(res, { ok: true, state });
      }

      // GET /grupos - Lista todos los grupos
      if (req.method === 'GET' && path === '/grupos') {
        const chats = await whatsappClient.getChats();
        const groups = chats
          .filter((chat) => chat.isGroup)
          .map((g) => ({ id: g.id._serialized, name: g.name }));

        const monitored = getMonitoredGroups();
        const monitoredIds = monitored.map((m) => m.id);

        const result = groups.map((g) => ({
          ...g,
          monitored: monitoredIds.includes(g.id),
        }));

        return sendJson(res, { ok: true, groups: result });
      }

      // GET /monitoreados - Lista grupos monitoreados
      if (req.method === 'GET' && path === '/monitoreados') {
        const groups = getMonitoredGroups();
        return sendJson(res, { ok: true, groups });
      }

      // POST /monitoreados - Actualiza grupos monitoreados
      if (req.method === 'POST' && path === '/monitoreados') {
        const body = await getBody(req);
        const { groups } = JSON.parse(body);
        saveMonitoredGroups(groups);
        return sendJson(res, { ok: true, saved: groups.length });
      }

      // 404
      res.statusCode = 404;
      return sendJson(res, { ok: false, error: 'Not found' });

    } catch (error) {
      res.statusCode = 500;
      return sendJson(res, { ok: false, error: error.message });
    }
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log(`🌐 API disponible en http://localhost:${PORT}`);
  });
}

export function stopServer() {
  if (server) {
    server.close();
  }
}

function sendJson(res, data) {
  res.end(JSON.stringify(data));
}

function getBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

export { PORT };
