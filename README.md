# WhatsApp Dollar Monitor

Monitor de ventas de dólares en grupos de WhatsApp usando [whatsapp-web.js](https://wwebjs.dev/).

## Requisitos

- Node.js >= 18
- Chromium (instalado automáticamente con puppeteer)

## Instalación

```bash
npm install
```

## Uso

```bash
npm start
```

La primera vez mostrará un código QR. Escanéalo con tu WhatsApp:
1. Abre WhatsApp en tu teléfono
2. Ve a **Configuración > Dispositivos vinculados**
3. Toca **Vincular dispositivo**
4. Escanea el código QR

La sesión se guarda en `.wwebjs_auth/` para no tener que escanear cada vez.

## Configuración

Copia `.env.example` a `.env` y configura:

```bash
# Monitorear grupos específicos (IDs separados por coma)
TARGET_GROUPS=123456789@g.us,987654321@g.us
```

Si `TARGET_GROUPS` está vacío, monitorea todos los grupos.

## Estructura

```
src/
├── index.js              # Cliente principal
├── config/
│   └── index.js          # Configuración
├── handlers/
│   └── messageHandler.js # Manejo de mensajes
└── utils/
    └── dollarDetector.js # Detección de ventas
```

## Personalización

### Agregar palabras clave

Edita `src/config/index.js`:

```javascript
keywords: {
  currency: ['dolar', 'dolares', 'usd', ...],
  action: ['vendo', 'venta', 'disponible', ...],
  price: ['bs', 'bolivares', 'tasa', ...],
}
```

### Acciones al detectar venta

Edita `src/handlers/messageHandler.js` en la función `handleMessage`:

```javascript
if (result.isDollarSale) {
  // Responder al mensaje
  await message.reply('Venta detectada!');

  // O guardar en base de datos
  // await db.save({ sender, amount, rate, ... });

  // O enviar notificación
  // await sendTelegramNotification(result);
}
```

## Advertencia

WhatsApp no permite oficialmente bots. Usar con precaución.
