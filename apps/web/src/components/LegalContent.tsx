import { config } from '../platform/telegram';

export function LegalContent() {
  return (
    <>
      <div className="card stack">
        <h3>Внешний ИИ</h3>
        <p>Тексты ваших задач и реплики в бою передаются внешнему ИИ: он проверяет, что задача конкретная, и отвечает за персонажа.</p>
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
