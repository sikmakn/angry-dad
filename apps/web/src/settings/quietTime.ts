export const timeString = (value: number) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
export const minutes = (value: string) => Number(value.split(':')[0]) * 60 + Number(value.split(':')[1]);
// Пустое поле времени даёт NaN: такое значение отправлять нельзя.
export const quietInvalid = (duration: number) => Number.isNaN(duration);
