import { useState } from 'react';
import type { Me, Schema } from '../../api/contract';
import { useRead } from '../../hooks/useApi';
import { Feedback } from '../../components/Feedback';

const metricLabels: Partial<Record<keyof Schema<'MetricsResponse'>, string>> = {
  day7Retention: 'Возврат на 7-й день', closedShare: 'Доля закрытых задач', checkInAnswerRate: 'Ответы на проверки', firstPurchaseConversion: 'Конверсия в первую покупку', turnCostToStrikeRevenue: 'Стоимость хода / выручка', botBlockedShare: 'Заблокировали бота', avgPhraseScore: 'Средний балл фраз', sharesPer100Active: 'Пересылки на 100 активных', medianStartToFirstTaskSeconds: 'До первой задачи, секунд',
};

export function OwnerMetrics({ me }: { me: Me }) {
  const [range, setRange] = useState(() => ({ from: new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }));
  const [selected, setSelected] = useState(range);
  const valid = Date.parse(range.to) > Date.parse(range.from) && Date.parse(range.to) - Date.parse(range.from) <= 92 * 86400000;
  const metrics = useRead(me.id, 'getOwnerMetrics', { query: { from: `${selected.from}T00:00:00Z`, to: `${selected.to}T00:00:00Z` } });
  return (
    <>
      <h2>Метрики</h2>
      <form
        className="card"
        onSubmit={(event) => {
          event.preventDefault();
          setSelected(range);
        }}
      >
        <div className="seg" aria-label="Период метрик">
          {([7, 30] as const).map(days => (
            <button
              type="button"
              className="btn ghost"
              key={days}
              onClick={() => {
                const next = { from: new Date(Date.now() - days * 86400000).toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) };
                setRange(next);
                setSelected(next);
              }}
            >
              {days}
              {' дней'}
            </button>
          ))}
        </div>
        {(['from', 'to'] as const).map(key => (
          <div className="field" key={key}>
            <label htmlFor={`metric-${key}`}>{key === 'from' ? 'С' : 'До (не включая)'}</label>
            <input id={`metric-${key}`} type="date" required value={range[key]} onChange={event => setRange({ ...range, [key]: event.target.value })} />
          </div>
        ))}
        <p className="hint">Период до 92 дней. Время UTC.</p>
        <button className="btn" disabled={!valid}>Показать</button>
      </form>
      <Feedback pending={metrics.isPending} error={metrics.error} />
      {metrics.isError && <button className="btn ghost" onClick={() => void metrics.refetch()}>Повторить</button>}
      {metrics.data && (
        <dl className="card facts">
          {Object.entries(metricLabels).map(([key, label]) => (
            <div key={key}>
              <dt>{label}</dt>
              <dd>{metrics.data[key as keyof Schema<'MetricsResponse'>] ?? 'Нет данных'}</dd>
            </div>
          ))}
        </dl>
      )}
    </>
  );
}
