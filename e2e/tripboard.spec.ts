import { expect, test, type Page } from '@playwright/test';

const trip = {
  id: 'trip-123',
  name: 'Catalina Weekend',
  subtitle: 'March 2026 · 5 friends',
  emoji: '🏝',
  slug: 'catalina-weekend',
  created_at: '2026-03-01T00:00:00Z',
  start_date: '2026-03-20',
  end_date: '2026-03-22',
};

const mockTripboardApi = async (page: Page) => {
  await page.route('**/rest/v1/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const table = url.pathname.split('/').pop();

    if (table === 'trips' && request.method() === 'HEAD') {
      await route.fulfill({ status: 200, headers: { 'content-range': '0-0/12' } });
      return;
    }

    if (table === 'trips') {
      await route.fulfill({
        status: request.method() === 'POST' ? 201 : 200,
        contentType: 'application/json',
        body: JSON.stringify(trip),
      });
      return;
    }

    if (table === 'trip_items') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
      return;
    }

    await route.fulfill({ status: 404, contentType: 'application/json', body: '{}' });
  });
};

test('a first-time visitor can create a trip and reach its board', async ({ page }) => {
  await mockTripboardApi(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Create a Trip' }).click();
  await page.getByPlaceholder('your name').fill('Maya');
  await page.getByPlaceholder('Catalina Weekend').fill(trip.name);
  await page.getByPlaceholder('March 2026 · 5 friends').fill(trip.subtitle);
  await page.getByRole('button', { name: 'Create Trip' }).click();

  await expect(page).toHaveURL(/\/t\/catalina-weekend$/);
  await expect(page.getByRole('heading', { name: trip.name })).toBeVisible();
  await expect(page.getByText('0 items saved')).toBeVisible();
});

test('a backend outage is not presented as a bad trip link', async ({ page }) => {
  await page.route('**/rest/v1/trips*', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({ code: 'PGRST000', message: 'database unavailable' }),
    });
  });

  await page.goto('/t/catalina-weekend');

  await expect(page.getByRole('heading', { name: "the board isn't loading" })).toBeVisible();
  await expect(page.getByText('your link may be fine')).toBeVisible();
  await expect(page.getByText('Trip not found')).not.toBeVisible();
});

test('sharing explains the permissions carried by the link', async ({ page }) => {
  await page.addInitScript((tripId) => {
    localStorage.setItem('tripboard-username', 'Maya');
    localStorage.setItem(`tripboard-just-created-${tripId}`, 'true');
    Object.defineProperty(navigator, 'share', { value: undefined, configurable: true });
  }, trip.id);
  await mockTripboardApi(page);
  await page.goto(`/t/${trip.slug}`);

  await page.getByRole('button', { name: /share the link/i }).click();

  await expect(page.getByRole('heading', { name: 'Share this trip' })).toBeVisible();
  await expect(page.getByText('anyone with this link can view the board, add ideas, and edit or remove items.')).toBeVisible();
});
