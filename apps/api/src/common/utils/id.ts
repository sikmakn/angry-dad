import { randomBytes } from 'node:crypto';
// Timestamp prefix keeps cursor ordering stable for append-only collections.
export function newId(): string {
  const time = Date.now().toString(16).padStart(12, '0');
  const random = randomBytes(10).toString('hex');
  return `${time.slice(0, 8)}-${time.slice(8)}-7${random.slice(0, 3)}-a${random.slice(3, 6)}-${random.slice(6, 18)}`;
}
