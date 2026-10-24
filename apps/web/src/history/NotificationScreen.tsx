import type { Me, Rating } from '../api/contract';
import { Feedback } from '../components/Feedback';
import { Quote } from '../components/Quote';
import { PenCheck } from '../components/PenCheck';
import { NotificationCard } from './components/NotificationCard';
import { ratingOptions } from './notificationFormat';
import { useNotification } from './hooks/useNotification';
import { NotificationState } from './components/NotificationState';
import { ReplyInBattle } from './components/ReplyInBattle';

export function NotificationScreen({ id, me, go }: { id: string; me: Me; go: (route: string) => void }) {
  const notification = useNotification(id, me);
  const { feed, message, answer, rating, result } = notification;
  const answered = notification.answered ?? message?.checkIn?.answer;
  const settled = !!answered || message?.needsAnswer === false;
  const selectedRating = message?.rating;
  const searching = feed.isPending || (!message && (feed.hasNextPage || feed.isFetchingNextPage));
  return (
    <>
      <a className="back" href="#history">← История</a>
      <h1 tabIndex={-1}>Сообщение тебе</h1>
      <Feedback pending={searching && !feed.isError} error={feed.error} />
      {feed.isError && <button className="btn ghost" onClick={() => void feed.refetch()}>Повторить загрузку</button>}
      {!message && !searching && !feed.isError && <p className="card">Уведомление не найдено. Возможно, оно было удалено.</p>}
      {message && (
        <NotificationCard message={message} me={me} state={<NotificationState message={message} />}>
          {message.category === 'on_check_in' && !answered && message.needsAnswer !== false && (
            <div className="stack">
              <h2>Как продвигается задача?</h2>
              <p className="hint">{message.checkIn?.expired || message.checkIn?.missedAt ? 'Срок уже вышел. Ответить ещё можно.' : 'Срок общий для проверок этой задачи. Ответь до конца отсчёта, чтобы не потерять уважение.'}</p>
              <div className="notification-answers">
                {([['done', 'Сделано'], ['partial', 'Делаю'], ['not_started', me.gender === 'female' ? 'Не начинала' : 'Не начинал']] as const).map(([value, label]) => (
                  <button className="btn ghost" key={value} disabled={answer.isPending} onClick={() => void notification.checkAnswer(value)}>{label}</button>
                ))}
              </div>
            </div>
          )}
          {answered && (
            <p className="notification-receipt marked-result" role="status">
              <PenCheck />
              {`Твой ответ: ${answered === 'done' ? 'Сделано' : answered === 'partial' ? 'Делаю' : me.gender === 'female' ? 'Не начинала' : 'Не начинал'}`}
            </p>
          )}
          <Feedback error={answer.error ?? rating.error} />
          {notification.read.isError && <button className="btn ghost" onClick={() => void notification.read.run({ path: { feedMessageId: id } }).catch(() => {})}>Повторить отметку о прочтении</button>}
          {result?.reply && <Quote text={result.reply} role={me.role} />}
          {message.category === 'on_check_in' && !answered && message.needsAnswer === false && <p className="hint">{message.checkIn?.resolvedAt ? 'Ты уже ответил на другую проверку этой задачи. Эта закрыта без изменения уважения.' : 'Эта проверка уже не ждёт ответа.'}</p>}
          {!settled && <ReplyInBattle key={id} me={me} feedId={id} go={go} />}
          {message.rateable && (
            <div className="notification-rating">
              <p className="hint">Ну что, проняло? Покажи, насколько задело.</p>
              <div className="reaction-options" role="group" aria-label="Насколько задело?">
                {ratingOptions.map((option, value) => (
                  <button className="reaction" key={option.emoji} aria-label={option.label} aria-pressed={selectedRating === value} disabled={rating.isPending} onClick={() => void rating.run({ path: { feedMessageId: id }, body: { score: value as Rating } }).catch(() => {})}>
                    <span aria-hidden="true">{option.emoji}</span>
                    {selectedRating === value && <PenCheck className="reaction-pen-check" />}
                  </button>
                ))}
              </div>
              {selectedRating !== undefined && <p className="notification-rating-reply" role="status">{ratingOptions[selectedRating].feedback}</p>}
            </div>
          )}
          {settled && <ReplyInBattle key={id} me={me} feedId={id} go={go} />}
          {settled && <a className="btn" href="#home">К моим задачам</a>}
        </NotificationCard>
      )}
    </>
  );
}
