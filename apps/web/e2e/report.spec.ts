import { test, expect } from '@playwright/test';
import { ReportPage } from './pages/ReportPage';

test.describe('Completed Report Page', () => {
  // Use global storage state (pre-authenticated)
  
  // Hardcoded CUID of a seeded report for testing.
  // In a real environment, you'd fetch this dynamically or use a known seeded state.
  const seededReportId = 'clxw8z7u00002y6l1b2c3d4e5'; 
  const otherUserReportId = 'clxw8z7u00003y6l1b2c3d4e6';

  test('completed report shows all 8 tabs and score cards', async ({ page }) => {
    const reportPage = new ReportPage(page);
    await reportPage.goto(seededReportId);

    await reportPage.verifyScoreCardsVisible();

    const tabs = [
      'Market', 'Competitors', 'Risks', 'Monetization', 
      'MVP Roadmap', 'GTM', 'Investor Score', 'Pitch Deck'
    ];

    for (const tab of tabs) {
      await reportPage.clickTab(tab);
      await reportPage.verifyTabContentVisible();
    }
  });

  test('user can download PDF of completed report', async ({ page }) => {
    const reportPage = new ReportPage(page);
    await reportPage.goto(seededReportId);

    const pdfPage = await reportPage.clickDownloadPdf();
    
    // Check if the URL of the new tab contains .pdf or the S3/export domain
    expect(pdfPage.url()).toMatch(/\.pdf|amazonaws\.com\/exports/i);
    await pdfPage.close();
  });

  test('user cannot view another user report', async ({ page }) => {
    await page.goto(`/report/${otherUserReportId}`);

    // Expect a 403 Forbidden page or redirect to dashboard
    // Depending on the app's error handling for 403s on pages
    await expect(page.locator('text=Not Found').or(page.locator('text=Forbidden'))).toBeVisible();
  });
});
