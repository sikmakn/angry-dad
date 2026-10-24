import type { Me } from '../../api/contract';
import { Feedback } from '../../components/Feedback';
import { Sheet } from '../../components/Sheet';
import { formatDate } from '../../format/date';
import { useOwnerStrikes } from '../hooks/useOwnerStrikes';

export function OwnerStrikes({ me }: { me: Me }) {
  const { input, setInput, id, openUser, reason, setReason, amount, setAmount, type, setType, confirmation, setConfirmation, user, balance, operations, payments, tickets, change, refund, ticket, invalidAmount, pending, notice, confirm, updateTicket } = useOwnerStrikes(me);
  return (
    <>
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault();
          openUser(input);
        }}
      >
        <div className="field">
          <label htmlFor="owner-user">Telegram ID</label>
          <input id="owner-user" type="text" inputMode="numeric" pattern="[0-9]+" required value={input} onChange={event => setInput(event.target.value)} />
        </div>
        <button className="btn">Найти пользователя</button>
      </form>
      <Feedback pending={!!id && user.isPending} error={user.error ?? balance.error ?? operations.error ?? change.error ?? refund.error ?? ticket.error} />
      <Feedback>{notice}</Feedback>
      {(user.isError || balance.isError || operations.isError) && (
        <button
          className="btn ghost"
          onClick={() => {
            void user.refetch();
            if (user.data) {
              void balance.refetch();
              void operations.refetch();
            }
          }}
        >
          Повторить
        </button>
      )}
      {user.data && (
        <>
          <div className="card stack">
            <h2>{user.data.username ? `@${user.data.username}` : user.data.firstName}</h2>
            <p>
              Telegram ID:
              {user.data.telegramId}
            </p>
            <p>
              Попытки:
              {balance.data?.balance ?? '…'}
            </p>
          </div>
          <form
            className="card"
            onSubmit={(event) => {
              event.preventDefault();
              setConfirmation('strikes');
            }}
          >
            <div className="field">
              <label htmlFor="strike-type">Операция</label>
              <select id="strike-type" value={type} onChange={event => setType(event.target.value as typeof type)}>
                <option value="manual_grant">Начислить</option>
                <option value="manual_revoke">Списать</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="strike-amount">Попытки</label>
              <input id="strike-amount" type="number" min={1} max={type === 'manual_revoke' ? balance.data?.balance : undefined} step={1} required value={amount} onChange={event => setAmount(Number(event.target.value))} />
              {invalidAmount && <p className="err" role="alert">Нельзя списать больше баланса. Укажите целое число попыток от 1.</p>}
            </div>
            <div className="field">
              <label htmlFor="strike-reason">Причина</label>
              <textarea id="strike-reason" required maxLength={500} value={reason} onChange={event => setReason(event.target.value)} />
              <p className="hint">Причина обязательна. Попадёт в историю пользователя и в ваш журнал.</p>
            </div>
            <button className="btn" disabled={pending || invalidAmount || !balance.data || !reason.trim()}>Продолжить</button>
          </form>
          <h3>История операций</h3>
          {operations.data?.pages.flatMap(page => page.items).map((item, index) => (
            <p className="card" key={`${item.at}-${index}`}>
              {`${['spend', 'manual_revoke', 'stars_refund'].includes(item.type) ? '−' : '+'}${item.amount}`}
              {' '}
              ·
              {' '}
              {item.reason ?? item.type}
              {' '}
              ·
              {' '}
              {formatDate(item.at, me.timeZone)}
            </p>
          ))}
          {operations.data?.pages.every(page => !page.items.length) && <p>Операций пока нет</p>}
          {operations.hasNextPage && <button className="btn ghost" disabled={operations.isFetchingNextPage} onClick={() => void operations.fetchNextPage()}>Показать ещё</button>}
        </>
      )}
      <h2>Платежи Stars</h2>
      <Feedback pending={payments.isPending} error={payments.error} />
      {payments.isError && <button className="btn ghost" onClick={() => void payments.refetch()}>Повторить</button>}
      {payments.data?.pages.every(page => !page.items.length) && <p>Платежей пока нет</p>}
      {payments.data?.pages.flatMap(page => page.items).map(item => (
        <div className="card stack" key={item.id}>
          <p>
            {item.telegramId}
            {' '}
            ·
            {' '}
            {item.packageSnapshot.priceStars}
            {' '}
            Stars ·
            {' '}
            {item.status}
          </p>
          <button
            className="btn danger"
            disabled={!item.refundable || refund.isPending}
            onClick={() => {
              setReason('');
              setConfirmation(item);
            }}
          >
            Вернуть Stars
          </button>
        </div>
      ))}
      {payments.hasNextPage && <button className="btn ghost" disabled={payments.isFetchingNextPage} onClick={() => void payments.fetchNextPage()}>Показать ещё</button>}
      <h2>Обращения /paysupport</h2>
      <Feedback pending={tickets.isPending} error={tickets.error} />
      {tickets.isError && <button className="btn ghost" onClick={() => void tickets.refetch()}>Повторить</button>}
      {tickets.data?.pages.every(page => !page.items.length) && <p>Обращений нет</p>}
      {tickets.data?.pages.flatMap(page => page.items).map(item => (
        <div key={item.id} className="card stack">
          <p>
            {item.telegramId}
            {' '}
            ·
            {' '}
            {item.text}
          </p>
          <button className="btn ghost" onClick={() => openUser(String(item.telegramId))}>Открыть пользователя</button>
          <button className="btn ghost" disabled={ticket.isPending} onClick={() => void updateTicket(item)}>{item.status === 'open' ? 'Закрыть обращение' : 'Открыть снова'}</button>
        </div>
      ))}
      {tickets.hasNextPage && <button className="btn ghost" disabled={tickets.isFetchingNextPage} onClick={() => void tickets.fetchNextPage()}>Показать ещё</button>}
      {confirmation && (
        <Sheet title={confirmation === 'strikes' ? 'Подтвердить операцию?' : 'Вернуть Stars?'} close={() => !pending && setConfirmation(undefined)}>
          <p>{confirmation === 'strikes' ? `${type === 'manual_grant' ? 'Начислить' : 'Списать'} ${amount} попыток · ${id}` : `Вернуть ${confirmation.packageSnapshot.priceStars} Stars за весь платёж. Партия попыток будет списана.`}</p>
          {confirmation === 'strikes' && <p>{`Баланс: ${balance.data?.balance ?? '…'} → ${(balance.data?.balance ?? 0) + (type === 'manual_grant' ? amount : -amount)}. Причина: ${reason}. Операция попадёт в историю пользователя и журнал.`}</p>}
          {confirmation !== 'strikes' && (
            <div className="field">
              <label htmlFor="refund-reason">Причина</label>
              <textarea id="refund-reason" required maxLength={500} value={reason} onChange={event => setReason(event.target.value)} />
            </div>
          )}
          <Feedback error={change.error ?? refund.error} />
          <button className="btn danger" disabled={!reason.trim() || pending} onClick={() => void confirm()}>Подтвердить</button>
        </Sheet>
      )}
    </>
  );
}
