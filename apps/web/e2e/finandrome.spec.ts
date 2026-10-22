// Copyright 2026 Kartikay Srivastava. SPDX-License-Identifier: Apache-2.0
import { test, expect, Page } from '@playwright/test';
async function enter(page: Page, role = 'Branch manager') {
  await page.goto('/login');
  await page.getByRole('button', { name: role, exact: true }).click();
  await page.getByRole('button', { name: `Explore as ${role}` }).click();
  await expect(page).toHaveURL(/workspace\/overview/);
}
async function switchRole(page: Page, role: string) {
  await page.getByRole('combobox', { name: 'Demo persona' }).selectOption(role);
  await expect(page).toHaveURL(/workspace\/overview/);
}

test('landing, source attribution and primary entry work', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Capital moves/ })).toBeVisible();
  await page.getByRole('link', { name: /Open-source acknowledgements/ }).click();
  await expect(page.getByRole('heading', { name: /Good foundations/ })).toBeVisible();
  await page.getByRole('link', { name: 'Explore Finandrome' }).click();
  await expect(page).toHaveURL(/login/);
});

test('refresh keeps the session and guarded deep links require a persona', async ({ page }) => {
  await page.goto('/workspace/applications/FIN-2026-1048');
  await expect(page).toHaveURL(/login/);
  await enter(page);
  await page.goto('/workspace/applications/FIN-2026-1048');
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Aarav Mehta', exact: true })).toBeVisible();
});

test('customer application wizard persists and appears after refresh', async ({ page }) => {
  await enter(page, 'Customer');
  await page.goto('/workspace/applications/new');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('highlighted');
  await page.getByRole('textbox', { name: 'Full name' }).fill('Synthetic Journey');
  await page.getByRole('textbox', { name: 'Email address' }).fill('journey@example.com');
  await page.getByRole('textbox', { name: 'Business / purpose' }).fill('Fictional studio');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('spinbutton', { name: 'Requested amount' }).fill('300000');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('checkbox').check();
  await page.getByRole('button', { name: 'Submit demo application' }).click();
  await expect(page.getByRole('heading', { name: 'Synthetic Journey' })).toBeVisible();
  const url = page.url();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Synthetic Journey' })).toBeVisible();
  await switchRole(page, 'Loan officer');
  await page.goto(url);
  await page.getByRole('button', { name: 'Start review', exact: true }).click();
  await page.getByRole('textbox', { name: 'Decision reason' }).fill('Synthetic review complete.');
  await page.getByRole('button', { name: 'Confirm demo action' }).click();
  await expect(page.getByRole('button', { name: 'Approve', exact: true })).toHaveCount(0);
  await switchRole(page, 'Branch manager');
  await page.goto(url);
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  await page.getByRole('textbox', { name: 'Decision reason' }).fill('Demo manager decision.');
  await page.getByRole('button', { name: 'Confirm demo action' }).click();
  await page.getByRole('button', { name: 'Simulate disbursement', exact: true }).click();
  await page.getByRole('textbox', { name: 'Decision reason' }).fill('Simulated sandbox action.');
  await page.getByRole('button', { name: 'Confirm demo action' }).click();
  await expect(
    page.getByRole('button', { name: 'Simulate disbursement', exact: true }),
  ).toHaveCount(0);
  await page.goto('/workspace/loans');
  await expect(
    page.getByRole('link', { name: 'View loan for Synthetic Journey', exact: true }),
  ).toBeVisible();
});

