/* ==========================================================================
   services/localStorage.js — localStorage centralizado con manejo de excepciones.
   ========================================================================== */

const isAvailable = (() => {
  try {
    const test = '__eam_test__';
    window.localStorage.setItem(test, test);
    window.localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
})();

/**
 * lee y parsea un valor JSON desde localStorage.
 * @param {string} key 
 * @returns {*} valor parseado o null en caso de error / no disponible.
 */
export function getJSON(key) {
  if (!isAvailable) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null || raw === undefined) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * serializa y escribe un valor JSON en localStorage.
 * @param {string} key - Storage key.
 * @param {*} value - Value to store.
 */
export function setJSON(key, value) {
  if (!isAvailable) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or other storage error — silently ignore
  }
}

/**
 * lee y parsea un valor JSON desde localStorage.
 * @param {string} key 
 * @returns {*} valor parseado o null en caso de error / no disponible.
 */
export function getJSONSession(key) {
  try {
    const raw = window.sessionStorage.getItem(key);
    if (raw === null || raw === undefined) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * serializa y escribe un valor JSON en localStorage.
 * @param {string} key 
 * @param {*} value 
 */
export function setJSONSession(key, value) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignorar
  }
}

export { isAvailable };
