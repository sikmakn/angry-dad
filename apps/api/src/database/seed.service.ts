import type { AnyBulkWriteOperation } from 'mongoose';
import type { Phrase } from './schemas/phrase.schema';
import { Injectable } from '@nestjs/common';
import type { OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { extensionPhrases } from './extension-phrases';
const notStartedReplies = [
  'Даже не начал(а)? Зато кнопку нажать силы нашлись. Начинай.',
  'Ноль сделано, зато планы были грандиозные. Удиви меня: начни.',
  'Всё ещё собираешься? Сборы уже длиннее самой работы. За дело.',
  'Задача ждёт, время идёт, ты отдыхаешь. Прекрасное распределение обязанностей.',
  'Не начал(а). Какая неожиданность. Может, хоть сейчас перестанешь репетировать начало?',
];
const phrases: Record<string, string[]> = {
  on_greeting: ['Ну что, опять без дела?', 'Ты ко мне за советом или оправданиями?', 'Заходи. Покажешь, чем занят.', 'Давно тебя не видно. Сделал хоть что-нибудь?', 'Сначала дело, потом разговоры.'],
  on_task_set: ['Записал. Посмотрим.', 'Вот и проверим, чего стоят твои слова.', 'Теперь у обещания есть срок.', 'Дело назвал — назад не отговоришься.', 'Жду результат, а не красивый план.', 'Хорошо. За язык тебя никто не тянул.', 'Слова услышал. Дальше показывай дело.', 'Посмотрим, доберёшься ли ты до конца.'],
  on_delete: ['Опять бросаешь всё, что начинаешь.', 'Удалить проще, чем сделать, да?', 'Вот и весь твой настрой.', 'Как удобно: нет задачи — нет обещания.', 'Сильный ход. Прямо по кнопке удаления.'],
  on_vague: ['Мечты сюда не пиши. Что конкретно сделаешь?', 'Это туман, а не задача.', 'Как я пойму, что ты закончил(а)?', 'Назови результат, а не настроение.', 'Красиво звучит. А делать-то что?'],
  on_reminder: ['До срока {left}. Где результат?', 'Про {task} помнишь? Осталось {left}.', 'Время идёт. Оправдания уже готовишь?', 'Обещание всё ещё висит. Покажи дело.', 'Часы работают даже тогда, когда ты отдыхаешь.'],
  on_check_in: ['Покажи, что сделано. Две минуты.', 'Ну что с задачей? Только по делу.', 'Ты начал(а) или пока собираешься?', 'Мне нужен результат, а не отчёт о намерениях.', 'Как там {task}? Есть что показать?'],
  on_check_in_reply: ['Частично — это хоть что-то. Дальше.', 'Услышал. Теперь продолжай.', 'Посмотрим, превратится ли это в результат.', 'Слова закончились. За работу.', 'Хорошо устроился(ась). А задача кто сделает?'],
  on_check_in_missed: ['Даже ответить — уже работа не по силам?', 'Молчание результатом не считается.', 'Пятнадцать минут жду. Ты где?', 'Прятаться проще, чем делать.', 'Ответа нет. Дела, видимо, тоже.'],
  on_fail: ['Срок прошёл. Ты снова не сделал(а).', 'Обещал(а) — и опять мимо.', 'Задача сама себя не сделала. Удивительно, да?', 'У других дело движется. А у тебя срок закончился.', 'Вот и весь результат твоих обещаний.', 'Часы дошли. Ты — нет.', 'Срок один, оправданий целая коллекция.', 'Снова красивое начало и пустой конец.', 'На словах ты уже давно закончил(а).', 'Планы были громкие. Результата не слышно.', 'Поставить задачу получилось лучше, чем выполнить.', 'Я тебе [[parent:говорил|говорила]]: от слов результата не будет.'],
  on_excuse: ['Час. Больше сегодня не проси.', 'Ладно, ещё час. Посмотрим, что изменится.', 'Даю час. Не для новых оправданий.', 'Срок сдвинулся, задача осталась.', 'Ещё час на то, что давно пора сделать.', 'Время получил(а). Теперь используй.', 'Последний час сегодня. Работай.'],
  on_excuse_denied: ['На сегодня хватит переносов.', 'Ещё час не положен. Делай с тем, что есть.', 'Время не резиновое, как твои оправдания.'],
  on_retry: ['Час пошёл. Попробуй хоть теперь.', 'Последняя попытка. Жду дело.', 'Вернул(а) себе задачу — верни и результат.'],
  on_success: ['Ну наконец-то.', 'Можешь, когда перестаёшь болтать.', 'Одно дело довёл(а) до конца.', 'Зачтено. Не зазнавайся.', 'Вот так бы с самого начала.', 'Получилось. Значит, оправдания были лишними.', 'Хорошо. За тебя делать не пришлось.', 'Слово с делом совпало. Бывает же.'],
  on_absent: ['Ты где? Задача всё ещё ждёт.', 'Забыл(а), что обещал(а)?', 'Отсутствие в чате задачу не отменяет.', 'Давно не видно. Результат хоть есть?'],
  on_battle_start: ['Ну, говори. Чем удивишь?', 'Решил(а) поспорить? Слушаю.', 'У тебя аргумент или очередная отговорка?', 'Давай. Только не начинай с оправданий.', 'Наконец-то есть что сказать?'],
  on_break: ['Ладно. Тут ты прав(а).', 'Прижал(а). На этот раз признаю.', 'Хорошо. Этот спор за тобой.', 'Всё, услышал(а). Есть у тебя характер.', 'Ладно, хватит. Доказал(а).'],
  on_recovery: ['Я отдохнул(а). Не думай, что всё забылось.', 'Прошлый спор закончился. А задача осталась.', 'Ну что, опять решил(а), что победил(а) навсегда?'],
};
@Injectable()
export class SeedService implements OnModuleInit {
  constructor(private readonly db: DatabaseService) { }
  async onModuleInit(): Promise<void> {
    // Deterministic IDs only insert initial content; owner edits survive every restart.
    for (const [index, item] of [{
      strikes: 1,
      priceStars: 15,
    }, {
      strikes: 3,
      priceStars: 39,
    }, {
      strikes: 5,
      priceStars: 60,
    }].entries()) {
      await this.db.model('Package').updateOne({ _id: `package-${item.strikes}` }, {
        $setOnInsert: {
          ...item,
          active: true,
          order: index,
        },
      }, { upsert: true });
    }
    for (const role of ['father', 'mother'] as const) {
      await this.db.model('RoleCard').updateOne({ _id: `role-${role}` }, {
        $setOnInsert: {
          role,
          character: role === 'father' ? 'Вредный отец: строгий, ворчливый, упрямый в споре, не уступает без аргумента.' : 'Вредная мать: требовательная, язвительная, уверена в своей правоте, не уступает без аргумента.',
          weakSpots: [{
            key: 'unfinished',
            description: 'Сам не доводит начатое до конца.',
          }, {
            key: 'double_standard',
            description: 'Требует от других того, чего не делает сам.',
          }, {
            key: 'empty_authority',
            description: 'Подменяет аргумент возрастом и авторитетом.',
          }, {
            key: 'control',
            description: 'Хочет всё контролировать, боится самостоятельности ребёнка.',
          }, {
            key: 'comparison',
            description: 'Сравнивает с другими, уходя от конкретного разговора.',
          }],
          version: 1,
        },
      }, { upsert: true });
    }
    const operations: AnyBulkWriteOperation<Phrase>[] = [];
    for (const [category, templates] of Object.entries(phrases)) {
      const roles = category === 'on_greeting' ? ['any'] as const : ['father', 'mother'] as const;
      const levels = ['on_reminder', 'on_check_in', 'on_absent', 'on_excuse'].includes(category) ? [1, 2, 3] : category === 'on_check_in_reply' ? [1, 2] : [undefined];
      for (const role of roles) {
        for (const level of levels) {
          const defeatLevels: Phrase['defeatLevel'][] = ['on_reminder', 'on_check_in', 'on_fail'].includes(category) ? ['any', '2', '3', '4'] : ['any'];
          for (const defeatLevel of defeatLevels) {
            const source = category === 'on_check_in_reply' && level === 2 ? notStartedReplies : category === 'on_excuse' ? extensionPhrases[level!] : defeatLevel === 'any' ? templates : ['Ладно, после того спора спрошу спокойнее: как {task}?', 'Я помню твой характер. А дело-то движется?'];
            for (const [index, template] of source.entries()) {
              const _id = `seed-${role}-${category}-${level ?? 0}-${defeatLevel}-${index}`;
              if (category === 'on_check_in_reply' && level === 2) {
                // Upgrade untouched seed text while preserving owner edits and ratings.
                operations.push({
                  updateOne: {
                    filter: {
                      _id,
                      template: templates[index],
                    },
                    update: { $set: { template } },
                  },
                });
              }
              operations.push({
                updateOne: {
                  filter: { _id },
                  update: {
                    $setOnInsert: {
                      role,
                      category,
                      level,
                      defeatLevel,
                      combo: 'any',
                      template,
                      source: 'owner',
                      status: 'enabled',
                      shows: 0,
                      votes: 0,
                      scoreSum: 0,
                      belowThreshold: false,
                    },
                  },
                  upsert: true,
                },
              });
            }
          }
        }
      }
    }
    await this.db.model('Phrase').bulkWrite(operations);
  }
}
