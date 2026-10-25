import { backend, uid } from '../helpers/backend';
import { UsersService } from '../../src/modules/users/users.service';
import { TelegramClient } from '../../src/modules/bot/services/telegram-client.service';

describe('Owner notification about a new user', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });
  afterEach(() => jest.restoreAllMocks());
  const nextId = () => Number.parseInt(uid().replaceAll('-', '').slice(0, 10), 16);
  const flush = () => new Promise<void>(resolve => setTimeout(resolve, 100));
  it('notifies the owner once on first sign-in with name, username, id and total', async () => {
    const send = jest.spyOn(h.app.get(TelegramClient), 'send');
    const users = h.app.get(UsersService), id = nextId();
    const identity = {
      id,
      first_name: 'Вася',
      username: 'vasya',
    };
    await users.authenticate(identity);
    await users.authenticate(identity);
    await flush();
    expect(send).toHaveBeenCalledTimes(1);
    const [chatId, text] = send.mock.calls[0];
    expect(chatId).toBe(999999999);
    expect(text).toMatch(new RegExp(`^Новый пользователь в боте\\nИмя: Вася\\nUsername: @vasya\\nTelegram ID: ${id}\\nВсего пользователей: \\d+$`));
  });
  it('omits username when absent and does not notify about the owner', async () => {
    const send = jest.spyOn(h.app.get(TelegramClient), 'send');
    const users = h.app.get(UsersService);
    await users.authenticate({
      id: nextId(),
      first_name: 'Без ника',
    });
    await users.authenticate({
      id: 999999999,
      first_name: 'Owner',
    });
    await flush();
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0][1]).not.toContain('Username');
  });
  it('does not fail sign-in when sending fails', async () => {
    jest.spyOn(h.app.get(TelegramClient), 'send').mockRejectedValue(new Error('telegram down'));
    const user = await h.app.get(UsersService).authenticate({
      id: nextId(),
      first_name: 'Петя',
    });
    await flush();
    expect(user.firstName).toBe('Петя');
  });
});
