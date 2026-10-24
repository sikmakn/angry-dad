import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';
import { request, type RequestOptions } from '../api/client';
import type { ClientOperation } from '../api/operations';
import type { Query, Result } from '../api/contract';

export function useRead<K extends ClientOperation>(scope: string, operation: K, options: RequestOptions<K> = {}, enabled = true, poll = false) {
  return useQuery({
    queryKey: [scope, operation, options.path, options.query],
    queryFn: ({ signal }) => request(operation, { ...options, signal }),
    enabled,
    staleTime: 15000,
    retry: false,
    refetchInterval: poll ? 3000 : false,
  });
}

export function usePages<K extends ClientOperation>(scope: string, operation: K, options: RequestOptions<K> = {}, enabled = true, poll = false) {
  return useInfiniteQuery({
    queryKey: [scope, operation, options.path, options.query],
    queryFn: ({ signal, pageParam }) => request(operation, { ...options, signal, query: { ...(options.query as Record<string, unknown> | undefined), cursor: pageParam, limit: 100 } as Query<K> }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: page => (page as { nextCursor?: string | null }).nextCursor ?? undefined,
    enabled,
    retry: false,
    staleTime: 10000,
    refetchInterval: poll ? 5000 : false,
  });
}

export function useWrite<K extends ClientOperation>(scope: string, operation: K, onSuccess?: (data: Result<K>) => void) {
  const client = useQueryClient();
  const locked = useRef(false);
  const mutation = useMutation({
    mutationFn: (options: RequestOptions<K>) => request(operation, options),
    retry: false,
    onSuccess: data => onSuccess?.(data),
    onSettled: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: [scope] }),
        client.invalidateQueries({ queryKey: ['session', 'getMe'] }),
      ]);
    },
  });
  const run = async (options: RequestOptions<K>) => {
    if (locked.current) {
      return undefined;
    }
    locked.current = true;
    try {
      return await mutation.mutateAsync(options);
    } finally {
      locked.current = false;
    }
  };
  return { ...mutation, run };
}
