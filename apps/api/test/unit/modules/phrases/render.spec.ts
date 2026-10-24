import { renderPhrase } from '../../../../src/modules/phrases/helpers/render';
import type { User } from '../../../../src/database/schemas/user.schema';
import type { GameSettings } from '../../../../src/database/schemas/game-settings.schema';

describe('Anonymous share phrase rendering', () => {
  const settings = { otherNames: [] } as unknown as GameSettings;
  it.each([
    ['male', 'father', 'сынок сделал задачу, говорил'],
    ['female', 'mother', 'дочка сделала задачу, говорила'],
  ] as const)('removes name/task while preserving %s/%s grammar', (gender, role, expected) => {
    const u = {
      firstName: 'PRIVATE NAME',
      gender,
      role,
      timeZone: 'UTC',
    } as User;
    const template = '{name} [[user:сделал|сделала]] {task}, [[parent:говорил|говорила]]';
    expect(renderPhrase(template, u, settings, 'PRIVATE TASK', undefined, true)).toBe(expected);
    expect(renderPhrase(template, u, settings, 'PRIVATE TASK')).toContain('PRIVATE NAME');
  });
});
