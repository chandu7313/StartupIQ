import { test as setup, expect } from '@playwright/test';
import * as path from 'path';

const authFile = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Use seeded credentials from packages/db/prisma/seed.ts
  const email = 'alex@example.com';
  const password = 'password123';

  await page.goto('/auth');
  
  // Fill sign in form
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await page.waitForURL('/dashboard');
  
  // Save state
  await page.context().storageState({ path: authFile });
});
