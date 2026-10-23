import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ApiError, request } from '../../api/client';
import type { Me, Schema, Task } from '../../api/contract';
import { useWrite } from '../../hooks/useApi';
import { calendarDay, zonedDeadline } from '../taskFormat';
import { suggestRecurrence } from '../recurrenceSuggestion';
import { recurrenceError } from '../recurrenceValidation';
import { clearTaskSubmission, readTaskSubmission, rememberTaskSubmission } from '../taskSubmissionRecovery';
import type { TaskScheduleDraft } from '../types';

export function useTaskForm(me: Me) {
  const [recovery] = useState(() => readTaskSubmission(me.id));
  const [title, storeTitle] = useState(recovery?.title ?? '');
  const [schedule, storeSchedule] = useState<TaskScheduleDraft>(recovery?.schedule ?? {
    kind: 'one_time',
    day: calendarDay(me.timeZone),
    time: '22:00',
    recurrence: { type: 'daily' },
    anchorTime: '',
  });
  const [manualSchedule, setManualSchedule] = useState(!!recovery);
  const [suggestedPhrase, setSuggestedPhrase] = useState<string>();
  const [saved, setSaved] = useState<Schema<'TaskActionResponse'>>();
  const [uncertain, setUncertain] = useState(!!recovery);
  const [reviewed, setReviewed] = useState(false);
  const [acknowledged, setAcknowledged] = useState(false);
  const [validation, setValidation] = useState('');
  const scheduleError = schedule.kind === 'recurring' ? recurrenceError(schedule.recurrence) : undefined;
  const mounted = useRef(true);
  const create = useWrite(me.id, 'createTask', (result) => {
    clearTaskSubmission(me.id);
    if (mounted.current) {
      setSaved(result);
    }
  });
  const review = useQuery({
    queryKey: [me.id, 'taskSubmissionReview'],
    queryFn: async ({ signal }) => {
      const tasks: Task[] = [];
      let cursor: string | undefined;
      do {
        const page = await request('listTasks', { query: { limit: 100, cursor }, signal });
        tasks.push(...page.items);
        cursor = page.nextCursor ?? undefined;
      } while (cursor);
      return tasks;
    },
    enabled: false,
    retry: false,
    staleTime: 0,
  });
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  function setTitle(value: string) {
    storeTitle(value);
    if (manualSchedule) {
      return;
    }
    const suggestion = suggestRecurrence(value);
    setSuggestedPhrase(suggestion?.phrase);
    if (suggestion) {
      storeSchedule(previous => ({ ...previous, kind: 'recurring', recurrence: suggestion.recurrence }));
    } else if (suggestedPhrase) {
      storeSchedule(previous => ({ ...previous, kind: 'one_time' }));
    }
  }

  function setSchedule(value: TaskScheduleDraft) {
    setManualSchedule(true);
    setSuggestedPhrase(undefined);
    storeSchedule(value);
  }

  function removeSuggestion() {
    setSchedule({ ...schedule, kind: 'one_time' });
  }

  async function refreshTasks() {
    setReviewed(false);
    setAcknowledged(false);
    const result = await review.refetch();
    if (mounted.current && result.isSuccess) {
      setReviewed(true);
    }
  }

  function allowNewSubmission() {
    if (!reviewed || !acknowledged) {
      return;
    }
    clearTaskSubmission(me.id);
    setUncertain(false);
    create.reset();
  }

  function reset() {
    storeTitle('');
    setSaved(undefined);
    setManualSchedule(false);
    setSuggestedPhrase(undefined);
    storeSchedule({ kind: 'one_time', day: calendarDay(me.timeZone), time: '22:00', recurrence: { type: 'daily' }, anchorTime: '' });
    create.reset();
  }

  async function submit() {
    if (create.isPending || !title.trim() || uncertain || saved) {
      return;
    }
    setValidation('');
    const { kind, day, time, recurrence, anchorTime } = schedule;
    const deadline = kind === 'one_time' ? zonedDeadline(day, time, me.timeZone) : undefined;
    if (deadline && Date.parse(deadline) - Date.now() < 900000) {
      setValidation('Срок — не раньше чем через 15 минут.');
      return;
    }
    if (deadline && Date.parse(deadline) - Date.now() > 365 * 86400000) {
      setValidation('Срок — не позже чем через 365 дней.');
      return;
    }
    if (scheduleError) {
      setValidation(scheduleError);
      return;
    }
    try {
      // Persist before sending: leaving the form or reloading cannot silently unlock a second POST.
      rememberTaskSubmission(me.id, { title, schedule });
      await create.run({ body: { title: title.trim(), kind, ...(deadline ? { deadline } : { recurrence, ...(anchorTime ? { anchorTime } : {}) }) } });
    } catch (error) {
      const knownRejection = error instanceof ApiError && (error.status < 500 || error.problem?.type.endsWith(':ai_unavailable'));
      if (knownRejection) {
        clearTaskSubmission(me.id);
      } else if (mounted.current) {
        setUncertain(true);
        setReviewed(false);
        setAcknowledged(false);
      }
    }
  }

  return { title, setTitle, schedule, setSchedule, suggestedPhrase, removeSuggestion, validation, scheduleError, submit, pending: create.isPending, error: create.error, saved, reset, uncertain, review, reviewed, acknowledged, setAcknowledged, refreshTasks, allowNewSubmission };
}
