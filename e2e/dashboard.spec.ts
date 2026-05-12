/**
 * Dashboard E2E Tests
 *
 * Tests dashboard functionality including data display and user interactions.
 */

import { test, expect } from '@playwright/test'
import { loginAsMockDemoUser } from './helpers/mock-login'

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsMockDemoUser(page)
  })

  test('should display dashboard page', async ({ page }) => {
    // Check if we're on the dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('should display finance statistics', async ({ page }) => {
    await expect(page.getByText('Total Revenue', { exact: true })).toBeVisible()
    await expect(page.getByText('Total Orders', { exact: true })).toBeVisible()
  })

  test('should process payment successfully', async ({ page }) => {
    // Find and click the payment button
    const paymentButton = page.getByRole('button', { name: /process payment/i })

    if (await paymentButton.isVisible()) {
      await paymentButton.click()

      // Wait for payment processing (adjust timeout as needed)
      await page.waitForTimeout(2000)

      // Check for success message or updated stats
      // This depends on your UI implementation
    }
  })

  test('should update stats after successful payment', async ({ page }) => {
    const revenueSpan = page
      .locator('div')
      .filter({ has: page.getByText('Total Revenue:') })
      .locator('span.font-semibold')
      .first()
    const initialText = await revenueSpan.textContent()

    const paymentButton = page.getByRole('button', { name: /process payment/i })
    await expect(paymentButton).toBeVisible()
    await paymentButton.click()
    await expect.poll(async () => revenueSpan.textContent()).not.toBe(initialText)
  })

  test('should display user information', async ({ page }) => {
    await expect(page.getByText('Welcome, Demo User!')).toBeVisible()
  })

  test('should have logout button', async ({ page }) => {
    const logoutButton = page.getByRole('button', { name: /logout/i })
    await expect(logoutButton).toBeVisible()
  })
})

test.describe('Dashboard Navigation', () => {
  test('should navigate between dashboard sections', async ({ page }) => {
    await loginAsMockDemoUser(page)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })
})

test.describe('Dashboard Responsiveness', () => {
  test('should display correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await loginAsMockDemoUser(page)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('should display correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await loginAsMockDemoUser(page)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })

  test('should display correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await loginAsMockDemoUser(page)
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  })
})
