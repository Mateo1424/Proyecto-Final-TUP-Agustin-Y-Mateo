const messages = {
  invalid_redemption: 'No se pudo validar el producto o la clave de este canje.',
  invalid_pagination: 'La página solicitada no es válida.',
  inactive_user: 'Tu cuenta no está activa. Volvé a iniciar sesión.',
  invalid_session: 'Tu sesión expiró. Volvé a iniciar sesión.',
  idempotency_conflict: 'Esta clave ya corresponde a otro canje. No se realizó un nuevo gasto.',
  product_not_found: 'El producto ya no existe en el catálogo.',
  product_unavailable: 'El producto no está disponible para un nuevo canje.',
  balance_unavailable: 'No tenés saldo suficiente o la operación supera los límites permitidos.',
  insufficient_funds: 'No tenés suficientes puntos para este canje.',
};
export const redemptionErrorMessage = error => messages[error?.code] || error?.message || 'No se pudo completar la operación. Reintentá.';
