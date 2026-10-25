import { useState } from 'react';
import type { Me } from '../api/contract';
import { Feedback } from '../components/Feedback';
import { Quote } from '../components/Quote';
import { LegalContent } from '../components/LegalContent';
import { Sheet } from '../components/Sheet';
import { useOnboarding } from './hooks/useOnboarding';
import { ParentChoice } from './components/ParentChoice';
import { GenderChoice } from './components/GenderChoice';
import { quietInvalid } from '../settings/quietTime';
import { QuietHours } from '../settings/components/QuietHours';

export function StartScreen({ me, finished }: { me: Me; finished: () => void }) {
  const { step, role, setRole, gender, setGender, result, save, zone, next, back, quietStart, setQuietStart, quietEnd, setQuietEnd, quietDuration } = useOnboarding(me, finished);
  const [legal, setLegal] = useState(false);
  return (
    <>
      <div className="eyebrow">{`Шаг ${step} из 4`}</div>
      <h1 tabIndex={-1}>{step === 1 ? 'Выберите Вашего вредного родителя' : step === 2 ? 'Выберите Ваш пол' : step === 3 ? result?.replies[0] : 'Что нужно сделать?'}</h1>
      {step === 1 && (
        <>
          <ParentChoice role={role} select={setRole} />
          {role && <p className="small muted">Ты в общем рейтинге. Выйти можно в настройках.</p>}
          {!zone && <p className="banner">Пояс не определился. Поставили UTC+3 (Москва). Сменить можно в настройках.</p>}
          <p className="small">
            Продолжая, вы принимаете
            {' '}
            <button className="btn ghost" onClick={() => setLegal(true)}>условия и политику конфиденциальности</button>
          </p>
        </>
      )}
      {step === 2 && (
        <>
          {me.returning && <Quote text={role === 'mother' ? 'Снова начинаем. Я не удивлена.' : 'Снова начинаем. Я не удивлён.'} role={role} />}
          <GenderChoice gender={gender} select={setGender} pending={save.isPending} />
          <p className="small muted">От пола зависят окончания: «сам» или «сама». Больше ни от чего.</p>
          <QuietHours start={quietStart} end={quietEnd} setStart={setQuietStart} setEnd={setQuietEnd} duration={quietDuration} />
          <button className="btn ghost" disabled={save.isPending} onClick={back}>Назад</button>
        </>
      )}
      {step === 3 && <p className="muted">Передумаете: родителя и пол можно сменить в настройках.</p>}
      {step === 4 && result?.replies.slice(1).map((text, index) => <Quote key={index} text={text} role={role} />)}
      <Feedback pending={save.isPending} error={save.error} />
      <button className="btn" disabled={save.isPending || (step === 1 && !role) || (step === 2 && (!gender || quietInvalid(quietDuration)))} onClick={() => void next()}>{step === 4 ? 'Назвать задачу' : 'Дальше'}</button>
      {legal && <Sheet title="Условия и политика конфиденциальности" close={() => setLegal(false)}><LegalContent /></Sheet>}
    </>
  );
}
