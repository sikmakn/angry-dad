import type { User } from '../../../database/schemas/user.schema';
import type { GameSettings } from '../../../database/schemas/game-settings.schema';
import { localDate } from '../../../common/utils/time';
export function renderPhrase(template: string, user: User, settings: GameSettings, task?: string, deadline?: Date, anonymous = false): string {
  const fallbackName = user.gender === 'female' ? 'дочка' : 'сынок';
  const minutes = deadline ? Math.max(0, Math.ceil((deadline.getTime() - Date.now()) / 60000)) : 0;
  const time = deadline
    ? new Intl.DateTimeFormat('ru', {
        timeZone: user.timeZone,
        hour: '2-digit',
        minute: '2-digit',
        ...(localDate(deadline, user.timeZone) === localDate(new Date(), user.timeZone)
          ? {}
          : {
              day: '2-digit',
              month: '2-digit',
            }),
      }).format(deadline)
    : '';
  const values: Record<string, string> = {
    task: anonymous ? 'задачу' : task ?? 'задачу',
    name: anonymous ? fallbackName : user.firstName?.trim() || fallbackName,
    time,
    left: `${minutes >= 60 ? `${Math.floor(minutes / 60)} ч ` : ''}${minutes % 60} мин`,
  };
  return template.replace(/\[\[(user|parent):([^|\]]*)\|([^\]]*)\]\]/g, (_match, target: string, male: string, female: string) => (target === 'parent' ? user.role === 'mother' : user.gender === 'female') ? female : male)
    .replace(/(говорил|сказал|предупреждал)\(а\)/g, (_match, word: string) => word + (user.role === 'mother' ? 'а' : ''))
    .replace(/сын\(дочь\)/g, user.gender === 'female' ? 'дочь' : 'сын')
    .replace(/\(а\)/g, user.gender === 'female' ? 'а' : '')
    .replace(/\{other(?::(male|female))?(?::([0-5]))?\}/g, (_match, gender?: string, index?: string) => {
      const names = settings.otherNames.filter(n => !gender || n.gender === gender);
      const name = names[Math.floor(Math.random() * names.length)];
      return name?.cases[Number(index ?? 0)] ?? name?.name ?? 'Васи';
    }).replace(/\{(task|name|time|left)\}/g, (_match, key: string) => values[key]);
}
