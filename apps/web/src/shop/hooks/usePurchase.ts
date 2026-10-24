import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Me } from '../../api/contract';
import { useRead, useWrite } from '../../hooks/useApi';
import { config, telegram } from '../../platform/telegram';

export function usePurchase(me: Me) {
  const invoice = useWrite(me.id, 'createInvoice');
  const [status, setStatus] = useState('');
  const [waiting, setWaiting] = useState(false);
  const [before, setBefore] = useState(0);
  const mounted = useRef(true);
  const balance = useRead(me.id, 'getMyStrikes', {}, true, waiting);
  const client = useQueryClient();
  const credited = waiting && (balance.data?.balance ?? 0) > before;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    if (!waiting || credited) {
      return;
    }
    const timer = window.setTimeout(() => {
      setStatus('Оплата прошла, но огрызнуться пока не получается. Подожди и обнови баланс. Если не появились — /paysupport в боте.');
    }, 60000);
    return () => window.clearTimeout(timer);
  }, [waiting, credited, before]);
  useEffect(() => {
    if (credited) {
      void client.invalidateQueries({ queryKey: [me.id, 'listMyStrikeOperations'] });
    }
  }, [credited, client, me.id]);
  const app = telegram();
  const available = !!app?.initData && app.isVersionAtLeast('6.1') && !config.mocks;
  async function buy(packageId: string) {
    if (!available || (waiting && !credited) || invoice.isPending) {
      return;
    }
    try {
      const response = await invoice.run({ path: { packageId } });
      if (!response || !mounted.current) {
        return;
      }
      setBefore(balance.data?.balance ?? 0);
      setStatus('Оплата в процессе. Окно оплаты Telegram открыто. Закончи платёж там — возможность огрызнуться появится сама.');
      setWaiting(true);
      app.openInvoice(response.invoiceUrl, (result) => {
        if (!mounted.current) {
          return;
        }
        if (result === 'cancelled' || result === 'failed') {
          setWaiting(false);
          setStatus('Оплата не прошла. Попытки не добавлены, баланс прежний. Можно попробовать ещё раз.');
        } else {
          setStatus('Платёж принят. Огрызнуться можно будет в течение минуты. Второй раз платить не нужно.');
          void balance.refetch();
        }
      });
    } catch { /* No automatic invoice retries. */ }
  }
  return { invoice, balance, buy, available, waiting: waiting && !credited, status: credited ? `Теперь можно огрызнуться. ${me.role === 'mother' ? 'Мама' : 'Батя'} уже ждёт.` : status };
}
