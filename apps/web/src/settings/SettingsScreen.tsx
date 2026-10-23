import type { Me } from '../api/contract';
import { Feedback } from '../components/Feedback';
import { Sheet } from '../components/Sheet';
import { useSettings } from './hooks/useSettings';
import { QuietHours } from './components/QuietHours';

const zones = ['Europe/Kaliningrad', 'Europe/Minsk', 'Europe/Moscow', 'Europe/Samara', 'Asia/Yekaterinburg', 'Asia/Omsk', 'Asia/Novosibirsk', 'Asia/Irkutsk', 'Asia/Yakutsk', 'Asia/Vladivostok'];

export function SettingsScreen({ me, deleted }: { me: Me; deleted: () => void }) {
  const settings = useSettings(me, deleted);
  const { role, setRole, gender, setGender, zone, setZone, participating, setParticipating, confirm, setConfirm, status, unknown, save, participation, remove, balance, duration, submit, deleteAccount } = settings;
  return (
    <>
      <a className="back" href="#more">← Ещё</a>
      <div className="eyebrow">Дневник · ты</div>
      <h1 tabIndex={-1}>Настройки</h1>
      <form onSubmit={(event) => {
        event.preventDefault();
        void submit();
      }}
      >
        <fieldset>
          <legend>Родитель</legend>
          <div className="seg">
            {([['father', 'Отец'], ['mother', 'Мать']] as const).map(([value, label]) => (
              <label className="opt" key={value}>
                <input type="radio" name="settings-role" checked={role === value} onChange={() => setRole(value)} />
                {label}
              </label>
            ))}
          </div>
          <p className="hint">Задачи и уважение останутся. Бой с каждым родителем свой: побеждённость не переносится.</p>
        </fieldset>
        <fieldset>
          <legend>Твой пол</legend>
          <div className="seg">
            {([['male', 'Мужской'], ['female', 'Женский']] as const).map(([value, label]) => (
              <label className="opt" key={value}>
                <input type="radio" name="settings-gender" checked={gender === value} onChange={() => setGender(value)} />
                {label}
              </label>
            ))}
          </div>
          <p className="hint">Новые фразы будут с другими окончаниями. Старые в «Истории» не меняются.</p>
        </fieldset>
        <div className="field">
          <label htmlFor="settings-zone">Часовой пояс</label>
          <select id="settings-zone" value={zone} onChange={event => setZone(event.target.value)}>
            {Array.from(new Set([me.timeZone, Intl.DateTimeFormat().resolvedOptions().timeZone, ...zones])).filter(Boolean).map(value => <option key={value}>{value}</option>)}
          </select>
          <p className="hint">Сроки задач покажутся в новом поясе, но сам момент срока не сдвинется.</p>
        </div>
        <QuietHours start={settings.start} end={settings.end} setStart={settings.setStart} setEnd={settings.setEnd} duration={duration} />
        <label className="opt">
          <input type="checkbox" checked={participating} onChange={event => setParticipating(event.target.checked)} />
          <span>
            Участвую в общем рейтинге
            <span className="hint">. Другие видят только твой username и число закрытых задач.</span>
          </span>
        </label>
        <Feedback error={save.error ?? participation.error}>{status}</Feedback>
        <button className="btn" disabled={save.isPending || participation.isPending || duration > 720}>Сохранить</button>
      </form>
      <button className="btn danger" onClick={() => setConfirm(1)}>Удалить аккаунт</button>
      {confirm > 0 && (
        <Sheet title={confirm === 1 ? 'Удалить аккаунт?' : 'Это насовсем'} close={() => setConfirm(0)}>
          <p>{confirm === 1 ? 'Пропадут задачи, лента сообщений, бои, уважение и место в рейтинге. Батя даже не попрощается.' : 'Профиль, задачи, бои и место в рейтинге исчезнут. Вернуть их нельзя. Записи о платежах останутся.'}</p>
          {confirm === 2 && !!balance.data?.balance && <p>{`${balance.data.balance} ударов сгорят без возврата Stars.`}</p>}
          <Feedback pending={balance.isPending} error={remove.error ?? balance.error} />
          {unknown && <p role="alert" className="banner">Не удалось узнать результат удаления. Проверь интернет и обнови статус. До ответа сервера нельзя утверждать, что аккаунт сохранился.</p>}
          <button className="btn danger" disabled={remove.isPending || (confirm === 2 && !balance.data)} onClick={() => confirm === 1 ? setConfirm(2) : void deleteAccount()}>{confirm === 1 ? 'Продолжить удаление' : unknown ? 'Завершить удаление' : 'Удалить окончательно'}</button>
        </Sheet>
      )}
    </>
  );
}
