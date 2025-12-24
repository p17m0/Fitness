export const formatPrice = (cents?: number, currency?: string) => {
  if (typeof cents !== 'number' || !currency) return '—';
  return `${(cents / 100).toLocaleString('ru-RU')} ${currency}`;
};

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });



