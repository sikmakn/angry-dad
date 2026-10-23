export function TaskTitle({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="field">
      <label htmlFor="new-title">Что нужно сделать</label>
      <textarea id="new-title" required maxLength={120} value={value} placeholder="Например: написать отчёт по продажам" onChange={event => onChange(event.target.value)} aria-describedby="title-hint" />
      <span id="title-hint" className="hint">{`Конкретно: что, сколько, где. ${value.length}/120`}</span>
      {value.length === 120 && <span className="hint">Больше не влезет. Лишнее отрезано.</span>}
    </div>
  );
}
