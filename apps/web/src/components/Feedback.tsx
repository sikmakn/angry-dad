import type { ReactNode } from 'react';
import { errorText } from '../api/client';

export function Feedback({ pending, error, children }: { pending?: boolean; error?: unknown; children?: ReactNode }) {
  return (
    <>
      {pending && <p className="banner" role="status" aria-busy="true">Загрузка…</p>}
      {!!error && <p className="banner" role="alert">{errorText(error)}</p>}
      {children && <div role="status">{children}</div>}
    </>
  );
}
