import { useState } from 'react';
import type { Me, Schema } from '../api/contract';
import { usePages, useRead, useWrite } from '../hooks/useApi';
import { useClock } from '../hooks/useClock';
import { Feedback } from '../components/Feedback';
import { Quote } from '../components/Quote';
import { Sheet } from '../components/Sheet';
import { TaskOutcome } from './components/TaskOutcome';
import { TaskSummary } from './components/TaskSummary';
import { TaskChecks } from './components/TaskChecks';
import { TaskEdit } from './components/TaskEdit';
import { TaskExtension } from './components/TaskExtension';
import { useTaskActions } from './hooks/useTaskActions';
import { formatDate, rewards, sizeLabels } from './taskFormat';

export function TaskScreen({ id, me, go, share }: { id: string; me: Me; go: (route: string) => void; share: (body: Schema<'CreateShareRequest'>) => void }) {
  const [deleted, setDeleted] = useState<Schema<'ReplyResponse'>>();
  const query = useRead(me.id, 'getTask', { path: { taskId: id } }, !deleted, true);
  const periods = usePages(me.id, 'listTaskPeriods', { path: { taskId: id } }, query.data?.kind === 'recurring');
  const feed = useRead(me.id, 'listFeed', { query: { periodId: query.data?.currentPeriod?.id, category: 'on_check_in', limit: 1 } }, !!query.data?.currentPeriod && !deleted, true);
  const actions = useTaskActions(me);
  const quote = useWrite(me.id, 'createBattleQuote');
  const [dialog, setDialog] = useState<'edit' | 'extend' | 'surrender' | 'delete' | 'stop'>();
  const now = useClock();
  const task = query.data ?? actions.result?.task;
  const period = task?.currentPeriod;
  const checks = feed.data?.items.filter(message => !message.checkIn?.answer) ?? [];
  const active = task?.status === 'active' && period?.status === 'active';
  const result = actions.result?.task.currentPeriod?.id === period?.id ? actions.result : undefined;
  const failed = period?.status === 'failed';
  const finished = task?.status !== 'stopped' && period && period.status !== 'active';
  async function confirm() {
    try {
      if (dialog === 'surrender' && period) {
        if (await actions.periodAction('surrender', period.id)) {
          setDialog(undefined);
        }
      }
      if (dialog === 'stop') {
        await actions.stopTask(id);
        setDialog(undefined);
      }
      if (dialog === 'delete') {
        const response = await actions.remove.run({ path: { taskId: id } });
        if (response) {
          setDeleted(response);
          setDialog(undefined);
        }
      }
    } catch { /* Feedback is rendered in the sheet. */ }
  }
  if (deleted) {
    return (
      <>
        <h1 tabIndex={-1}>Задача удалена</h1>
        {deleted.reply && <Quote text={deleted.reply} role={me.role} />}
        <a className="btn" href="#home">К задачам</a>
        <a className="btn ghost" href="#task-new">Новая задача</a>
      </>
    );
  }
  return (
    <>
      <a className="back" href="#home">← Задачи</a>
      <Feedback pending={query.isPending} error={query.error} />
      {query.isError && <button className="btn ghost" onClick={() => void query.refetch()}>Повторить</button>}
      {task && (
        <>
          {finished && <h1 tabIndex={-1}>{failed ? 'Провал' : 'Готово'}</h1>}
          <span className="tag" data-size={task.size}>{sizeLabels[task.size]}</span>
          {finished && period && <TaskOutcome task={task} period={period} result={result} me={me} />}
          {!finished && (
            <div className="card stack">
              <TaskSummary task={task} me={me} now={now} heading />
              {period && <p className="small">{`Ориентир: ${task.anchorTime ?? 'без ориентира'}. Срок: ${formatDate(period.deadline, me.timeZone)}`}</p>}
            </div>
          )}
          {actions.notice && <Quote text={actions.notice} role={me.role} />}
          <Feedback error={actions.error ?? actions.update.error ?? actions.remove.error ?? quote.error} pending={actions.pending} />
          <Feedback pending={active && feed.isPending} error={feed.error} />
          {feed.isError && <button className="btn ghost" onClick={() => void feed.refetch()}>Повторить загрузку проверок</button>}
          <TaskChecks items={checks} closed={!active} />
          {active && period && (
            <>
              <p className="small muted">{`Закроешь: +${rewards[task.size]} к уважению. Провалишь: −2. Выше 94 — только сломом в перепалке.`}</p>
              <p className="hint">Когда выполнишь задачу, отметь её готовой.</p>
              <button className="btn" disabled={actions.pending} onClick={() => void actions.periodAction('complete', period.id)}>Готово</button>
              <button className="btn danger" disabled={actions.pending} onClick={() => setDialog('surrender')}>Сдаюсь</button>
              <button className="btn ghost" disabled={actions.pending} onClick={() => setDialog('extend')}>Попросить больше времени</button>
            </>
          )}
          {failed && period && (
            <>
              <p>Снятое уважение не возвращается.</p>
              <button className="btn" disabled={period.retryUsed || actions.pending || task.status === 'stopped'} onClick={() => void actions.periodAction('retry', period.id)}>Сделаю за час</button>
              <p className="hint">{period.retryUsed ? 'Час по этому периоду уже был.' : '«Сделаю за час» работает один раз на период и только пока следующий не начался. Снятое уважение не возвращается.'}</p>
              {period.failMessage && <button className="btn ghost" disabled={quote.isPending} onClick={() => void quote.run({ path: { role: me.role! }, body: { feedMessageId: period.failMessage!.id }, key: crypto.randomUUID() }).then(response => response && go('battle')).catch(() => {})}>Ответить</button>}
            </>
          )}
          {finished && period && (
            <>
              <button className="btn ghost" onClick={() => share({ kind: failed ? 'fail' : 'done', periodId: period.id })}>Поделиться</button>
              <a className="btn" href="#task-new">Новая задача</a>
            </>
          )}
          {task.nextPeriodStartsAt && <p className="card">{`Следующий период — ${formatDate(task.nextPeriodStartsAt, me.timeZone)}. До него проверок и напоминаний нет.`}</p>}
          {task.status === 'stopped' && <p className="banner">Остановлена. Новых периодов не будет, сообщений по задаче нет.</p>}
          {task.kind === 'recurring' && (
            <section className="stack">
              <h2>Периоды</h2>
              <Feedback pending={periods.isPending} error={periods.error} />
              {periods.isError && <button className="btn ghost" onClick={() => void periods.refetch()}>Повторить</button>}
              <ul className="list">
                {periods.data?.pages.flatMap(page => page.items).map(item => <li key={item.id} className="card">{`${formatDate(item.startsAt, me.timeZone)} · ${item.status === 'active' ? 'Идёт' : item.status === 'done' ? 'Закрыт' : 'Провален'} · ${item.respectDelta ?? 0}`}</li>)}
              </ul>
              {periods.hasNextPage && <button className="btn ghost" disabled={periods.isFetchingNextPage} onClick={() => void periods.fetchNextPage()}>Показать более ранние</button>}
              {task.status === 'active' && <button className="btn danger" onClick={() => setDialog('stop')}>Остановить задачу</button>}
            </section>
          )}
          {task.status === 'active' && (
            <details className="task-management">
              <summary>Другие действия</summary>
              <div className="stack">
                <button className="btn ghost" onClick={() => setDialog('edit')}>Изменить название</button>
              </div>
            </details>
          )}
          <div className="task-delete">
            <button className="btn neutral" onClick={() => setDialog('delete')}>Удалить задачу</button>
            <p className="task-delete-note">
              <span>— для</span>
              {' '}
              <span>разочарований</span>
            </p>
          </div>
          {dialog === 'edit' && <TaskEdit task={task} me={me} close={() => setDialog(undefined)} />}
          {dialog === 'extend' && period && <TaskExtension period={period} timeZone={me.timeZone} recurring={task.kind === 'recurring'} pending={actions.pending} error={actions.error} extend={deadline => actions.periodAction('extend', period.id, deadline)} close={() => setDialog(undefined)} />}
          {dialog && dialog !== 'edit' && dialog !== 'extend' && (
            <Sheet title={dialog === 'surrender' ? 'Сдаёшься?' : dialog === 'stop' ? 'Остановить задачу?' : 'Удалить задачу?'} close={() => setDialog(undefined)}>
              <p>{dialog === 'surrender' ? `Задача станет проваленной, уважение упадёт на 1: с ${Math.floor(me.respect)} до ${Math.max(0, Math.floor(me.respect - 1))}. ${task.kind === 'recurring' ? 'Проваливает только текущий период. Задача остаётся.' : 'Вернуть снятое нельзя.'}` : dialog === 'stop' ? 'Новые периоды открываться не будут, проверки и напоминания прекратятся. Уважение не изменится. Прошлые периоды останутся в списке.' : 'Она исчезнет из списка и истории. Если задача закрыта, пропадёт и из рейтинга. Уважение останется как есть.'}</p>
              <Feedback error={actions.error ?? actions.update.error ?? actions.remove.error} />
              <button className="btn danger" disabled={actions.pending} onClick={() => void confirm()}>{dialog === 'surrender' ? 'Да, сдаюсь' : dialog === 'stop' ? 'Остановить' : 'Удалить'}</button>
            </Sheet>
          )}
        </>
      )}
    </>
  );
}
