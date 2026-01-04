import pkg from 'whatsapp-web.js';
const { Client, LocalAuth } = pkg;
import qrcode from 'qrcode-terminal';

import { config } from './config/index.js';
import { handleMessage, handleGroupJoin } from './handlers/messageHandler.js';
import { getMonitoredGroups } from './utils/storage.js';
import { startServer, stopServer } from './server.js';

console.log('🚀 Iniciando WhatsApp Dollar Monitor...\n');

// Crear cliente de WhatsApp
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: config.session.authPath,
  }),
  puppeteer: {
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu',
    ],
  },
});

// Evento: Código QR generado
client.on('qr', (qr) => {
  console.log('📱 Escanea este código QR con WhatsApp:\n');
  qrcode.generate(qr, { small: true });
  console.log('\nAbre WhatsApp > Dispositivos vinculados > Vincular dispositivo\n');
});

// Evento: Autenticación exitosa
client.on('authenticated', () => {
  console.log('✅ Autenticación exitosa');
});

// Evento: Fallo en autenticación
client.on('auth_failure', (msg) => {
  console.error('❌ Error de autenticación:', msg);
  process.exit(1);
});

// Evento: Cliente listo
client.on('ready', async () => {
  console.log('✅ Cliente conectado y listo!\n');

  // Iniciar servidor API
  startServer(client);

  const monitored = getMonitoredGroups();

  if (monitored.length > 0) {
    console.log(`\n👀 Monitoreando ${monitored.length} grupo(s):`);
    monitored.forEach((g) => console.log(`   ✅ ${g.name}`));
    console.log('\n' + '─'.repeat(40));
    console.log('Esperando mensajes de venta de dólares...');
    console.log('─'.repeat(40) + '\n');
  } else {
    console.log('\n⚠️  No hay grupos monitoreados.');
    console.log('   Ejecuta: npm run config grupos');
    console.log('   para seleccionar qué grupos monitorear.\n');
  }
});

// Evento: Mensaje recibido
client.on('message', handleMessage);

// Evento: Añadido a grupo
client.on('group_join', handleGroupJoin);

// Evento: Desconectado
client.on('disconnected', (reason) => {
  console.log('🔌 Cliente desconectado:', reason);
  process.exit(1);
});

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n👋 Cerrando conexión...');
  stopServer();
  await client.destroy();
  process.exit(0);
});

// Inicializar cliente
client.initialize();
