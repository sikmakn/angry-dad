import { replyCount } from '../shop/replyCount';
import { useState } from 'react';
import type { Me, Schema } from '../api/contract';
import { ApiError } from '../api/client';
import { Meter } from '../components/Meter';
import { Feedback } from '../components/Feedback';
import { Sheet } from '../components/Sheet';
import { ShopContent } from '../shop/ShopContent';
import { ParentFace } from './components/ParentFace';
import { authority, authorityTone, modeLabel } from './battleFormat';
import { BattleLog } from './components/BattleLog';
import { BattleComposer } from './components/BattleComposer';
import { BattleHelp } from './components/BattleHelp';
import { useBattle } from './hooks/useBattle';

export function BattleScreen({ me, share }: { me: Me; share: (body: Schema<'CreateShareRequest'>) => void }) {
  const battle = useBattle(me);
  const [shop, setShop] = useState(false);
  const [help, setHelp] = useState(false);
  const dialog = battle.dialog.data;
  const messages = battle.messages.data?.pages.flatMap(page => page.items).toSorted((a, b) => a.seq - b.seq) ?? [];
  const busy = !!(battle.turn.isPending || dialog?.turnInProgress);
  const balance = battle.balance.data?.balance;
  const mother = me.role === 'mother';
  const roleName = mother ? 'Мама' : 'Батя';
  const broken = battle.result?.messages.some(message => message.origin === 'break');
  const failed = battle.turn.error instanceof ApiError && battle.turn.error.problem?.type === 'urn:angry-dad:problem:turn_failed';
  const emptyDialog = battle.messages.isSuccess && !battle.messages.hasNextPage && !battle.result && !busy && messages.every(message => message.origin === 'battle_start');
  return (
    <>
      <header className="row">
        {dialog && <ParentFace mode={dialog.mode} mother={mother} broken={dialog.defeat === 100} />}
        <div>
          <div className="eyebrow">Перепалка</div>
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
      {dialog && emptyDialog && (
        <section className="card stack battle-guide-card" aria-labelledby="battle-how-title">
          <h2 id="battle-how-title">Как это работает</h2>
          <BattleHelp roleName={roleName} mother={mother} />
        </section>
      )}
      {dialog && (
        <div className="card stack battle-stats">
          <button type="button" className="battle-stats-trigger" aria-label="Как устроена перепалка" aria-haspopup="dialog" onClick={() => setHelp(true)} />
          <Meter label="Уважение" value={battle.result?.respect ?? me.respect} />
          <Meter label="Авторитет" value={authority(dialog.defeat)} tone={authorityTone(authority(dialog.defeat))} />
          <p className="hint">Нажми на карточку, чтобы посмотреть правила перепалки.</p>
          <div className="row battle-balance">
            <b>
              {balance === undefined ? 'Считаем, сколько раз можно огрызнуться…' : balance > 0 ? `Можешь огрызнуться ещё ${replyCount(balance)}` : 'Всё? А столько возражений было.'}
            </b>
            <button className="btn ghost small battle-stats-buy" disabled={busy} onClick={() => setShop(true)}>Купить</button>
          </div>
        </div>
      )}
      {battle.messages.hasNextPage && (
        <button className="btn ghost" disabled={battle.messages.isFetchingNextPage} onClick={() => void battle.messages.fetchNextPage()}>Более ранние реплики</button>
      )}
      <BattleLog messages={messages} role={me.role!} busy={busy} />
      {battle.result && (
        <div role="status" className="banner">
          <p>
            {`Ход засчитан. Авторитет ${Math.floor(authority(battle.result.defeatBefore))} → ${Math.floor(authority(battle.result.defeatAfter))}. Уважение ${battle.result.respect - battle.result.respectDelta} → ${battle.result.respect} (+${battle.result.respectDelta}). Можешь огрызнуться ещё ${replyCount(battle.result.strikesBalance)}.`}
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
      {failed ? <p className="banner" role="alert">Попытка не засчитана и не потрачена. Шкалы остались прежними, реплика на месте: отправь ещё раз.</p> : <Feedback error={battle.turn.error} />}
      {battle.unknown && <p className="banner" role="status">Результат пока неизвестен. Проверь ту же попытку: ещё одна попытка не потратится.</p>}
      <BattleComposer text={battle.text} setText={battle.setText} send={() => void battle.send()} buy={() => setShop(true)} busy={busy} unknown={battle.unknown} ready={!!dialog && balance !== undefined} balance={balance ?? 0} roleName={roleName} />
      {shop && (
        <Sheet title="Огрызнуться ещё" close={() => setShop(false)}>
          <ShopContent me={me} compact />
        </Sheet>
      )}
      {help && (
        <Sheet title="Как это работает" close={() => setHelp(false)} closeLabel="Понятно">
          <BattleHelp roleName={roleName} mother={mother} />
        </Sheet>
      )}
    </>
  );
}
