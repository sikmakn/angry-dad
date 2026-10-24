export interface TaskCreated {
  readonly taskId: string;
  readonly userId: string;
  readonly createdAt: string;
  readonly size: 'micro' | 'medium' | 'large';
}

export interface UserActivityObserved {
  readonly userId: string;
  readonly starts: boolean;
  readonly at: string;
}

export interface PhraseParaphrasesGenerated {
  readonly phraseId: string;
  readonly generatedIds: readonly string[];
  readonly count: number;
  readonly at: string;
}

export interface SupportTicketStatusChanged {
  readonly ticketId: string;
  readonly userId?: string;
  readonly telegramId: number;
  readonly from: 'open' | 'resolved';
  readonly to: 'open' | 'resolved';
  readonly at: string;
}

export interface ApplicationEvents {
  'phrase.paraphrases.generated': PhraseParaphrasesGenerated;
  'support.ticket.status.changed': SupportTicketStatusChanged;
  'task.created': TaskCreated;
  'user.activity.observed': UserActivityObserved;
}
