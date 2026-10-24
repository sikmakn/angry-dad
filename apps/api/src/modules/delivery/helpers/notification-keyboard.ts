import { InlineKeyboard } from 'grammy';

export function notificationKeyboard(miniAppUrl: string, feedId: string, rateable: boolean, rating?: number) {
  const url = new URL(miniAppUrl);
  url.searchParams.set('notification', feedId);
  url.hash = '';
  const keyboard = new InlineKeyboard().webApp('Открыть приложение', url.toString());
  if (rateable) {
    keyboard.row();
    ['😐', '😞', '😭'].forEach((emoji, score) => keyboard.add({
      text: emoji,
      callback_data: `r:${feedId}:${score}`,
      ...(rating === score ? { style: 'primary' as const } : {}),
    }));
  }
  return keyboard;
}
