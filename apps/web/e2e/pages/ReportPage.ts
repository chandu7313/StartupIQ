import { Page, expect } from '@playwright/test';

export class ReportPage {
  constructor(public readonly page: Page) {}

  async goto(reportId: string) {
    await this.page.goto(`/report/${reportId}`);
  }

  async verifyScoreCardsVisible() {
    await expect(this.page.locator('text=Idea Score')).toBeVisible();
    await expect(this.page.locator('text=Market Score')).toBeVisible();
    await expect(this.page.locator('text=Moat Score')).toBeVisible();
    await expect(this.page.locator('text=Risk Score')).toBeVisible();
    await expect(this.page.locator('text=Investor Score')).toBeVisible();
  }

  async clickTab(tabName: string) {
    await this.page.locator(`button[role="tab"]:has-text("${tabName}")`).click();
  }

  async verifyTabContentVisible() {
    // Assuming the tab panel has a specific role or class, we just check if any markdown prose is visible
    await expect(this.page.locator('.prose')).toBeVisible();
  }

  async clickDownloadPdf() {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      this.page.locator('button:has-text("Download PDF")').click()
    ]);
    return newPage;
  }
}
