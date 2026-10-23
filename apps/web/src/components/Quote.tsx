import type { Role } from '../api/contract';

export function Quote({ text, role }: { text: string; role?: Role }) {
  return (
    <blockquote className="quote">
      {text}
      <span className="who">{role === 'mother' ? 'Мама' : 'Батя'}</span>
    </blockquote>
  );
}
