const CALLMEBOT_USERS = ['andresjosehr', 'esthefalop'];

/**
 * Envía notificación via CallMeBot a todos los usuarios
 * @param {string} text - Mensaje a enviar
 */
export async function notify(text) {
  for (const user of CALLMEBOT_USERS) {
    try {
      const url = new URL('https://api.callmebot.com/text.php');
      url.searchParams.set('user', user);
      url.searchParams.set('text', text);

      const res = await fetch(url.toString());

      if (!res.ok) {
        console.error(`Error enviando notificación a ${user}:`, res.status);
      }
    } catch (error) {
      console.error(`Error en notificación a ${user}:`, error.message);
    }
  }
}

/**
 * Formatea y envía notificación de venta detectada
 * @param {Object} params
 * @param {string} params.type - 'sell' o 'buy'
 * @param {string} params.sender - Nombre del remitente
 * @param {string} params.phone - Teléfono del remitente
 * @param {string} params.group - Nombre del grupo
 * @param {string} params.message - Mensaje original
 * @param {number} params.confidence - Confianza (0-1)
 */
export async function notifyDollarSale({ type, sender, phone, group, message, confidence }) {
  const typeLabel = type === 'buy' ? 'COMPRA' : 'VENTA';
  const confidencePercent = Math.round(confidence * 100);
  const phoneDisplay = phone ? `+${phone}` : 'N/A';

  const text = `💵 ${typeLabel} DETECTADA

Grupo: ${group}
De: ${sender}
Tel: ${phoneDisplay}
Confianza: ${confidencePercent}%

"${message.substring(0, 150)}"`;

  await notify(text);
}
