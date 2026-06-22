import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Authentication Flow', () => {
  // Use a fresh context for auth tests, do NOT use the global stored state
  test.use({ storageState: { cookies: [], origins: [] } });

  test('user can sign up with valid credentials', async ({ page }) => {
    const email = `testfounder${Date.now()}@example.com`;
    
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Sign Up")');
    
    await page.fill('input[name="name"]', 'Test Founder');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    
    await page.click('button[type="submit"]:has-text("Create Account")');
    
    const dashboard = new DashboardPage(page);
    await page.waitForURL('/dashboard');
    await dashboard.verifyWelcomeMessage('Test Founder');
  });

  test('user cannot sign up with duplicate email', async ({ page }) => {
    // Seeded user
    const email = 'alex@example.com'; 
    
    await page.goto('/auth');
    await page.click('button[role="tab"]:has-text("Sign Up")');
    
    await page.fill('input[name="name"]', 'Duplicate User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'password123');
    
    await page.click('button[type="submit"]:has-text("Create Account")');
    
    // Check for toast error
    await expect(page.locator('text=Email already in use')).toBeVisible();
  });

  test('user can sign in and sign out', async ({ page }) => {
    await page.goto('/auth');
    
    await page.fill('input[name="email"]', 'alex@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]:has-text("Sign In")');
    
    const dashboard = new DashboardPage(page);
    await page.waitForURL('/dashboard');
    await dashboard.verifyWelcomeMessage('Alex');

    await dashboard.clickAvatarAndSignOut();
    await page.waitForURL('/');
  });
});
