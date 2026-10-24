export function replyCount(amount: number): string {
  const last = amount % 10, hundred = amount % 100;
  return `${amount} ${last >= 2 && last <= 4 && (hundred < 12 || hundred > 14) ? 'раза' : 'раз'}`;
}
