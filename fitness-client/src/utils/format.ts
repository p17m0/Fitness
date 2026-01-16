export const formatPrice = (price?: number, currency?: string) => {
  // if (typeof price !== 'number' || !currency) return '—';
  return `${(price).toLocaleString('ru-RU')} рублей`;
};

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });



