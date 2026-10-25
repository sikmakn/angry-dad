import { backend } from '../helpers/backend';
import { SeedService } from '../../src/database/seed.service';

describe('Task-set phrase seed upgrades', () => {
  let h: Awaited<ReturnType<typeof backend>>;
  beforeAll(async () => {
    h = await backend();
  });
  afterAll(async () => {
    await h?.app.close();
  });

  it('fresh task-set seeds are universal and cover both parents', async () => {
    const rows = await h.db.model('Phrase').find({ category: 'on_task_set' }).lean();
    for (const role of ['father', 'mother']) {
      expect(rows.filter(row => row.role === role)).toHaveLength(14);
    }
    for (const phrase of rows) {
      expect(phrase.template.trim().length).toBeGreaterThan(0);
      expect(phrase.template).not.toMatch(/\{(?:task|left|deadline)\}/);
      expect(phrase.template).not.toMatch(/в твои годы|до обеда|гитар|Тётя Люба|трёх работах|с первого класса|теперь у обещания есть срок/i);
    }
  });

  it('startup upgrades untouched historical texts, preserves owner edits and statistics, and is repeatable', async () => {
    // Historical text fixtures deliberately live in the test: changing migration
    // constants must not silently change the old database we are exercising.
    const fixtures = [
      {
        _id: 'seed-father-on_task_set-0-any-2',
        template: 'Теперь у обещания есть срок.',
      },
      {
        _id: 'seed-mother-on_task_set-0-any-2',
        template: 'Теперь у обещания есть срок.',
      },
      {
        _id: 'seed2-father-on_task_set-1',
        template: '{task}? Ладно. Я такое в твои годы до обеда делал, но давай, удиви.',
      },
      {
        _id: 'seed2-mother-on_task_set-0',
        template: 'Записала. Я ради тебя на трёх работах крутилась, уж одну задачу ты можешь.',
      },
    ];
    const editedIds = [
      'seed-father-on_task_set-0-any-0',
      'seed-mother-on_task_set-0-any-0',
      'seed2-father-on_task_set-0',
      'seed2-mother-on_task_set-1',
    ];
    const ids = [...fixtures.map(row => row._id), ...editedIds];
    const originals = await h.db.model('Phrase').find({ _id: { $in: ids } }).lean();
    expect(originals).toHaveLength(ids.length);
    const statistics = {
      shows: 37,
      votes: 9,
      scoreSum: 23,
      belowThreshold: true,
      status: 'disabled',
    };
    const seedFilter = { _id: /^seed2?-/ };
    const count = await h.db.model('Phrase').countDocuments(seedFilter);
    try {
      for (const fixture of fixtures) {
        await h.db.model('Phrase').updateOne({ _id: fixture._id }, {
          $set: {
            ...statistics,
            template: fixture.template,
          },
        });
      }
      for (const _id of editedIds) {
        await h.db.model('Phrase').updateOne({ _id }, {
          $set: {
            ...statistics,
            template: `Правка владельца ${_id}`,
          },
        });
      }
      await h.app.get(SeedService).onModuleInit();
      for (const fixture of fixtures) {
        const expected = originals.find(row => row._id === fixture._id)!;
        expect(await h.db.model('Phrase').findById(fixture._id).lean()).toEqual({
          ...expected,
          ...statistics,
        });
        expect(expected.template).not.toBe(fixture.template);
      }
      for (const _id of editedIds) {
        const expected = originals.find(row => row._id === _id)!;
        expect(await h.db.model('Phrase').findById(_id).lean()).toEqual({
          ...expected,
          ...statistics,
          template: `Правка владельца ${_id}`,
        });
      }
      const first = await h.db.model('Phrase').find({ _id: { $in: ids } }).sort({ _id: 1 }).lean();
      await h.app.get(SeedService).onModuleInit();
      expect(await h.db.model('Phrase').find({ _id: { $in: ids } }).sort({ _id: 1 }).lean()).toEqual(first);
      expect(await h.db.model('Phrase').countDocuments(seedFilter)).toBe(count);
    } finally {
      // Restore shared seed fixtures without deleting any collection or record.
      for (const original of originals) {
        const { _id, ...fields } = original;
        await h.db.model('Phrase').updateOne({ _id }, { $set: fields });
      }
    }
  });
});
