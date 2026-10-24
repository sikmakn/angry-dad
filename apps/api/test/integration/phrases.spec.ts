import { backend, checkIn, taskPeriod, uid, user } from '../helpers/backend';
import { PhrasesService } from '../../src/modules/phrases/phrases.service';

describe('Phrase pagination and rating', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });
  it.each(['-shows', 'avg'])('sorted %s cursor retains seed underscores and tie order', async (sort) => {
    const category = `cursor-${uid()}`;
    const ids = [`seed_${uid()}_tail`, uid(), `seed_${uid()}_other`, uid()];
    await h.db.model('Phrase').insertMany(ids.map((_id, i) => ({
      _id,
      role: 'father',
      category,
      defeatLevel: 'any',
      combo: 'any',
      template: 'Синтетическая фраза',
      source: 'owner',
      status: 'enabled',
      shows: i < 2 ? 10 : 5,
      votes: 2,
      scoreSum: i < 2 ? 2 : 4,
      belowThreshold: false,
    })));
    const expected = [...ids.slice(0, 2).sort().reverse(), ...ids.slice(2).sort().reverse()];
    const found: string[] = [];
    let cursor: string | undefined;
    for (let page = 0; page < 5; page++) {
      const result = await h.app.get(PhrasesService).list({
        category,
        sort,
        limit: 1,
        cursor,
      });
      found.push(...result.items.map(row => row.id));
      if (!result.nextCursor) {
        break;
      }
      cursor = result.nextCursor;
    }
    expect(found).toEqual(expected);
    expect(new Set(found).size).toBe(4);
  });
  it('equal votes count once; changed votes replace the score across repeated shows; foreign feed is rejected', async () => {
    const u = await user(h.db), other = await user(h.db);
    const { period } = await taskPeriod(h.db, u);
    const phrases = h.app.get(PhrasesService);
    const phrase = await phrases.create({
      role: 'father',
      category: 'on_reminder',
      defeatLevel: 'any',
      combo: 'any',
      template: 'Синтетическое напоминание',
      source: 'owner',
    });
    const first = await checkIn(h.db, u, period._id, {
      category: 'on_reminder',
      phraseId: phrase.id,
    });
    const second = await checkIn(h.db, u, period._id, {
      category: 'on_reminder',
      phraseId: phrase.id,
    });
    await Promise.all([phrases.rate(u._id, first._id, 2), phrases.rate(u._id, second._id, 2)]);
    expect(await h.db.model('Phrase').findById(phrase.id).lean()).toMatchObject({
      votes: 1,
      scoreSum: 2,
    });
    expect(await h.db.model('PhraseVote').countDocuments({
      userId: u._id,
      phraseId: phrase.id,
    })).toBe(1);
    await phrases.rate(u._id, first._id, 1);
    expect(await h.db.model('Phrase').findById(phrase.id).lean()).toMatchObject({
      votes: 1,
      scoreSum: 1,
    });
    expect(await h.db.model('FeedMessage').findById(second._id).lean()).toMatchObject({ rating: 1 });
    await Promise.all([phrases.rate(u._id, first._id, 0), phrases.rate(u._id, second._id, 2)]);
    const vote = (await h.db.model('PhraseVote').findOne({
      userId: u._id,
      phraseId: phrase.id,
    }).lean())!;
    expect(await h.db.model('Phrase').findById(phrase.id).lean()).toMatchObject({
      votes: 1,
      scoreSum: vote.score,
    });
    expect(await h.db.model('PhraseVote').countDocuments({
      userId: u._id,
      phraseId: phrase.id,
    })).toBe(1);
    await expect(phrases.rate(other._id, first._id, 2)).rejects.toMatchObject({ status: 404 });
  });
});
