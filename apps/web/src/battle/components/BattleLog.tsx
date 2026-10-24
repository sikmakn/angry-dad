import type { Schema, Role } from '../../api/contract';
import { Quote } from '../../components/Quote';

export function BattleLog({ messages, role, busy }: { messages: Schema<'BattleMessageResponse'>[]; role: Role; busy: boolean }) {
  return (
    <div className="stack" role="log" aria-label={role === 'mother' ? 'Диалог с мамой' : 'Диалог с Батей'}>
      {messages.map(message => (
        <div key={message.seq}>
          {message.taskTitle && (
            <p className="small muted">
              {`К задаче: ${message.taskTitle}`}
            </p>
          )}
          {message.author === 'player'
            ? (
                <div className="bubble-me">
                  <b>Ты</b>
                  <p>{message.text}</p>
                </div>
              )
            : <Quote text={message.text} role={role} />}
        </div>
      ))}
      {busy && <p className="small muted" role="status">{role === 'mother' ? 'Мама печатает…' : 'Батя печатает…'}</p>}
    </div>
  );
}
