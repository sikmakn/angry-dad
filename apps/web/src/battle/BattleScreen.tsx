import { useState } from 'react';
import type { Me, Schema } from '../api/contract';
import { ApiError } from '../api/client';
import { Meter } from '../components/Meter';
import { Feedback } from '../components/Feedback';
import { Sheet } from '../components/Sheet';
import { ShopContent } from '../shop/ShopContent';
import { ParentFace } from './components/ParentFace';
import { modeLabel } from './battleFormat';
import { BattleLog } from './components/BattleLog';
import { BattleComposer } from './components/BattleComposer';
import { useBattle } from './hooks/useBattle';

export function BattleScreen({ me, share }: { me: Me; share: (body: Schema<'CreateShareRequest'>) => void }) {
  const battle = useBattle(me);
  const [shop, setShop] = useState(false);
  const dialog = battle.dialog.data;
  const messages = battle.messages.data?.pages.flatMap(page => page.items).toSorted((a, b) => a.seq - b.seq) ?? [];
  const busy = !!(battle.turn.isPending || dialog?.turnInProgress);
  const balance = battle.balance.data?.balance;
  const mother = me.role === 'mother';
  const roleName = mother ? 'Мама' : 'Батя';
  const broken = battle.result?.messages.some(message => message.origin === 'break');
  const failed = battle.turn.error instanceof ApiError && battle.turn.error.problem?.type === 'urn:angry-dad:problem:turn_failed';
  return (
    <>
      <header className="row">
        {dialog && <ParentFace mode={dialog.mode} mother={mother} broken={dialog.defeat === 100} />}
        <div>
          <div className="eyebrow">Бой</div>
          <h1 tabIndex={-1}>{roleName}</h1>
          {dialog && <p className="small muted">{modeLabel(dialog.mode, mother, dialog.defeat === 100)}</p>}
        </div>
        <button className="btn small ghost" disabled={busy} onClick={() => share({ kind: 'battle', role: me.role })}>Поделиться</button>
      </header>
      <Feedback pending={battle.dialog.isPending || battle.messages.isPending || battle.balance.isPending} error={battle.dialog.error ?? battle.messages.error ?? battle.balance.error} />
      {(battle.dialog.isError || battle.messages.isError || battle.balance.isError) && (
        <button
          className="btn ghost"
          onClick={() => {
            void battle.dialog.refetch();
            void battle.messages.refetch();
            void battle.balance.refetch();
          }}
        >
          Повторить
        </button>
      )}
      {dialog && (
        <div className="card stack">
          <Meter label="Уважение" value={battle.result?.respect ?? me.respect} />
          <Meter label="Побеждённость" value={dialog.defeat} red />
          <p className="hint">Побеждённость сама снижается на 25 в сутки, пока ты не бьёшь. Уважение не откатывается.</p>
          <div className="row">
            <b>
              {`Удары: ${balance ?? '…'}`}
            </b>
            <button className="btn ghost small" disabled={busy} onClick={() => setShop(true)}>Купить</button>
          </div>
        </div>
      )}
      {battle.messages.hasNextPage && (
        <button className="btn ghost" disabled={battle.messages.isFetchingNextPage} onClick={() => void battle.messages.fetchNextPage()}>Более ранние реплики</button>
      )}
      <BattleLog messages={messages} role={me.role!} busy={busy} />
      {dialog && messages.length <= 1 && (
        <div className="card stack">
          <h2>Как это работает</h2>
          <p className="small">
            {`Пиши по делу: ${roleName} засчитывает аргументы, а не крик. Каждая реплика стоит 1 удар. Доведи побеждённость до 100, и ${mother ? 'мама сломлена' : 'Батя сломлен'}.`}
          </p>
        </div>
      )}
      {battle.result && (
        <div role="status" className="banner">
          <p>
            {`Ход засчитан. Побеждённость ${battle.result.defeatBefore} → ${battle.result.defeatAfter}. Уважение ${battle.result.respect - battle.result.respectDelta} → ${battle.result.respect} (+${battle.result.respectDelta}). Списан 1 удар, осталось ${battle.result.strikesBalance}.`}
          </p>
          {broken && (
            <div className="stack">
              <div className="stamp">{mother ? 'Мама сломлена' : 'Батя сломлен'}</div>
              <p>{mother ? 'Мама на несколько дней мягче, проверки реже.' : 'Батя на несколько дней мягче, проверки реже.'}</p>
              <button className="btn" onClick={() => share({ kind: 'battle', role: me.role })}>Поделиться</button>
            </div>
          )}
        </div>
      )}
      {failed ? <p className="banner" role="alert">Ход не засчитан, удар возвращён. Шкалы остались прежними, реплика на месте: отправь ещё раз.</p> : <Feedback error={battle.turn.error} />}
      {battle.unknown && <p className="banner" role="status">Результат пока неизвестен. Проверь ту же попытку: второй удар не спишется.</p>}
      <BattleComposer text={battle.text} setText={battle.setText} send={() => void battle.send()} buy={() => setShop(true)} busy={busy} unknown={battle.unknown} ready={!!dialog && balance !== undefined} balance={balance ?? 0} roleName={roleName} />
      {shop && (
        <Sheet title="Удары" close={() => setShop(false)}>
          <ShopContent me={me} compact />
        </Sheet>
      )}
    </>
  );
}
