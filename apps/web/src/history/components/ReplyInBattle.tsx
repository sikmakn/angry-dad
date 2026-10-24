import { useRef } from 'react';
import type { Me } from '../../api/contract';
import { useWrite } from '../../hooks/useApi';
import { Feedback } from '../../components/Feedback';

export function ReplyInBattle({ me, feedId, go }: { me: Me; feedId: string; go?: (route: string) => void }) {
  const quote = useWrite(me.id, 'createBattleQuote');
  const key = useRef<string | undefined>(undefined);
  async function reply() {
    key.current ??= crypto.randomUUID();
    try {
      const response = await quote.run({ path: { role: me.role! }, body: { feedMessageId: feedId }, key: key.current });
      if (response) {
        if (go) {
          go('battle');
        } else {
          window.location.hash = 'battle';
        }
      }
    } catch { /* Keep the card open and show the error for retry. */ }
  }
  return (
    <div className="notification-reply">
      <button className="btn battle-reply" disabled={quote.isPending} onClick={() => void reply()}><span className="battle-reply-label">Ответить! 😠</span></button>
      <p className="battle-reply-note">— в перепалке</p>
      <Feedback error={quote.error} />
    </div>
  );
}
