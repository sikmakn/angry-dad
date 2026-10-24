import type { FeedMessage } from '../api/contract';

const categories: Partial<Record<FeedMessage['category'], string>> = {
  on_check_in: 'Проверка', on_reminder: 'Напоминание', on_check_in_missed: 'Без ответа',
  on_fail: 'Срок вышел', on_success: 'Сделано', on_excuse: 'Новый срок',
  on_absent: 'Давно не виделись', on_task_set: 'Задача поставлена', on_delete: 'Задача удалена',
};

export const ratingOptions = [
  { emoji: '😐', label: 'Слабо', feedback: 'Не проняло? Ладно, эту пластинку буду включать реже.' },
  { emoji: '😞', label: 'Неприятно', feedback: 'Задело, значит. Хорошо. Эту фразу услышишь почаще.' },
  { emoji: '😭', label: 'В самое больное', feedback: 'О, вот это я запомню. Ещё не раз услышишь.' },
] as const;

export function notificationLabel(message: FeedMessage) {
  return categories[message.category] ?? 'Запись в дневнике';
}

export function notificationText(message: FeedMessage) {
  if (message.taskTitle) {
    const title = message.taskTitle.replace(/[\r\n]+/g, ' ');
    for (const prefix of [`Про «${title}». `, `Про «${title}»\n\n`]) {
      if (message.text.startsWith(prefix)) {
        return message.text.slice(prefix.length);
      }
    }
  }
  return message.text;
}
