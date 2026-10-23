import type { Schema } from '../api/contract';

export interface TaskScheduleDraft {
  kind: Schema<'TaskKind'>;
  day: string;
  time: string;
  recurrence: Schema<'Recurrence'>;
  anchorTime: string;
}
