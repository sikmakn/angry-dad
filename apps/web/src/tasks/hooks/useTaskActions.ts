import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Me, Schema, Task, CheckInAnswer } from '../../api/contract';
import { useWrite } from '../../hooks/useApi';

export function useTaskActions(me: Me) {
  const client = useQueryClient();
  const cacheTask = (response: { task: Task }) => {
    // The successful write is authoritative even if the following GET fails.
    client.setQueryData([me.id, 'getTask', { taskId: response.task.id }, undefined], response.task);
  };
  const complete = useWrite(me.id, 'completePeriod', cacheTask);
  const extend = useWrite(me.id, 'extendPeriod', cacheTask);
  const surrender = useWrite(me.id, 'surrenderPeriod', cacheTask);
  const retry = useWrite(me.id, 'retryPeriod', cacheTask);
  const answer = useWrite(me.id, 'answerCheckIn', cacheTask);
  const update = useWrite(me.id, 'updateTask', cacheTask);
  const remove = useWrite(me.id, 'deleteTask');
  const [result, setResult] = useState<Schema<'PeriodActionResponse'>>();
  const [notice, setNotice] = useState<string | null>();
  const [error, setError] = useState<unknown>();
  async function periodAction(action: 'complete' | 'extend' | 'surrender' | 'retry', periodId: string) {
    setError(undefined);
    try {
      const response = await ({ complete, extend, surrender, retry })[action].run({ path: { periodId } });
      if (response) {
        if (action === 'complete' || action === 'surrender') {
          setResult(response);
        } else {
          setResult(undefined);
          setNotice(response.reply);
        }
      }
      return !!response;
    } catch (failure) {
      setError(failure);
      return false;
    }
  }
  async function checkAnswer(feedMessageId: string, value: CheckInAnswer) {
    setError(undefined);
    try {
      const response = await answer.run({ path: { feedMessageId }, body: { answer: value } });
      if (response) {
        if (value === 'done') {
          setResult(response);
        }
        setNotice(response.reply);
      }
    } catch (failure) {
      setError(failure);
    }
  }
  async function stopTask(taskId: string) {
    const response = await update.run({ path: { taskId }, body: { status: 'stopped' } });
    if (response) {
      setResult(undefined);
      setNotice(response.reply);
    }
  }
  return { periodAction, checkAnswer, stopTask, result, notice, error, update, remove, pending: [complete, extend, surrender, retry, answer, update, remove].some(item => item.isPending) };
}
