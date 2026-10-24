interface BattleComposerProps {
  text: string;
  setText: (value: string) => void;
  send: () => void;
  buy: () => void;
  busy: boolean;
  unknown: boolean;
  ready: boolean;
  balance: number;
  roleName: string;
}

export function BattleComposer({ text, setText, send, buy, busy, unknown, ready, balance, roleName }: BattleComposerProps) {
  const emptyBalance = ready && !balance && !unknown;
  const hint = busy ? `Пока ${roleName} отвечает, новую реплику не отправить.` : emptyBalance ? undefined : 'Минимум 2 символа. Одна отправка — один раз огрызнуться.';
  return (
    <form
      className="composer"
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <div className="field">
        <label htmlFor="battle-text">Твоя реплика</label>
        <textarea id="battle-text" maxLength={300} value={text} disabled={busy || unknown} placeholder="Попробуй возразить по делу. Крик не считается." onChange={event => setText(event.target.value)} aria-describedby={hint ? 'battle-hint battle-count' : 'battle-count'} />
        {hint && <span className="hint" id="battle-hint">{hint}</span>}
        <span className="hint" id="battle-count">
          {`${text.length} / 300`}
        </span>
        {text.length === 300 && <span className="hint">Больше 300 символов не поместится.</span>}
      </div>
      {emptyBalance
        ? <button className="btn" type="button" disabled={busy} onClick={buy}>Огрызнуться ещё</button>
        : (
            <button className="btn" disabled={busy || !ready || (!unknown && (!balance || text.replace(/\s/g, '').length < 2))}>
              {busy ? `${roleName} отвечает…` : unknown ? 'Узнать результат той же попытки' : 'Огрызнуться'}
            </button>
          )}
    </form>
  );
}
