import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_FILE = path.join(__dirname, '../../data/monitored-groups.json');

/**
 * Lee los grupos monitoreados del archivo JSON
 * @returns {Array<{id: string, name: string}>}
 */
export function getMonitoredGroups() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * Guarda los grupos monitoreados
 * @param {Array<{id: string, name: string}>} groups
 */
export function saveMonitoredGroups(groups) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(groups, null, 2));
}

/**
 * Agrega un grupo a la lista de monitoreados
 * @param {string} id - ID del grupo
 * @param {string} name - Nombre del grupo
 * @returns {boolean} - true si se agregó, false si ya existía
 */
export function addGroup(id, name) {
  const groups = getMonitoredGroups();
  if (groups.some((g) => g.id === id)) {
    return false;
  }
  groups.push({ id, name });
  saveMonitoredGroups(groups);
  return true;
}

/**
 * Elimina un grupo de la lista de monitoreados
 * @param {string} id - ID del grupo
 * @returns {boolean} - true si se eliminó, false si no existía
 */
export function removeGroup(id) {
  const groups = getMonitoredGroups();
  const filtered = groups.filter((g) => g.id !== id);
  if (filtered.length === groups.length) {
    return false;
  }
  saveMonitoredGroups(filtered);
  return true;
}

/**
 * Verifica si un grupo está siendo monitoreado
 * @param {string} id - ID del grupo
 * @returns {boolean}
 */
export function isMonitored(id) {
  const groups = getMonitoredGroups();
  return groups.some((g) => g.id === id);
}
