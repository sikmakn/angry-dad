import { replyCount } from './replyCount';
import { useState } from 'react';
import type { Me } from '../api/contract';
import { usePages, useRead } from '../hooks/useApi';
import { Feedback } from '../components/Feedback';
import { formatDate } from '../format/date';
import { usePurchase } from './hooks/usePurchase';

const labels = { purchase: 'Покупка', spend: 'Списание: реплика в перепалке', turn_refund: 'Возврат: ошибка хода', manual_grant: 'Начисление от владельца', manual_revoke: 'Списание владельцем', stars_refund: 'Возврат Stars' };

export function ShopContent({ me, compact = false }: { me: Me; compact?: boolean }) {
  const packages = useRead(me.id, 'listPackages');
  const history = usePages(me.id, 'listMyStrikeOperations', {}, !compact);
  const purchase = usePurchase(me);
  const [selection, setSelection] = useState<string>();
  const selected = packages.data?.items.find(pack => pack.id === selection) ?? packages.data?.items[0];
  return (
    <>
      <div className="card row">
        <b>{purchase.balance.data ? `Можешь огрызнуться ещё ${replyCount(purchase.balance.data.balance)}` : 'Проверяем, сколько осталось…'}</b>
        <button className="btn small ghost" onClick={() => void purchase.balance.refetch()}>Обновить баланс</button>
      </div>
      <p className="small muted">{me.role === 'mother' ? 'Одна реплика — один раз огрызнуться Маме. Молчать пока бесплатно.' : 'Одна реплика — один раз огрызнуться Бате. Молчать пока бесплатно.'}</p>
      <Feedback pending={packages.isPending || purchase.balance.isPending} error={packages.error ?? purchase.balance.error ?? purchase.invoice.error} />
      {!purchase.available && <p className="banner">Оплата Stars доступна только в Telegram. В режиме моков настоящие платежи отключены.</p>}
      {purchase.status && <p className="banner" role="status">{purchase.status}</p>}
      {!purchase.waiting && (
        <fieldset className="stack" disabled={!purchase.available || purchase.invoice.isPending}>
          <legend>Сколько раз огрызнуться?</legend>
          {packages.data?.items.map(pack => (
            <label className="card row" key={pack.id}>
              <input type="radio" name="strike-package" checked={selected?.id === pack.id} onChange={() => setSelection(pack.id)} />
              <span>{`Огрызнуться ${replyCount(pack.strikes)}`}</span>
              <b>{`${pack.priceStars} Stars`}</b>
            </label>
          ))}
        </fieldset>
      )}
      <button
        className="btn"
        disabled={!selected || !purchase.available || purchase.invoice.isPending || purchase.waiting}
        onClick={() => {
          if (selected) {
            void purchase.buy(selected.id);
          }
        }}
      >
        {purchase.waiting ? 'Ждём оплату…' : `Огрызнуться ${selected ? replyCount(selected.strikes) : '…'} — ${selected?.priceStars ?? '…'} ⭐`}
      </button>
      <p className="hint">Оплата Stars откроется прямо здесь, из приложения выходить не нужно. Огрызнуться можно будет в течение минуты после оплаты.</p>
      {packages.isError && <button className="btn ghost" onClick={() => void packages.refetch()}>Повторить</button>}
      {packages.data && !packages.data.items.length && <p className="card">Пакеты пока недоступны.</p>}
      {!compact && (
        <>
          <h2>История операций</h2>
          <Feedback pending={history.isPending} error={history.error} />
          {history.isError && <button className="btn ghost" onClick={() => void history.refetch()}>Повторить</button>}
          <ul className="list">
            {history.data?.pages.flatMap(page => page.items).map((item, index) => (
              <li className="card stack" key={`${item.at}-${index}`}>
                <div className="row">
                  <b>{labels[item.type]}</b>
                  <b>{`${item.amount > 0 ? '+' : ''}${item.amount}`}</b>
                </div>
                <p className="small muted">{formatDate(item.at, me.timeZone)}</p>
                {item.reason && <p>{`Причина: ${item.reason}`}</p>}
              </li>
            ))}
          </ul>
          {history.data?.pages.every(page => !page.items.length) && (
            <div className="card stack">
              <h3>Пока всё тихо</h3>
              <p>Купи возможность огрызнуться — здесь появятся оплата и потраченные попытки.</p>
            </div>
          )}
          {history.hasNextPage && <button className="btn ghost" disabled={history.isFetchingNextPage} onClick={() => void history.fetchNextPage()}>Показать ещё</button>}
        </>
      )}
      <p className="hint">Что-то не так с платежом? Напиши /paysupport в чате с ботом. Условия продажи: /terms.</p>
    </>
  );
}
