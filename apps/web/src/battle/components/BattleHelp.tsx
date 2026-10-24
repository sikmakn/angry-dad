export function BattleHelp({ mother }: { roleName: string; mother: boolean }) {
  return (
    <div className="battle-guide">
      <p className="battle-guide-lead">
        <strong>НАКОНЕЦ</strong>
        {' '}
        <span className="battle-guide-answer">ответь</span>
        {` ${mother ? 'Маме' : 'Бате'} и загони ${mother ? 'её' : 'его'} в `}
        <span className="battle-guide-corner">угол</span>
        .
      </p>
      <div className="battle-guide-goal">
        <div className="battle-guide-authority">
          <span>Авторитет</span>
          <span className="battle-guide-score" aria-label="Снизь авторитет со 100 до нуля">
            <s>100</s>
            <span aria-hidden="true">→</span>
            <b>0</b>
          </span>
        </div>
        <p>{`Победишь — и ${mother ? 'она' : 'он'} поменяет поведение.`}</p>
      </div>
      <p className="battle-guide-patience">
        <b>+25</b>
        <span>
          к Авторитету за день
          <br />
          твоего терпения без ответа
        </span>
      </p>
    </div>
  );
}