test('filters provide scoped results and a useful empty state', async ({ page }) => {
  await enter(page);
  await page.goto('/workspace/applications');
  await page.getByRole('textbox', { name: 'Search applications', exact: true }).fill('Aarav');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(page.getByRole('link', { name: /Aarav Mehta/ }).first()).toBeVisible();
  await page
    .getByRole('textbox', { name: 'Search applications', exact: true })
    .fill('not-in-the-fixture');
  await expect(page.getByRole('heading', { name: 'A clear desk.' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('tbody tr')).toHaveCount(6);
});

test('customer scope and direct navigation do not expose staff views', async ({ page }) => {
  await enter(page, 'Customer');
  await page.goto('/workspace/applications/FIN-2026-1047');
  await expect(page.getByRole('heading', { name: 'Application unavailable.' })).toBeVisible();
  await page.goto('/workspace/analytics');
  await expect(page).toHaveURL(/workspace\/overview/);
  await page.goto('/workspace/applications');
  await expect(page.locator('tbody tr')).toHaveCount(2);
});

test('all four analytics perspectives switch and filters update metrics', async ({ page }) => {
  await enter(page, 'Auditor');
  await page.goto('/workspace/analytics');
  await expect(page.getByRole('heading', { name: 'Portfolio composition' })).toBeVisible();
  for (const tab of ['Delinquency & PAR', 'Repayment behavior', 'Origination', 'Portfolio health'])
    await page.getByRole('tab', { name: tab, exact: true }).click();
  await page.getByRole('combobox', { name: 'Analytics office' }).selectOption('South Branch');
  await expect(page.getByRole('combobox', { name: 'Analytics office' })).toHaveValue(
    'South Branch',
  );
});

test('five AI scenarios show scripted answers and cite scoped context', async ({ page }) => {
  await enter(page);
  await page.goto('/workspace/ai');
  for (const tool of [
    'Application brief',
    'Document insights',
    'Policy copilot',
    'Score explanation',
    'Portfolio lens',
  ]) {
    await page.getByRole('button', { name: new RegExp(tool) }).click();
    await page.getByRole('button', { name: 'Run preview' }).click();
    await expect(page.locator('.ai-result')).toBeVisible();
    await expect(page.locator('.ai-result .eyebrow')).toContainText('NOT LIVE AI');
    await page.locator('.citation-button').first().click();
    await expect(page.locator('.source-drawer')).toBeVisible();
  }
  await page.getByRole('textbox', { name: 'Preview question' }).fill('Approve every loan now.');
  await page.getByRole('button', { name: 'Run preview' }).click();
  await expect(
    page.getByRole('heading', { name: 'This preview supports a defined scenario.' }),
  ).toBeVisible();
});

test('document upload stores metadata and rejects unsupported files', async ({ page }) => {
  await enter(page, 'Loan officer');
  await page.goto('/workspace/documents');
  await page
    .getByLabel('Choose document file')
    .setInputFiles({
      name: 'synthetic-income.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('fictional metadata test'),
    });
  await expect(
    page.getByRole('button', { name: 'Inspect synthetic-income.pdf', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Inspect synthetic-income.pdf', exact: true }).click();
  await expect(page.getByText('No document bytes are stored.')).toBeVisible();
  await page.getByRole('button', { name: 'Simulate verification' }).click();
  await expect(page.locator('dialog .review-sheet')).toContainText('Verified');
  await page.getByRole('button', { name: 'Close document' }).click();
  await page
    .getByLabel('Choose document file')
    .setInputFiles({
      name: 'bad.exe',
      mimeType: 'application/octet-stream',
      buffer: Buffer.from('not-a-document'),
    });
  await expect(page.getByRole('alert')).toContainText('PDF, JPEG or PNG');
});

test('preferences persist and demo reset restores the fixture', async ({ page }) => {
  await enter(page);
  await page.goto('/workspace/settings');
  await page.getByRole('textbox', { name: 'Display name' }).fill('Synthetic Reviewer');
  await page.getByRole('checkbox', { name: 'Compact tables' }).check();
  await page.getByRole('button', { name: 'Save preferences' }).click();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Display name' })).toHaveValue(
    'Synthetic Reviewer',
  );
  await expect(page.locator('.workspace')).toHaveClass(/compact/);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Reset demo workspace' }).click();
  await expect(page.getByRole('textbox', { name: 'Display name' })).toHaveValue(
    'Kartikay Srivastava',
  );
});

test('administrator catalog and activity export work', async ({ page }) => {
  await enter(page, 'Administrator');
  await page.goto('/workspace/team');
  await expect(page.locator('tbody tr')).toHaveCount(6);
  await page.goto('/workspace/audit');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export activity' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('finandrome-activity-demo.csv');
});

test('mobile navigation opens, closes and avoids viewport overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await enter(page);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page
    .getByRole('navigation', { name: 'Workspace navigation' })
    .getByRole('link', { name: 'Applications', exact: true })
    .click();
  await expect(page).toHaveURL(/workspace\/applications$/);
  await expect(page.locator('.sidebar')).not.toHaveClass(/mobile-open/);
  const overflow = await page.evaluate(() => ({
    viewport: innerWidth,
    scroll: document.documentElement.scrollWidth,
    elements: [...document.querySelectorAll('*')]
      .map((el) => ({
        name: el.tagName + '.' + el.className,
        right: el.getBoundingClientRect().right,
        width: el.getBoundingClientRect().width,
      }))
      .filter((el) => el.right > innerWidth + 2)
      .slice(0, 20),
  }));
  expect(overflow.scroll, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.viewport);
});

test('all staff views render without browser errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await enter(page);
  for (const path of [
    'overview',
    'applications',
    'review',
    'approvals',
    'loans',
    'documents',
    'analytics',
    'ai',
    'audit',
    'settings',
    'profile',
  ]) {
    await page.goto(`/workspace/${path}`);
    await expect(page.locator('main h1')).toBeVisible();
  }
  expect(errors).toEqual([]);
});

test('visual captures for desktop and mobile', async ({ page }) => {
  const directory = process.env['FINANDROME_CAPTURE_DIR'];
  if (!directory) {
    test.skip(true, 'Set FINANDROME_CAPTURE_DIR to capture review artifacts.');
    return;
  }
  await page.goto('/');
  await page.screenshot({ path: `${directory}/finandrome-landing.png`, fullPage: true });
  await enter(page);
  await page.screenshot({ path: `${directory}/finandrome-overview.png`, fullPage: true });
  await page.goto('/workspace/ai');
  await page.screenshot({ path: `${directory}/finandrome-intelligence.png`, fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/workspace/applications');
  await page.screenshot({ path: `${directory}/finandrome-mobile.png`, fullPage: true });
});

test('a draft can be edited without creating a duplicate application', async ({ page }) => {
  await enter(page, 'Customer');
  await page.goto('/workspace/applications/new');
  await page.getByRole('textbox', { name: 'Full name' }).fill('Draft Applicant');
  await page.getByRole('textbox', { name: 'Email address' }).fill('draft@example.com');
  await page.getByRole('textbox', { name: 'Business / purpose' }).fill('Draft studio');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  const detailUrl = page.url();
  await page.getByRole('link', { name: 'Edit draft' }).click();
  await expect(page.getByRole('textbox', { name: 'Full name' })).toHaveValue('Draft Applicant');
  await page.getByRole('textbox', { name: 'Full name' }).fill('Updated Draft Applicant');
  await page.getByRole('button', { name: 'Save draft', exact: true }).click();
  await expect(page).toHaveURL(detailUrl);
  await expect(page.getByRole('heading', { name: 'Updated Draft Applicant' })).toBeVisible();
  await page.goto('/workspace/applications');
  await expect(page.locator('tbody tr')).toHaveCount(3);
});

test('analytics tabs support arrow-key navigation', async ({ page }) => {
  await enter(page);
  await page.goto('/workspace/analytics');
  await page.getByRole('tab', { name: 'Portfolio health', exact: true }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Delinquency & PAR', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('tab', { name: 'Delinquency & PAR', exact: true })).toBeFocused();
  await page.keyboard.press('End');
  await expect(page.getByRole('tab', { name: 'Origination', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
});
