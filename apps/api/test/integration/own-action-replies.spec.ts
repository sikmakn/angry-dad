import { backend, taskPeriod, user } from '../helpers/backend';
import { FeedStatusService } from '../../src/modules/delivery/services/feed-status.service';
import { TasksService } from '../../src/modules/tasks/tasks.service';

describe('Replies to the user\'s own actions', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });

  it('surrender leaves no unread notification', async () => {
    const owner = await user(h.db), { period } = await taskPeriod(h.db, owner, { deadline: new Date(Date.now() + 3600000) });
    await h.app.get(TasksService).action(owner, period._id, 'surrender');
    const row = await h.db.model('FeedMessage').findOne({
      userId: owner._id,
      category: 'on_fail',
    }).lean();
    expect(row?.readAt).toBeInstanceOf(Date);
    expect(await h.app.get(FeedStatusService).counts(owner._id)).toMatchObject({ unreadCount: 0 });
  });

  it('a deadline failure stays unread', async () => {
    const owner = await user(h.db), { period } = await taskPeriod(h.db, owner, { deadline: new Date(Date.now() - 1000) });
    await h.app.get(TasksService).action(owner, period._id, 'deadline');
    const row = await h.db.model('FeedMessage').findOne({
      userId: owner._id,
      category: 'on_fail',
    }).lean();
    expect(row?.readAt).toBeUndefined();
    expect(await h.app.get(FeedStatusService).counts(owner._id)).toMatchObject({ unreadCount: 1 });
  });
});
