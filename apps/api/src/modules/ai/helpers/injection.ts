// Серверный фильтр ответов модели: ссылки, код и утечка инструкции не доходят до пользователя.
const unsafeOutput = [/https?:\/\//i, /www\./i, /```/, /<\/?[a-z][^>]*>/i, /системн[а-яё]+\s+(промпт|инструкц)/i, /system\s+prompt/i, /\{\s*"[a-z]+"\s*:/i];
export function unsafeReply(text: string): boolean {
  return unsafeOutput.some(pattern => pattern.test(text));
}
