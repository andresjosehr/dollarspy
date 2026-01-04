import { detectDollarSale, formatDetection } from '../utils/dollarDetector.js';
import { isMonitored, getMonitoredGroups } from '../utils/storage.js';
import { notifyDollarSale } from '../utils/notifier.js';

/**
 * Maneja los mensajes entrantes
 * @param {import('whatsapp-web.js').Message} message
 */
export async function handleMessage(message) {
  // Filtros rápidos antes de hacer cualquier llamada async
  const monitoredGroups = getMonitoredGroups();

  // Si no hay grupos configurados, no hacer nada
  if (monitoredGroups.length === 0) {
    return;
  }

  // Solo procesar mensajes de grupos (verificación rápida por ID)
  const chatId = message.from;
  if (!chatId.endsWith('@g.us')) {
    return;
  }

  // Verificar si el grupo está monitoreado
  if (!isMonitored(chatId)) {
    return;
  }

  // Obtener el cuerpo del mensaje
  const messageBody = message.body;
  if (!messageBody) {
    return;
  }

  try {
    // Detectar si es una venta de dólares
    const result = detectDollarSale(messageBody);

    if (result.isDollarSale) {
      // Usar notifyName que sí tiene el nombre real
      let senderName = message._data?.notifyName || message.author || message.from;
      let senderPhone = '';
      let groupName = chatId;

      // Obtener nombre del grupo
      try {
        const chat = await message.getChat();
        groupName = chat.name || chatId;
      } catch {
        // Silenciar error
      }

      // Intentar obtener teléfono (limitado por privacidad de WhatsApp con LIDs)
      try {
        const contact = await message.getContact();
        if (!senderName || senderName.includes('@')) {
          senderName = contact.pushname || contact.number || senderName;
        }
        if (contact.number && /^\d{10,15}$/.test(contact.number)) {
          senderPhone = contact.number;
        }
      } catch {
        // getContact falla con LIDs - limitación de WhatsApp
      }

      // Fallback: extraer de author si es @c.us (no @lid)
      if (!senderPhone && message.author?.endsWith('@c.us')) {
        const match = message.author.match(/^(\d+)@/);
        if (match && /^\d{10,15}$/.test(match[1])) {
          senderPhone = match[1];
        }
      }

      // Loguear la detección
      const logMessage = formatDetection(result, senderName);
      console.log('\n' + '='.repeat(60));
      console.log(logMessage);
      console.log(`Grupo: ${groupName}`);
      console.log(`Mensaje: "${messageBody.substring(0, 100)}${messageBody.length > 100 ? '...' : ''}"`);
      console.log('='.repeat(60) + '\n');

      // Enviar notificación
      await notifyDollarSale({
        type: result.type,
        sender: senderName,
        phone: senderPhone,
        group: groupName,
        message: messageBody,
        confidence: result.confidence,
      });
    }
  } catch (error) {
    console.error('Error procesando mensaje:', error.message);
  }
}

/**
 * Maneja eventos cuando el bot se une a un grupo
 * @param {import('whatsapp-web.js').GroupNotification} notification
 */
export async function handleGroupJoin(notification) {
  console.log(`Bot añadido al grupo: ${notification.chatId}`);
}
