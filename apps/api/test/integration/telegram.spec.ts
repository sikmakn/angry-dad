import { backend, checkIn, taskPeriod, uid, user } from '../helpers/backend';
import { TelegramUpdateReceiver } from '../../src/modules/bot/services/telegram-update-receiver.service';
import { BotService } from '../../src/modules/bot/bot.service';
import { TelegramClient } from '../../src/modules/bot/services/telegram-client.service';
import { DeliveryService } from '../../src/modules/delivery/delivery.service';
import { PaymentsService } from '../../src/modules/payments/payments.service';
import { ratingFeedback } from '../../src/modules/phrases/rating-feedback';

describe('Telegram durable ingestion and callbacks', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });
  afterEach(() => jest.restoreAllMocks());
  const nextId = () => Number.parseInt(uid().replaceAll('-', '').slice(0, 10), 16);
  it.each([0, 1, 2] as const)('rating %i explains the changed phrase frequency without another chat message', async (score) => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u);
    const phrase = (await h.db.model('Phrase').findOne({
      category: 'on_check_in',
      status: 'enabled',
    }).lean())!;
    const feed = await checkIn(h.db, u, period._id, { phraseId: phrase._id });
    const callbackId = uid();
    const ack = jest.spyOn(h.app.get(TelegramClient), 'answerCallback');
    const send = jest.spyOn(h.app.get(TelegramClient), 'send');
    const edit = jest.spyOn(h.app.get(TelegramClient), 'editKeyboard');
    await h.app.get(BotService).receive('synthetic-webhook-secret', {
      update_id: nextId(),
      callback_query: {
        id: callbackId,
        from: {
          id: u.telegramId,
          is_bot: false,
          first_name: 'Synthetic',
        },
        chat_instance: 'test',
        data: `r:${feed._id}:${score}`,
        message: {
          message_id: 1,
          date: 1,
          chat: {
            id: u.telegramId,
            type: 'private',
          },
          text: 'Как дело?',
        },
      },
    });
    expect(ack).toHaveBeenCalledWith(callbackId, ratingFeedback[score]);
    expect(send).not.toHaveBeenCalled();
    const buttons = edit.mock.calls[0][2].inline_keyboard.flat();
    expect(buttons.filter(button => button.style === 'primary')).toHaveLength(1);
    expect(buttons.find(button => button.style === 'primary')).toMatchObject({ callback_data: `r:${feed._id}:${score}` });
    expect((await h.db.model('FeedMessage').findById(feed._id).lean())?.rating).toBe(score);
  });
  it('done receipt persists across instances, isolates botId and retains for 48h', async () => {
    const id = nextId(), call = jest.fn(async () => undefined);
    await new TelegramUpdateReceiver(h.db).receive(1, id, call);
    await new TelegramUpdateReceiver(h.db).receive(1, id, call);
    await new TelegramUpdateReceiver(h.db).receive(2, id, call);
    expect(call).toHaveBeenCalledTimes(2);
    const row = (await h.db.model('TelegramUpdateReceipt').findById(`1:${id}`).lean())!;
    expect(row.state).toBe('done');
    expect(row.leaseUntil).toBeUndefined();
    expect(row.expiresAt!.getTime() - row.completedAt!.getTime()).toBe(48 * 3600000);
  });
  it('concurrent duplicate cannot enter handler while leased; failure allows retry', async () => {
    const id = nextId(), receiver = new TelegramUpdateReceiver(h.db);
    let entered!: () => void, release!: () => void;
    const ready = new Promise<void>((r) => {
        entered = r;
      }), gate = new Promise<void>((r) => {
        release = r;
      });
    const first = receiver.receive(1, id, async () => {
      entered();
      await gate;
    });
    await ready;
    try {
      await expect(receiver.receive(1, id, async () => {
        throw new Error('must not enter');
      })).rejects.toMatchObject({ status: 503 });
    } finally {
      release();
      await first;
    }
    const failedId = nextId();
    await expect(receiver.receive(1, failedId, async () => {
      throw new Error('synthetic');
    })).rejects.toThrow('synthetic');
    const call = jest.fn(async () => undefined);
    await receiver.receive(1, failedId, call);
    expect(call).toHaveBeenCalledTimes(1);
  });
  it('expired lease is recovered, stale handler cannot overwrite new receipt', async () => {
    const id = nextId(), receiver = new TelegramUpdateReceiver(h.db);
    let entered!: () => void, release!: () => void;
    const ready = new Promise<void>((r) => {
        entered = r;
      }), gate = new Promise<void>((r) => {
        release = r;
      });
    const stale = receiver.receive(1, id, async () => {
      entered();
      await gate;
    });
    const staleResult = stale.catch(error => error as unknown);
    await ready;
    await h.db.model('TelegramUpdateReceipt').updateOne({ _id: `1:${id}` }, { $set: { leaseUntil: new Date(0) } });
    try {
      await receiver.receive(1, id, async () => undefined);
    } finally {
      release();
    }
    expect(await staleResult).toMatchObject({ status: 503 });
    expect((await h.db.model('TelegramUpdateReceipt').findById(`1:${id}`).lean())?.state).toBe('done');
  });
  it('webhook secret and update ID are checked before receipt', async () => {
    const bot = h.app.get(BotService);
    await expect(bot.receive('wrong', { update_id: nextId() })).rejects.toMatchObject({ status: 401 });
    for (const update_id of [-1, 1.5, '123', null]) {
      await expect(bot.receive('synthetic-webhook-secret', { update_id })).rejects.toMatchObject({ status: 400 });
    }
  });
  it.each(['partial', 'not_started'] as const)('callback %s sends the exact prepared reply once', async (answer) => {
    const u = await user(h.db), { period } = await taskPeriod(h.db, u), feed = await checkIn(h.db, u, period._id);
    const delivery = h.app.get(DeliveryService), original = delivery.answer.bind(delivery);
    let reply: string | null = null;
    const transition = jest.spyOn(delivery, 'answer').mockImplementation(async (...args) => {
      const result = await original(...args);
      reply = result.reply;
      return result;
    });
    const send = jest.spyOn(h.app.get(TelegramClient), 'send');
    const ack = jest.spyOn(h.app.get(TelegramClient), 'answerCallback');
    const body = {
      update_id: nextId(),
      callback_query: {
        id: uid(),
        from: {
          id: u.telegramId,
          is_bot: false,
          first_name: 'Synthetic',
        },
        chat_instance: 'test',
        data: `a:${feed._id}:${answer}`,
        message: {
          message_id: 1,
          date: 1,
          chat: {
            id: u.telegramId,
            type: 'private',
          },
          text: 'Как дело?',
        },
      },
    };
    await h.app.get(BotService).receive('synthetic-webhook-secret', body);
    await h.app.get(BotService).receive('synthetic-webhook-secret', body);
    expect(reply).toEqual(expect.any(String));
    expect(reply).not.toBe('');
    expect(send).toHaveBeenCalledTimes(1);
    expect(send.mock.calls[0].slice(0, 2)).toEqual([u.telegramId, reply]);
    expect(ack).toHaveBeenCalledTimes(1);
    expect(transition).toHaveBeenCalledTimes(1);
  });
  it('paysupport creates one ticket when confirmation send fails then update repeats', async () => {
    const u = await user(h.db), id = nextId();
    jest.spyOn(h.app.get(TelegramClient), 'send').mockRejectedValueOnce(new Error('send failed')).mockResolvedValue(1);
    const body = {
      update_id: id,
      message: {
        message_id: 1,
        date: 1,
        chat: {
          id: u.telegramId,
          type: 'private',
        },
        from: {
          id: u.telegramId,
          is_bot: false,
          first_name: 'Synthetic',
        },
        text: '/paysupport Synthetic issue',
      },
    };
    await expect(h.app.get(BotService).receive('synthetic-webhook-secret', body)).rejects.toMatchObject({ status: 503 });
    await h.app.get(BotService).receive('synthetic-webhook-secret', body);
    expect(await h.db.model('SupportTicket').countDocuments({ userId: u._id })).toBe(1);
    expect(await h.db.model('SupportTicket').findById(`telegram:123456:${id}`).lean()).toMatchObject({
      text: 'Synthetic issue',
      status: 'open',
    });
  });
  it('support pagination accepts colon-delimited source IDs without repeats', async () => {
    const u = await user(h.db), payments = h.app.get(PaymentsService), botId = nextId();
    for (let i = 0; i < 3; i++) {
      await payments.support(u, 'Synthetic issue', {
        botId,
        updateId: i,
      });
    }
    const found: string[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 100; page++) {
      const result = await payments.tickets({
        limit: 1,
        cursor,
      });
      found.push(...result.items.map(row => row.id));
      if (!result.nextCursor) {
        break;
      }
      cursor = result.nextCursor;
    }
    expect(found.filter(id => id.startsWith(`telegram:${botId}:`)).sort()).toEqual([0, 1, 2].map(i => `telegram:${botId}:${i}`));
    expect(new Set(found).size).toBe(found.length);
  });
});
