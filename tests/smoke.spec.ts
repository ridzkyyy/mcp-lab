import { test, expect } from '@playwright/test'

test('landing renders the hero before connecting', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'MCP Lab' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Connect to an MCP server' })).toBeVisible()
})

test('example session: connect, pick a tool, run it, read the result', async ({ page }) => {
  await page.goto('/')

  // Connect to the built-in example server — no network required.
  await page.getByRole('button', { name: 'Try example' }).click()

  // The tools list should populate.
  await expect(page.getByRole('button', { name: /^echo/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^add/ })).toBeVisible()

  // Select the "add" tool and run it with arguments.
  await page.getByRole('button', { name: /^add/ }).click()
  await expect(page.getByRole('heading', { name: 'add' })).toBeVisible()

  const numbers = page.locator('input[type="number"]')
  await numbers.nth(0).fill('2')
  await numbers.nth(1).fill('3')
  await page.getByRole('button', { name: 'Run tool' }).click()

  // The formatted result should contain the computed sum.
  await expect(page.getByText('"sum": 5')).toBeVisible()
})

test('captures a screenshot of the working app', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Try example' }).click()
  await page.getByRole('button', { name: /^get_forecast/ }).click()
  await page.locator('input[type="text"]').first().fill('Jakarta')
  await page.getByRole('button', { name: 'Run tool' }).click()
  await expect(page.getByText(/"city": "Jakarta"/)).toBeVisible()
  await page.screenshot({ path: 'docs/screenshot.png' })
})
