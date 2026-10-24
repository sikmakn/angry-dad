import { useRead } from './useApi';

export function useNotificationCounts(userId: string, enabled = true) {
  return useRead(userId, 'listFeed', { query: { limit: 1 } }, enabled, true);
}
