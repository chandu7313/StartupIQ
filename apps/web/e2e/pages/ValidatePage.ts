import { Page, expect } from '@playwright/test';

export class ValidatePage {
  constructor(public readonly page: Page) {}

  async goto() {
    await this.page.goto('/validate/new');
  }

  async fillStep1(name: string, problem: string, targetUsers: string, industry: string) {
    await this.page.fill('input[placeholder="e.g. FarmAI"]', name);
    await this.page.fill('textarea[placeholder="What specific problem are you solving?"]', problem);
    await this.page.fill('input[placeholder="e.g. Small-scale farmers"]', targetUsers);
    
    // Select industry
    await this.page.selectOption('select', { label: industry });
    await this.page.click('button:has-text("Next Step")');
  }

  async fillStep2(geography: string, stage: string, teamSize: string, budget: string, primarySkill: string) {
    await expect(this.page.locator('h2:has-text("Context & Details")')).toBeVisible();
    await this.page.fill('input[placeholder="e.g. India, Global"]', geography);
    
    // Select stage
    await this.page.selectOption('select', { label: stage });
    // Assuming teamSize is an input or select
    await this.page.fill('input[placeholder="e.g. 2"]', teamSize);
    await this.page.fill('input[placeholder="e.g. Under ₹5L"]', budget);
    await this.page.fill('input[placeholder="e.g. Technical, Sales"]', primarySkill);
    
    await this.page.click('button:has-text("Review Details")');
  }

  async reviewAndSubmit() {
    await expect(this.page.locator('h2:has-text("Review & Confirm")')).toBeVisible();
    await this.page.click('button:has-text("Generate full report")');
  }

  async expectRedirectToReport() {
    await this.page.waitForURL(/\/report\/.*/, { timeout: 15000 });
  }
}
