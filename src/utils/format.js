export const points = value => `${new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(value ?? 0)} pts`;
export const money = (value, currency = 'USD') => new Intl.NumberFormat('es-AR', { style: 'currency', currency, currencyDisplay: 'code' }).format(value);
export const dateTime = value => value ? new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value)) : '—';
