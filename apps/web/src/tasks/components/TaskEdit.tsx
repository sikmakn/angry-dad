import { useState } from 'react';
import type { Me, Task } from '../../api/contract';
import { Sheet } from '../../components/Sheet';
import { Feedback } from '../../components/Feedback';
import { useWrite } from '../../hooks/useApi';

export function TaskEdit({ task, me, close }: { task: Task; me: Me; close: () => void }) {
  const [title, setTitle] = useState(task.title);
  const save = useWrite(me.id, 'updateTask');
  return (
    <Sheet title="Название задачи" close={close}>
      <form onSubmit={(event) => {
        event.preventDefault();
        void save.run({ path: { taskId: task.id }, body: { title: title.trim() } }).then((response) => {
          if (response) {
            close();
          }
        }).catch(() => {});
      }}
      >
        <div className="field">
          <label htmlFor="edit-title">Что нужно сделать</label>
          <textarea id="edit-title" value={title} required maxLength={120} onChange={event => setTitle(event.target.value)} />
          <span className="hint">{`${title.length}/120. Меняется только название. Периоды и расписание сохраняются.`}</span>
        </div>
        <Feedback error={save.error} />
        <button className="btn" disabled={save.isPending || !title.trim()}>Сохранить</button>
      </form>
    </Sheet>
  );
}
