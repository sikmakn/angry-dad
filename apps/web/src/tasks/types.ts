import type { Schema, TaskKind } from '../api/contract';

export interface TaskScheduleDraft {
  kind: TaskKind;
  day: string;
  time: string;
  recurrence: Schema<'Recurrence'>;
  anchorTime: string;
}
