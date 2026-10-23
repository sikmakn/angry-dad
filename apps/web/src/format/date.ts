export function formatDate(value: string, timeZone: string) {
  return new Intl.DateTimeFormat('ru', { timeZone, day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }).format(new Date(value));
}
