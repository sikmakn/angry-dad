import { useEffect, useRef, useState } from 'react';
import type { Me, Schema } from '../../api/contract';
import { ApiError } from '../../api/client';
import { usePages, useRead, useWrite } from '../../hooks/useApi';

export function useBattle(me: Me) {
  const role = me.role!;
  const dialog = useRead(me.id, 'getBattleDialog', { path: { role } }, true, true);
  const messages = usePages(me.id, 'listBattleMessages', { path: { role } });
  const { refetch: refreshMessages } = messages;
  const turnInProgress = dialog.data?.turnInProgress;
  const defeatAt = dialog.data?.defeatAt;
  useEffect(() => {
    // A turn may finish outside this mounted client. Refresh the existing paged
    // query after completion, including a turn completed between dialog polls.
    if (turnInProgress === false) {
      void refreshMessages({ cancelRefetch: false });
    }
  }, [turnInProgress, defeatAt, refreshMessages]);
  const balance = useRead(me.id, 'getMyStrikes', {}, true, true);
  const turn = useWrite(me.id, 'createBattleMessage');
  const [text, setText] = useState('');
  const [result, setResult] = useState<Schema<'TurnResponse'>>();
  const [unknown, setUnknown] = useState(false);
  const attempt = useRef<{ key: string; text: string } | undefined>(undefined);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  async function send() {
    if (turn.isPending || dialog.data?.turnInProgress || (!attempt.current && (text.replace(/\s/g, '').length < 2 || text.length > 300 || !balance.data?.balance))) {
      return;
    }
    if (!attempt.current) {
      attempt.current = { key: crypto.randomUUID(), text: text.trim() };
    }
    try {
      const response = await turn.run({ path: { role }, body: { text: attempt.current.text }, key: attempt.current.key });
      if (response && mounted.current) {
        setResult(response);
        setText('');
        setUnknown(false);
        attempt.current = undefined;
        void messages.refetch();
      }
    } catch (error) {
      if (!mounted.current) {
        return;
      }
      const definitive = error instanceof ApiError && (error.problem?.type === 'urn:angry-dad:problem:turn_failed' || (error.status >= 400 && error.status < 500 && error.problem?.type !== 'urn:angry-dad:problem:turn_in_progress'));
      if (definitive) {
        attempt.current = undefined;
        setUnknown(false);
      } else {
        setUnknown(true);
      }
    }
  }
  return { dialog, messages, balance, turn, text, setText, result, unknown, send };
}
