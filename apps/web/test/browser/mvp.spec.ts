import type { Page } from '@playwright/test';
import { test, expect, task, closed } from './fixtures';

async function noOverflow(page: Page) {
  await page.evaluate(() => document.fonts.ready.then(() => {}));
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
}

test('onboarding → first task → server reply → home → completion result', async ({ page, world }) => {
  world.me = { ...world.me, onboarding: 'guest', role: undefined, gender: undefined };
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Дальше' })).toBeDisabled();
  await page.getByRole('radio', { name: /^Отец/ }).check();
  await page.getByRole('button', { name: 'Дальше' }).click();
  await expect(page.getByRole('heading', { name: 'Выберите Ваш пол' })).toBeVisible();
  await page.getByRole('radio', { name: 'Мужской', exact: true }).check();
  await page.getByRole('button', { name: 'Дальше' }).click();
  await expect(page.getByRole('heading', { name: 'Соболезнуем Вам. Крепитесь…' })).toBeVisible();
  expect(world.onboarding).toEqual([{ role: 'father', gender: 'male', timeZone: 'Europe/Minsk' }]);
  await page.getByRole('button', { name: 'Дальше' }).click();
  await expect(page.getByText('Опять ничего сам не можешь? Ну, что тебе надо сделать?')).toBeVisible();
  await page.getByRole('button', { name: 'Назвать задачу' }).click();
  await expect(page.getByRole('navigation')).toHaveCount(0);
  await page.getByLabel('Что нужно сделать').fill(task.title);
  await page.getByRole('button', { name: 'Завтра', exact: true }).click();
  await page.getByRole('button', { name: 'Поставить', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Новая задача поставлена' })).toHaveCount(1);
  await expect(page.getByText('Записал. Посмотрим.')).toBeVisible();
  expect(world.creates).toHaveLength(1);
  expect(world.creates[0]).toMatchObject({ title: task.title, kind: 'one_time' });
  expect(Number.isFinite(Date.parse(world.creates[0].deadline!))).toBe(true);
  await page.getByRole('button', { name: 'К задачам', exact: true }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.getByRole('link', { name: new RegExp(task.title) }).click();
  await page.getByRole('button', { name: 'Готово', exact: true }).click();
  await expect(page.getByText('✓ Выполнено', { exact: true })).toBeVisible();
  const reply = page.getByRole('blockquote');
  await expect(reply).toBeVisible();
  await expect(reply).toContainText('Ну наконец-то.');
  await expect(page.getByText('+3 · 12 → 15', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Готово', exact: true })).toHaveCount(0);
  expect(world.completions).toBe(1);
});

test('archive → closed detail → reload → Telegram Back restores home', async ({ page, world }) => {
  world.tasks = [closed, { ...closed, id: 't_stopped', title: 'Остановленная привычка', kind: 'recurring', recurrence: { type: 'daily' }, status: 'stopped' }];
  await page.goto('/');
  await page.getByText('Завершённые, проваленные и остановленные', { exact: true }).click();
  await expect(page.getByRole('link', { name: /Остановленная привычка/ })).toBeVisible();
  await page.getByRole('link', { name: new RegExp(task.title) }).click();
  await expect(page).toHaveURL(/#task\/t_browser$/);
  await expect(page.getByText('✓ Выполнено', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Готово', exact: true })).toBeVisible();
  await expect(page.getByText('За этот период: 3', { exact: true })).toBeVisible();
  await page.evaluate(() => window.browserTelegram.back());
  await expect(page).toHaveURL(/#home$/);
  await expect(page.getByRole('link', { name: 'Главная', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.getByText('Завершённые, проваленные и остановленные', { exact: true }).click();
  await expect(page.getByRole('link', { name: new RegExp(task.title) })).toBeVisible();
});

test('lost create response survives reload and list review without a second POST', async ({ page, world }) => {
  world.loseCreateResponse = true;
  await page.goto('/#task-new');
  await page.getByLabel('Что нужно сделать').fill(task.title);
  await page.getByRole('button', { name: 'Завтра', exact: true }).click();
  await page.getByRole('button', { name: 'Поставить', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Результат неизвестен' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Результат неизвестен' })).toBeVisible();
  await expect(page.getByLabel('Что нужно сделать')).toHaveValue(task.title);
  await expect(page.getByRole('button', { name: 'Поставить', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: 'Обновить список задач' }).click();
  await expect(page.getByRole('link', { name: task.title, exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Вернуться к форме без отправки' })).toBeDisabled();
  await page.getByRole('checkbox', { name: /^Я проверил список/ }).check();
  await page.getByRole('button', { name: 'Вернуться к форме без отправки' }).click();
  await expect(page.getByRole('button', { name: 'Поставить', exact: true })).toBeEnabled();
  expect(world.creates).toHaveLength(1);
  await page.getByRole('link', { name: '← Задачи', exact: true }).click();
  await expect(page.getByRole('link', { name: new RegExp(task.title) })).toBeVisible();
  expect(world.creates).toHaveLength(1);
});

test('same-session Telegram activation preserves the open task form and draft', async ({ page, world }) => {
  await page.goto('/#task-new');
  const title = page.getByLabel('Что нужно сделать');
  await title.fill('Подготовить черновик отчёта');
  world.me = { ...world.me, timeZone: 'Pacific/Auckland' };
  await page.evaluate(() => window.browserTelegram.activate());
  // An updated profile on screen proves the activation refresh has been applied.
  await expect(page.getByText(/^Сохранён Pacific\/Auckland,/)).toBeVisible();
  await expect(page).toHaveURL(/#task-new$/);
  await expect(page.getByRole('heading', { name: 'Новая задача', exact: true })).toBeVisible();
  await expect(title).toHaveValue('Подготовить черновик отчёта');
  expect(world.creates).toHaveLength(0);
});

test('native dialog traps Tab in both directions; Escape and Telegram Back restore opener', async ({ page, world }) => {
  world.tasks = [task];
  await page.goto(`/#task/${task.id}`);
  const opener = page.getByRole('button', { name: 'Сдаюсь', exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: 'Сдаёшься?' });
  const confirm = dialog.getByRole('button', { name: 'Да, сдаюсь' });
  const cancel = dialog.getByRole('button', { name: 'Отмена' });
  await expect(confirm).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(confirm).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(cancel).toBeFocused();
  // Native modal inertness must prevent a programmatic focus escape as well.
  await opener.evaluate(element => element.focus());
  await expect(cancel).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await opener.click();
  await expect(dialog).toBeVisible();
  await page.evaluate(() => window.browserTelegram.back());
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page).toHaveURL(/#task\/t_browser$/);
  await page.evaluate(() => window.browserTelegram.back());
  await expect(page).toHaveURL(/#home$/);
  expect(world.completions).toBe(0);
});

for (const width of [390, 320]) {
  test(`mobile ${width}px: no overflow, Telegram dark theme and safe areas remain usable`, async ({ page, world }) => {
    await page.setViewportSize({ width, height: 844 });
    world.tasks = [{ ...task, title: 'Подготовить_очень_длинный_непрерывный_заголовок_отчёта_для_проверки_переноса_текста' }];
    await page.goto('/');
    const card = page.getByRole('link', { name: new RegExp(world.tasks[0].title) });
    await expect(card).toBeVisible();
    await noOverflow(page);
    const body = page.locator('body');
    const darkBackground = await body.evaluate(element => getComputedStyle(element).backgroundColor);
    const channels = darkBackground.match(/\d+/g)!.map(Number);
    expect(Math.max(...channels.slice(0, 3))).toBeLessThan(80);
    const nav = page.getByRole('navigation');
    const mainLink = page.getByRole('link', { name: 'Главная', exact: true });
    const bottomGap = () => nav.evaluate((element) => {
      const link = element.querySelector('a')!;
      return element.getBoundingClientRect().bottom - link.getBoundingClientRect().bottom;
    });
    await expect.poll(bottomGap).toBeGreaterThanOrEqual(34);
    await expect(mainLink).toBeInViewport();
    const cardBox = (await card.boundingBox())!;
    expect(cardBox.x).toBeGreaterThanOrEqual(6);
    expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(width - 6);
    expect((await page.getByRole('main').boundingBox())!.y).toBeGreaterThanOrEqual(28);
    await page.evaluate(() => window.browserTelegram.update('light', 44));
    await expect.poll(() => body.evaluate(element => getComputedStyle(element).backgroundColor)).not.toBe(darkBackground);
    await expect.poll(bottomGap).toBeGreaterThanOrEqual(54);
    await card.click();
    await page.getByRole('button', { name: 'Сдаюсь', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Сдаёшься?' });
    await expect(dialog).toBeVisible();
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(width + 1);
    await expect(dialog.getByRole('button', { name: 'Отмена' })).toBeInViewport();
    await page.keyboard.press('Escape');
    await page.getByRole('link', { name: '← Задачи', exact: true }).click();
    await page.getByRole('link', { name: 'Новая задача', exact: true }).click();
    await page.getByLabel('Что нужно сделать').fill('Повторять английский каждый день');
    await expect(page.getByLabel('Как часто')).toBeVisible();
    await noOverflow(page);
    await page.getByRole('button', { name: 'Поставить', exact: true }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('button', { name: 'Поставить', exact: true })).toBeInViewport();
  });
}
