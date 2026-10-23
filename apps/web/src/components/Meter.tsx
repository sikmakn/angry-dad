export function Meter({ label, value, red = false }: { label: string; value: number; red?: boolean }) {
  return (
    <div className={`scale ${red ? 'red' : ''}`}>
      <div className="head">
        <span>{label}</span>
        <b>{`${Math.floor(value)} из 100`}</b>
      </div>
      <div className="track" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
        <div className="fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}
