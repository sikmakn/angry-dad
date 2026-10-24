import { useState } from 'react';
import type { Me, Schema, PhraseStatus } from '../../api/contract';
import { usePages, useRead, useWrite } from '../../hooks/useApi';

export function useOwnerPhrases(me: Me) {
  const [filter, setFilter] = useState<PhraseStatus | 'below'>('pending_review');
  const query = filter === 'below' ? { belowThreshold: true } : { status: filter };
  const list = usePages(me.id, 'listOwnerPhrases', { query });
  const coverage = useRead(me.id, 'getOwnerPhraseCoverage');
  const add = useWrite(me.id, 'createOwnerPhrase');
  const toggle = useWrite(me.id, 'updateOwnerPhrase');
  const paraphrase = useWrite(me.id, 'createOwnerParaphrases');
  const [draft, setDraft] = useState<Schema<'CreatePhraseRequest'>>({ role: 'father', category: 'on_fail', defeatLevel: 'any', combo: 'any', template: '', source: 'owner' });
  const [confirmation, setConfirmation] = useState<{ id: string; status: 'enabled' | 'disabled'; reject: boolean }>();
  const [notice, setNotice] = useState('');

  async function requestParaphrases(id: string) {
    setNotice('Фраза добавлена. Готовим перефразы, пользователи их пока не видят.');
    try {
      const response = await paraphrase.run({ path: { phraseId: id }, body: { count: 3 } });
      if (response) {
        setFilter('pending_review');
        setNotice('Перефразы готовы. Одобрите варианты, чтобы включить их в пул.');
      }
    } catch { /* The original phrase stays saved; retry only paraphrases. */ }
  }

  async function submit(withParaphrases = false) {
    try {
      const response = await add.run({ body: draft });
      if (response) {
        setDraft({ ...draft, template: '' });
        setNotice('Фраза добавлена');
        if (withParaphrases) {
          await requestParaphrases(response.id);
        }
      }
    } catch { /* Preserve the draft and expose the mutation error. */ }
  }

  async function confirm() {
    if (!confirmation) {
      return;
    }
    try {
      const response = await toggle.run({ path: { phraseId: confirmation.id }, body: { status: confirmation.status } });
      if (response) {
        setNotice(confirmation.reject ? 'Перефраз отклонён. Вариант удалён из очереди, исходная фраза на месте.' : 'Изменение сохранено.');
        setConfirmation(undefined);
      }
    } catch { /* Keep the dialog open with the server explanation. */ }
  }

  return { filter, setFilter, list, coverage, add, toggle, paraphrase, draft, setDraft, confirmation, setConfirmation, notice, submit, confirm, requestParaphrases };
}
