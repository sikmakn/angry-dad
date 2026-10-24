export function localDate(date: Date, zone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}
export function localMinute(date: Date, zone: string): number {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return Number(parts.find(p => p.type === 'hour')?.value) * 60 + Number(parts.find(p => p.type === 'minute')?.value);
}
export function zonedTime(day: string, minute: number, zone: string): Date {
  const target = Date.parse(`${day}T00:00:00.000Z`) + minute * 60000;
  let result = target;
  for (let i = 0; i < 4; i++) {
    const d = new Date(result);
    const represented = Date.parse(`${localDate(d, zone)}T00:00:00.000Z`) + localMinute(d, zone) * 60000;
    result += target - represented;
  }
  return new Date(result);
}
export function addDays(day: string, count: number): string {
  return new Date(Date.parse(`${day}T12:00:00Z`) + count * 86400000).toISOString().slice(0, 10);
}
