import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { Sheet } from '../../src/components/Sheet';
import { useTelegram } from '../../src/platform/telegram';
import { apiLifecycle, installTelegram } from '../helpers/api';

apiLifecycle();
describe('Telegram Back ownership (DOM only)', () => {
  it('closes a sheet before the underlying route and restores the opener focus', async () => {
    const telegram = installTelegram();
    const navigateBack = vi.fn();
    function Screen() {
      const [open, setOpen] = useState(false);
      useTelegram(navigateBack);
      return (
        <>
          <button onClick={() => setOpen(true)}>Открыть диалог</button>
          {open && <Sheet title="Подтвердить" close={() => setOpen(false)}>Содержимое</Sheet>}
        </>
      );
    }
    const view = render(<Screen />);
    const user = userEvent.setup();
    const opener = screen.getByRole('button', { name: 'Открыть диалог' });
    await user.click(opener);
    await screen.findByRole('dialog', { name: 'Подтвердить' });
    act(() => telegram.back());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(opener).toHaveFocus();
    expect(navigateBack).not.toHaveBeenCalled();
    act(() => telegram.back());
    expect(navigateBack).toHaveBeenCalledOnce();
    view.unmount();
    act(() => telegram.back());
    expect(navigateBack).toHaveBeenCalledOnce();
    expect(telegram.app.BackButton.hide).toHaveBeenCalled();
  });

  it('handles native dialog cancel as safe cancellation', async () => {
    function Screen() {
      const [open, setOpen] = useState(true);
      return open ? <Sheet title="Удалить?" close={() => setOpen(false)}>Вернуть нельзя</Sheet> : <p>Отменено</p>;
    }
    render(<Screen />);
    const sheet = screen.getByRole('dialog', { name: 'Удалить?' });
    fireEvent(sheet, new Event('cancel', { bubbles: true, cancelable: true }));
    await waitFor(() => expect(screen.getByText('Отменено')).toBeVisible());
  });
});
