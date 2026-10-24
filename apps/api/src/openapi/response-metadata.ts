import { ApiHeader } from '@nestjs/swagger';
import type { HeaderObject } from '@nestjs/swagger';

export function locationHeaders(address: string): Record<string, HeaderObject> {
  return {
    Location: {
      description: `Адрес, возвращаемый контроллером: ${address}`,
      schema: {
        type: 'string',
        example: address,
      },
    },
  };
}

export function ApiIdempotencyKey(required: boolean, lifetime: 'financial' | 'quote' | 'turn'): MethodDecorator {
  const descriptions = {
    financial: 'Необязательный ключ хранится 24 часа. Идентичный запрос возвращает 200 с прежним телом; другие данные с тем же ключом: 409 idempotency_key_reused. Без ключа создаётся новая операция.',
    quote: 'Ключ сохраняется, пока существует сохранённая реплика. Идентичный запрос возвращает 200 с прежним телом; другое сообщение с тем же ключом: 409 idempotency_key_reused. Без ключа каждый вызов добавляет новую цитату.',
    turn: 'Обязательный ключ хода. Успешный повтор: 200 с прежним телом без повторного списания; ход в работе: 409 turn_in_progress; неуспешный ход: прежний 502 turn_failed, для новой попытки нужен новый ключ; другой текст: 409 idempotency_key_reused.',
  };
  return ApiHeader({
    name: 'Idempotency-Key',
    required,
    description: descriptions[lifetime],
    schema: {
      type: 'string',
      minLength: 8,
      maxLength: 64,
    },
  });
}
