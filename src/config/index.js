// Configuración del bot
export const config = {
  // Palabras clave que indican venta de dólares
  keywords: {
    // Palabras que indican la moneda (explícitas)
    currency: [
      'dolar', 'dolares', 'dollar', 'dollars',
      'usd', 'us$', 'u$d',
      'verdes', 'verde',           // slang
      'divisas', 'divisa',
      'efectivo americano',
    ],

    // Acciones de venta
    sell: [
      'vendo', 'venta', 'vendiendo',
      'ofrezco', 'oferto', 'ofresco',
      'disponible', 'disponibles',
      'tengo', 'cuento con',
      'liquido', 'remato',
      'cambio',                     // ambiguo pero común
      'selling', 'sell', 'for sale',
    ],

    // Acciones de compra (para detectar también)
    buy: [
      'compro', 'busco', 'necesito',
      'quien vende', 'quién vende',
      'buying', 'looking for',
    ],

    // Métodos de pago en USD (implican dólares)
    paymentMethods: [
      'zelle', 'paypal', 'venmo',
      'binance', 'usdt',
      'cash app', 'cashapp',
      'transferencia usa',
      'banco america', 'bank of america', 'bofa',
      'wells fargo', 'chase',
    ],

    // Palabras de precio/tasa
    price: [
      'bs', 'bolivares', 'bolivar', 'bsf', 'bss',
      'tasa', 'rate', 'cambio a',
      'precio', 'price',
    ],
  },

  // Patrones regex
  patterns: {
    // "Vendo 100", "tengo 50", "disponible 200" - acción + número
    sellWithNumber: /\b(vendo|tengo|disponible|disponibles|ofrezco|liquido|cambio)\s+(\d+[\d.,]*)/gi,

    // Detecta montos como: $100, 100$, 100 USD, USD 100
    dollarAmount: /(?:\$\s*[\d,.]+|[\d,.]+\s*\$|[\d,.]+\s*(?:usd|dolares?|dollars?|verdes)|\b(?:usd|us\$)\s*[\d,.]+)/gi,

    // Detecta tasas como: 36.5 bs, tasa 36, @36.50, a 36
    exchangeRate: /(?:@\s*[\d,.]+|[\d,.]+\s*(?:bs|bss?|bolivares?)|tasa[:\s]*[\d,.]+|\ba\s+[\d,.]+(?:\s*bs)?)/gi,

    // Números solos (para contexto)
    standaloneNumber: /\b\d+(?:[.,]\d+)?\b/g,
  },

  // Configuración de sesión
  session: {
    authPath: './.wwebjs_auth',
  },

  // Notificaciones (para futuro uso)
  notifications: {
    enabled: false,
  },
};
