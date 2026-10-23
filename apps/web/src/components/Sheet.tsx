import { useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { useTelegram } from '../platform/telegram';

function containTab(event: KeyboardEvent<HTMLDialogElement>) {
  if (event.key !== 'Tab' || event.defaultPrevented) {
    return;
  }
  const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href], input, select, textarea, [tabindex]'))
    .filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && element.getClientRects().length > 0);
  const first = controls[0];
  const last = controls.at(-1);
  if (!first) {
    event.preventDefault();
    event.currentTarget.focus();
  } else if (!controls.includes(document.activeElement as HTMLElement) || (event.shiftKey ? document.activeElement === first : document.activeElement === last)) {
    event.preventDefault();
    (event.shiftKey ? last : first)?.focus();
  }
}

export function Sheet({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  const id = useId();
  useTelegram(close);
  useEffect(() => {
    const previous = document.activeElement;
    const dialog = ref.current;
    dialog?.showModal();
    return () => {
      dialog?.close();
      if (previous instanceof HTMLElement && previous.isConnected) {
        previous.focus();
      }
    };
  }, []);
  return (
    <dialog
      className="sheet"
      ref={ref}
      aria-labelledby={id}
      tabIndex={-1}
      onKeyDown={containTab}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <h2 id={id}>{title}</h2>
      {children}
      <button type="button" className="btn ghost" onClick={close}>Отмена</button>
    </dialog>
  );
}
