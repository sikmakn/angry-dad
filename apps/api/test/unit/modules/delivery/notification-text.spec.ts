import { notificationText } from '../../../../src/modules/delivery/helpers/notification-text';

describe('Telegram notification formatting', () => {
  it.each(['. ', '\n\n'])('formats an existing subject once and safely escapes task and phrase text (%j)', (separator) => {
    const title = '<отчёт> & план';
    expect(notificationText({
      category: 'on_check_in',
      taskTitle: title,
      text: `Про «${title}»${separator}Ты начал <script> & дело?`,
    }, 'father')).toBe('<b>🟡 Проверка</b> <i>· Батя</i>\n\nПро <b>«&lt;отчёт&gt; &amp; план»</b>\n\n<blockquote>Ты начал &lt;script&gt; &amp; дело?</blockquote>');
  });

  it('formats the selected parent without inventing a task for a message without one', () => {
    expect(notificationText({
      category: 'on_reminder',
      text: 'Пора заканчивать.',
    }, 'mother')).toBe('<b>🟠 Напоминание</b> <i>· Мама</i>\n\n<blockquote>Пора заканчивать.</blockquote>');
  });
});
