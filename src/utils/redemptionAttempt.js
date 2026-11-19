const keyFor = userId => `rewards:attempt:${userId}`;

export function loadAttempt(storage, userId) {
  if (!userId) return null;
  let raw;
  try { raw = storage.getItem(keyFor(userId)); }
  catch { throw new Error('No se pudo leer el canje guardado. Habilitá el almacenamiento de esta pestaña y reintentá.'); }
  if (!raw) return null;
  try {
    const attempt = JSON.parse(raw);
    if (attempt.userId === userId && typeof attempt.productId === 'string' && typeof attempt.key === 'string') return attempt;
  } catch { /* Keep malformed storage from being mistaken for a safe new attempt. */ }
  throw new Error('No se pudo recuperar el canje pendiente. Conservá esta pestaña y volvé a intentar.');
}

export function beginAttempt(storage, userId, productId, newKey = () => crypto.randomUUID()) {
  if (!userId) throw new Error('No se pudo identificar tu sesión.');
  const previous = loadAttempt(storage, userId);
  if (previous) {
    if (previous.productId !== productId) throw new Error('Hay un canje pendiente. Recuperalo antes de elegir otro producto.');
    return previous;
  }
  const attempt = { userId, productId, key: newKey() };
  try { storage.setItem(keyFor(userId), JSON.stringify(attempt)); }
  catch { throw new Error('No se pudo guardar la clave del canje. Habilitá el almacenamiento de esta pestaña y reintentá.'); }
  return attempt;
}

export function finishAttempt(storage, userId) { storage.removeItem(keyFor(userId)); }
export const isDefiniteRejection = error => [400, 404, 409].includes(error?.status);
