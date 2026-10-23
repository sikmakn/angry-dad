import { useState } from 'react';
import type { Me, Schema } from '../../api/contract';
import { usePages, useRead, useWrite } from '../../hooks/useApi';

export function useOwnerStrikes(me: Me) {
  const [input, setInput] = useState('');
  const [id, setId] = useState('');
  const [reason, setReason] = useState('');
  const [amount, setAmount] = useState(1);
  const [notice, setNotice] = useState('');
  const [type, setType] = useState<Schema<'CreateStrikeOperationRequest'>['type']>('manual_grant');
  const [confirmation, setConfirmation] = useState<'strikes' | Schema<'PaymentResponse'>>();
  const user = useRead(me.id, 'getOwnerUser', { path: { telegramId: id } }, !!id);
  const balance = useRead(me.id, 'getOwnerUserStrikes', { path: { telegramId: id } }, !!id && !!user.data);
  const operations = usePages(me.id, 'listOwnerUserStrikeOperations', { path: { telegramId: id } }, !!id && !!user.data);
  const payments = usePages(me.id, 'listOwnerPayments', { query: { ...(id ? { telegramId: Number(id) } : {}) } });
  const tickets = usePages(me.id, 'listOwnerSupportTickets');
  const change = useWrite(me.id, 'createOwnerStrikeOperation');
  const refund = useWrite(me.id, 'refundOwnerPayment');
  const ticket = useWrite(me.id, 'updateOwnerSupportTicket');
  const invalidAmount = !Number.isInteger(amount) || amount < 1 || (type === 'manual_revoke' && amount > (balance.data?.balance ?? 0));
  const pending = change.isPending || refund.isPending;

  async function confirm() {
    if (!reason.trim()) {
      return;
    }
    try {
      if (confirmation === 'strikes') {
        if (invalidAmount) {
          return;
        }
        const before = balance.data?.balance;
        const response = await change.run({ path: { telegramId: id }, body: { type, amount, reason: reason.trim() } });
        if (!response) {
          return;
        }
        const latest = await balance.refetch();
        setNotice(`${type === 'manual_grant' ? 'Начислено' : 'Списано'} ${amount} ударов. Баланс: ${before} → ${latest.data?.balance ?? 'обновляется'}. Причина сохранена в истории пользователя и журнале.`);
      } else if (confirmation) {
        const response = await refund.run({ path: { paymentId: confirmation.id }, body: { reason: reason.trim() } });
        if (!response) {
          return;
        }
        setNotice('Stars возвращены. Партия ударов списана. Запись добавлена в историю пользователя и журнал.');
      }
      setConfirmation(undefined);
    } catch { /* Keep reason and confirmation for an explicit user decision. */ }
  }

  function openUser(telegramId: string) {
    setInput(telegramId);
    setId(telegramId);
    setNotice('');
    if (id === telegramId) {
      void user.refetch();
    }
  }

  const updateTicket = (item: Schema<'SupportTicketResponse'>) => ticket.run({ path: { ticketId: item.id }, body: { status: item.status === 'open' ? 'resolved' : 'open' } }).catch(() => {});
  return { input, setInput, id, openUser, reason, setReason, amount, setAmount, type, setType, confirmation, setConfirmation, user, balance, operations, payments, tickets, change, refund, ticket, invalidAmount, pending, notice, confirm, updateTicket };
}
