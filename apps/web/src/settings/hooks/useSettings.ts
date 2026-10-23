import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Me } from '../../api/contract';
import { useRead, useWrite } from '../../hooks/useApi';

const timeString = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
const minutes = (value: string) => Number(value.split(':')[0]) * 60 + Number(value.split(':')[1]);

export function useSettings(me: Me, deleted: () => void) {
  const [role, setRole] = useState(me.role!);
  const [gender, setGender] = useState(me.gender!);
  const [zone, setZone] = useState(me.timeZone);
  const [start, setStart] = useState(timeString(me.quietHours.start));
  const [end, setEnd] = useState(timeString(me.quietHours.end));
  const [participating, setParticipating] = useState(me.inLeaderboard);
  const [confirm, setConfirm] = useState(0);
  const [status, setStatus] = useState('');
  const [unknown, setUnknown] = useState(false);
  const saving = useRef(false);
  const save = useWrite(me.id, 'updateMe');
  const participation = useWrite(me.id, 'setLeaderboardParticipation');
  const remove = useWrite(me.id, 'deleteMe');
  const balance = useRead(me.id, 'getMyStrikes', {}, confirm > 0);
  const client = useQueryClient();
  const duration = (minutes(end) - minutes(start) + 1440) % 1440;
  async function submit() {
    if (saving.current || duration > 720) {
      return;
    }
    saving.current = true;
    setStatus('');
    try {
      await client.cancelQueries({ queryKey: [me.id] });
      const response = await save.run({ body: { role, gender, timeZone: zone, quietHours: { start: minutes(start), end: minutes(end) } } });
      if (!response) {
        return;
      }
      if (participating !== me.inLeaderboard) {
        await participation.run({ body: { inLeaderboard: participating } });
      }
      client.removeQueries({ queryKey: [me.id, 'getBattleDialog'] });
      client.removeQueries({ queryKey: [me.id, 'listBattleMessages'] });
      setStatus('Сохранено. Новые фразы будут с этими настройками.');
    } catch { /* Draft stays in the form. */ } finally {
      saving.current = false;
    }
  }
  async function deleteAccount() {
    if (remove.isPending) {
      return;
    }
    try {
      await client.cancelQueries();
      await remove.run({});
      deleted();
      client.clear();
    } catch {
      setUnknown(true);
    }
  }
  return {
    role, setRole, gender, setGender, zone, setZone, start, setStart, end, setEnd,
    participating, setParticipating, confirm, setConfirm, status, unknown,
    save, participation, remove, balance, duration, submit, deleteAccount,
  };
}
