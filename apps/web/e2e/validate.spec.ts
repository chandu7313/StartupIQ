import { test, expect } from '@playwright/test';
import { ValidatePage } from './pages/ValidatePage';

test.describe('Idea Validation Wizard', () => {
  // Use global storage state (pre-authenticated)
  
  test('user can complete 3-step wizard and submit idea', async ({ page }) => {
    // Override timeout for AI generation step
    test.setTimeout(120000); 

    const validatePage = new ValidatePage(page);
    await validatePage.goto();

    await validatePage.fillStep1(
      'FarmAI Test', 
      'Lack of predictive models for small-scale farming', 
      'Small-scale farmers', 
      'AgriTech'
    );

    await validatePage.fillStep2(
      'India', 
      'Idea stage', 
      '1', 
      'Under ₹5L', 
      'Technical'
    );

    // Verify step 3 summary
    await expect(page.locator('text=FarmAI Test')).toBeVisible();
    await expect(page.locator('text=AgriTech')).toBeVisible();
    
    await validatePage.reviewAndSubmit();

    // Verify redirect and processing state
    await validatePage.expectRedirectToReport();
    await expect(page.locator('text=Generating your comprehensive StartupIQ report')).toBeVisible();
  });
});
