import { AppConfigService } from '../../src/config/app-config.service';
import { StrikesService } from '../../src/modules/strikes/strikes.service';
import { backend, uid, user } from '../helpers/backend';

describe('free battle exemption', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    jest.restoreAllMocks();
    await h.app.close();
  });

  async function reserve(userId: string): Promise<void> {
    const session = await h.db.connection.startSession();
    try {
      await session.withTransaction(async () => {
        await h.app.get(StrikesService).reserve(userId, uid(), session);
      });
    } finally {
      await session.endSession();
    }
  }

  it('listed username battles for free, case and @ ignored', async () => {
    jest.spyOn(AppConfigService.prototype, 'freeBattleUsernames', 'get').mockReturnValue(['maxdeuser']);
    const u = await user(h.db, { username: 'MaxDeUser' });
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBeGreaterThanOrEqual(100);
    await reserve(u._id);
  });

  it('owner battles for free', async () => {
    const u = await user(h.db);
    jest.spyOn(AppConfigService.prototype, 'ownerId', 'get').mockReturnValue(u.telegramId);
    await reserve(u._id);
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBeGreaterThanOrEqual(19);
  });

  it('ordinary user still has no strikes', async () => {
    jest.spyOn(AppConfigService.prototype, 'freeBattleUsernames', 'get').mockReturnValue(['maxdeuser']);
    const u = await user(h.db, { username: 'someone_else' });
    expect((await h.app.get(StrikesService).balance(u._id)).balance).toBe(0);
    await expect(reserve(u._id)).rejects.toMatchObject({
      status: 409,
      code: 'insufficient_strikes',
    });
  });
});
