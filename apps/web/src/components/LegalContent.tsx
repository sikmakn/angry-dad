import { config } from '../platform/telegram';

export function LegalContent() {
  return (
    <>
      <div className="card stack">
        <h3>Внешний ИИ</h3>
        <p>Реплики в перепалке и связанный с ней контекст, включая название задачи при цитировании, передаются внешнему ИИ для ответа персонажа. При создании и переименовании задач ИИ не используется.</p>
      </div>
      <div className="card stack">
        <h3>Полный текст</h3>
        {config.termsUrl
          ? <a className="back" href={config.termsUrl} target="_blank" rel="noreferrer">Условия и политика конфиденциальности</a>
          : <p>Полный текст условий и политики конфиденциальности размещает владелец продукта.</p>}
      </div>
    </>
  );
}
