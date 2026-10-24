export function PenCheck({ className = '' }: { className?: string }) {
  return <span className={`pen-check ${className}`} aria-hidden="true" />;
}
