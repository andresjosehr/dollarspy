import { config } from '../config/index.js';

/**
 * Resultado del análisis de un mensaje
 * @typedef {Object} DetectionResult
 * @property {boolean} isDollarSale - Si es una transacción de dólares
 * @property {string} type - 'sell' | 'buy' | null
 * @property {number} confidence - Nivel de confianza (0-1)
 * @property {Object} details - Detalles extraídos
 */

/**
 * Detecta si un mensaje es una venta/compra de dólares
 * @param {string} message - Texto del mensaje
 * @returns {DetectionResult}
 */
export function detectDollarSale(message) {
  if (!message || typeof message !== 'string') {
    return { isDollarSale: false, type: null, confidence: 0, details: {} };
  }

  const text = message.toLowerCase();
  const details = {
    foundKeywords: [],
    amounts: [],
    rates: [],
    paymentMethods: [],
  };

  let score = 0;
  let type = null;

  // === DETECCIÓN DIRECTA: "Vendo 100", "Tengo 50" ===
  const sellWithNumber = text.match(config.patterns.sellWithNumber);
  if (sellWithNumber) {
    score += 0.6; // Alta probabilidad
    type = 'sell';
    details.amounts = sellWithNumber;
    details.foundKeywords.push('patrón: acción + número');
  }

  // === PALABRAS CLAVE DE MONEDA ===
  const currencyMatches = config.keywords.currency.filter((kw) =>
    text.includes(kw.toLowerCase())
  );
  if (currencyMatches.length > 0) {
    score += 0.3;
    details.foundKeywords.push(...currencyMatches);
  }

  // === ACCIONES DE VENTA ===
  const sellMatches = config.keywords.sell.filter((kw) =>
    text.includes(kw.toLowerCase())
  );
  if (sellMatches.length > 0) {
    score += 0.25;
    if (!type) type = 'sell';
    details.foundKeywords.push(...sellMatches);
  }

  // === ACCIONES DE COMPRA ===
  const buyMatches = config.keywords.buy.filter((kw) =>
    text.includes(kw.toLowerCase())
  );
  if (buyMatches.length > 0) {
    score += 0.25;
    if (!type) type = 'buy';
    details.foundKeywords.push(...buyMatches);
  }

  // === MÉTODOS DE PAGO (implican USD) ===
  const paymentMatches = config.keywords.paymentMethods.filter((kw) =>
    text.includes(kw.toLowerCase())
  );
  if (paymentMatches.length > 0) {
    score += 0.3;
    details.paymentMethods = paymentMatches;
    details.foundKeywords.push(...paymentMatches);
  }

  // === PALABRAS DE PRECIO/TASA ===
  const priceMatches = config.keywords.price.filter((kw) =>
    text.includes(kw.toLowerCase())
  );
  if (priceMatches.length > 0) {
    score += 0.15;
    details.foundKeywords.push(...priceMatches);
  }

  // === PATRONES DE MONTOS ===
  const dollarAmounts = text.match(config.patterns.dollarAmount);
  if (dollarAmounts) {
    score += 0.2;
    details.amounts = [...(details.amounts || []), ...dollarAmounts];
  }

  // === PATRONES DE TASA ===
  const rates = text.match(config.patterns.exchangeRate);
  if (rates) {
    score += 0.15;
    details.rates = rates;
  }

  // Normalizar score a máximo 1
  const confidence = Math.min(score, 1);

  // Umbral de detección: 40%
  const isDollarSale = confidence >= 0.4;

  return {
    isDollarSale,
    type: isDollarSale ? type : null,
    confidence,
    details,
  };
}

/**
 * Formatea el resultado de detección para logging
 * @param {DetectionResult} result
 * @param {string} sender
 * @returns {string}
 */
export function formatDetection(result, sender) {
  if (!result.isDollarSale) return null;

  const typeLabel = result.type === 'buy' ? 'COMPRA' : 'VENTA';
  const parts = [
    `[${typeLabel} DETECTADA] Confianza: ${(result.confidence * 100).toFixed(0)}%`,
    `De: ${sender}`,
  ];

  if (result.details.amounts?.length > 0) {
    parts.push(`Montos: ${result.details.amounts.join(', ')}`);
  }

  if (result.details.rates?.length > 0) {
    parts.push(`Tasas: ${result.details.rates.join(', ')}`);
  }

  if (result.details.paymentMethods?.length > 0) {
    parts.push(`Pago: ${result.details.paymentMethods.join(', ')}`);
  }

  return parts.join(' | ');
}
