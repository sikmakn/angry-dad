import { useEffect, useRef, useState } from 'react';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import type { CheckInAnswer, Me, Schema } from '../../api/contract';
import { usePages, useWrite } from '../../hooks/useApi';

export function useNotification(id: string, me: Me) {
  const client = useQueryClient();
  const feed = usePages(me.id, 'listFeed', {}, true, true);
  const message = feed.data?.pages.flatMap(page => page.items).find(item => item.id === id);
  const readAttempt = useRef<string | undefined>(undefined);
  const { hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage } = feed;
  useEffect(() => {
    if (!message && hasNextPage && !isFetchingNextPage && !isFetchNextPageError) {
      void fetchNextPage();
    }
  }, [message, hasNextPage, isFetchingNextPage, isFetchNextPageError, fetchNextPage]);
  const answer = useWrite(me.id, 'answerCheckIn');
  const read = useWrite(me.id, 'markFeedMessageRead', (updated) => {
    client.setQueryData<InfiniteData<Schema<'FeedListResponse'>>>([me.id, 'listFeed', undefined, undefined], cached => cached && ({ ...cached, pages: cached.pages.map(page => ({ ...page, items: page.items.map(item => item.id === updated.id ? updated : item) })) }));
  });
  const markRead = read.mutate;
  useEffect(() => {
    if (message && !message.readAt && readAttempt.current !== id) {
      readAttempt.current = id;
      markRead({ path: { feedMessageId: id } });
    }
  }, [message, id, markRead]);
  const rating = useWrite(me.id, 'rateFeedMessage', (updated) => {
    client.setQueryData<InfiniteData<Schema<'FeedListResponse'>>>([me.id, 'listFeed', undefined, undefined], cached => cached && ({ ...cached, pages: cached.pages.map(page => ({ ...page, items: page.items.map(item => item.id === updated.id ? updated : item) })) }));
  });
  const [result, setResult] = useState<Schema<'PeriodActionResponse'>>();
  const [answered, setAnswered] = useState<CheckInAnswer>();
  async function checkAnswer(value: CheckInAnswer) {
    try {
      const response = await answer.run({ path: { feedMessageId: id }, body: { answer: value } });
      if (response) {
        setResult(response);
        setAnswered(value);
      }
    } catch { /* The error is shown next to the answer controls. */ }
  }
  return { feed, message, answer, rating, read, result, answered, checkAnswer };
}
