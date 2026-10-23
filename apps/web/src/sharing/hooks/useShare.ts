import { useEffect, useRef, useState } from 'react';
import type { Me, Schema } from '../../api/contract';
import { useWrite } from '../../hooks/useApi';
import { config, telegram } from '../../platform/telegram';

export function useShare(me: Me, body: Schema<'CreateShareRequest'>) {
  const create = useWrite(me.id, 'createShare');
  const [status, setStatus] = useState('');
  const [selecting, setSelecting] = useState(false);
  const active = useRef(true);
  const locked = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const app = telegram();
  const available = !!app?.initData && !!app.shareMessage && app.isVersionAtLeast('8.0') && !config.mocks;
  async function share() {
    if (!available || locked.current) {
      return;
    }
    locked.current = true;
    setStatus('');
    try {
      const response = await create.run({ body });
      if (response && active.current) {
        setSelecting(true);
        app.shareMessage?.(response.preparedMessageId, (success) => {
          locked.current = false;
          if (active.current) {
            setSelecting(false);
            setStatus(success ? 'Карточка ушла в чат. Теперь все узнают, как тебя воспитывали.' : 'Отправка отменена. Ничего не отправлено.');
          }
        });
      } else {
        locked.current = false;
      }
    } catch {
      locked.current = false;
      if (active.current) {
        setSelecting(false);
      }
    }
  }
  return { create, share, available, selecting, status };
}
