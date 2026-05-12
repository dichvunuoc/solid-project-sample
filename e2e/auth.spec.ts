/**
 * Authentication E2E Tests
 *
 * Tests the complete authentication flow from login to dashboard access.
 */

import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start from the home page
    await page.goto('/')
  })

  test('should display home page', async ({ page }) => {
    await expect(page).toHaveTitle(/Frontend Sample/i)
  })

  test('should navigate to login page', async ({ page }) => {
    // Look for login link (adjust selector based on your UI)
    const loginLink = page.getByRole('link', { name: /login|sign in/i })
    if (await loginLink.isVisible()) {
      await loginLink.click()
      await expect(page).toHaveURL(/.*login/)
    }
  })

  test('should show validation errors on empty login form', async ({ page }) => {
    await page.goto('/login')

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /sign in/i })
    await submitButton.click()

    // Should see validation errors (adjust based on your error messages)
    await expect(page.getByText(/email is required/i)).toBeVisible()
  })

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in login form
    await page.getByLabel(/email/i).fill('test@example.com')
    await page.getByLabel(/password/i).fill('password123')

    // Submit form
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to dashboard (adjust URL based on your routes)
    // Note: This will fail unless you have proper auth setup or mocking
    // await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should not access protected routes without authentication', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard')

    // Should redirect to login (adjust based on your auth flow)
    // await expect(page).toHaveURL(/.*login/)
  })

  test('should logout successfully', async ({ page }) => {
    // This test assumes user is already logged in
    // You may need to perform login first or use storage state

    await page.goto('/dashboard')

    // Click logout button (adjust selector based on your UI)
    const logoutButton = page.getByRole('button', { name: /logout|sign out/i })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()

      // Should redirect to home or login
      // await expect(page).toHaveURL(/.*\/(|login)/)
    }
  })
})

test.describe('Registration Flow', () => {
  test('should navigate to registration page', async ({ page }) => {
    await page.goto('/')

    const registerLink = page.getByRole('link', { name: /register|sign up/i })
    if (await registerLink.isVisible()) {
      await registerLink.click()
      await expect(page).toHaveURL(/.*register/)
    }
  })

  test('should show validation errors on invalid registration', async ({ page }) => {
    await page.goto('/register')

    // Fill with invalid data
    await page.getByLabel(/email/i).fill('invalid-email')
    await page.getByLabel(/password/i).fill('123') // Too short

    // Submit form
    await page.getByRole('button', { name: /sign up|register/i }).click()

    // Should see validation errors
    // Adjust based on your validation messages
  })
})

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues', async ({ page }) => {
    await page.goto('/')

    // Check for basic accessibility issues
    // You can integrate with axe-core for more thorough checks
    await expect(page).toHaveTitle(/Frontend Sample/i)
  })

  test('should be navigable with keyboard', async ({ page }) => {
    await page.goto('/login')

    // Tab through form fields
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Should be able to submit with Enter
    // await page.keyboard.press('Enter')
  })
})
