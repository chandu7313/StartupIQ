import { Page, expect } from '@playwright/test';

export class DashboardPage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('/dashboard');
  }

  async verifyWelcomeMessage(name: string) {
    await expect(this.page.locator('text=Good morning, ' + name)).toBeVisible();
  }

  async clickAvatarAndSignOut() {
    // Assuming avatar/user menu has a "Log Out" button in the sidebar
    await this.page.locator('button:has-text("Log Out")').click();
  }
}
