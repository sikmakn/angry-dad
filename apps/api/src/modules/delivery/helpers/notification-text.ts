import type { FeedMessage } from '../../../database/schemas/feed-message.schema';

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function notificationText(feed: Pick<FeedMessage, 'text' | 'taskTitle' | 'category'>, role?: string): string {
  const labels: Partial<Record<FeedMessage['category'], string>> = {
    on_check_in: '🟡 Проверка',
    on_reminder: '🟠 Напоминание',
    on_fail: '🔴 Срок вышел',
    on_absent: '🔵 Давно не виделись',
    on_check_in_missed: '🔴 Проверка без ответа',
  };
  const author = role === 'mother' ? 'Мама' : 'Батя';
  const heading = `<b>${labels[feed.category] ?? 'Сообщение тебе'}</b> <i>· ${author}</i>`;
  const title = feed.taskTitle?.replace(/[\r\n]+/g, ' ');
  let body = feed.text;
  if (title) {
    for (const prefix of [`Про «${title}». `, `Про «${title}»\n\n`]) {
      if (body.startsWith(prefix)) {
        body = body.slice(prefix.length);
        break;
      }
    }
  }
  return [heading, ...(title ? [`Про <b>«${escapeHtml(title)}»</b>`] : []), `<blockquote>${escapeHtml(body)}</blockquote>`].join('\n\n');
}
