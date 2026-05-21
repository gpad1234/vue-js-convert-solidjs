import { test, expect } from '@playwright/test';

// E2E tests for SolidJS + Express app
// Requires backend (port 8000) and frontend (port 3000) to be running

test.describe('Diabetes EMR App', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app root
    await page.goto('http://localhost:3000');
    // Wait for app to load
    await page.waitForLoadState('networkidle');
  });

  test('should load dashboard and display stats', async ({ page }) => {
    // Dashboard should be default route
    await expect(page).toHaveURL('http://localhost:3000/');
    
    // Should display stat cards
    await expect(page.locator('text=Total Patients')).toBeVisible();
    await expect(page.locator('text=Avg HbA1c (30d)')).toBeVisible();
    await expect(page.locator('text=HbA1c > 9%')).toBeVisible();
    await expect(page.locator('text=Active Meds')).toBeVisible();
  });

  test('should navigate to patients list', async ({ page }) => {
    // Click on patients tab or navigate
    await page.goto('http://localhost:3000/patients');
    await expect(page).toHaveURL('http://localhost:3000/patients');
    
    // Should display patient list with heading
    await expect(page.locator('h1:has-text("Patients")')).toBeVisible({ timeout: 5000 });
  });

  test('should search for patient', async ({ page }) => {
    await page.goto('http://localhost:3000/patients');
    
    // Get initial patient count
    const initialCards = await page.locator('[class*=card]').count();
    
    // Type search query
    await page.fill('input[placeholder*=search i]', 'John', { timeout: 5000 });
    
    // Wait for debounce and results
    await page.waitForTimeout(500);
    
    // Results should be filtered
    const filteredCards = await page.locator('[class*=card]').count();
    expect(filteredCards).toBeLessThanOrEqual(initialCards);
  });

  test('should load patient detail view', async ({ page }) => {
    await page.goto('http://localhost:3000/patients');
    
    // Click first patient card
    await page.locator('a').first().click({ timeout: 5000 });
    
    // Should be on patient detail page
    await expect(page).toHaveURL(/\/patients\/\d+/);
    
    // Should display patient info sections
    await expect(page.locator('text=Latest Readings')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Glucose History')).toBeVisible();
  });

  test('should display glucose chart', async ({ page }) => {
    // Navigate to patient detail (use patient 1)
    await page.goto('http://localhost:3000/patients/1');
    
    // Should display glucose chart
    await expect(page.locator('canvas')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to settings', async ({ page }) => {
    // Click settings tab or navigate
    await page.goto('http://localhost:3000/settings');
    await expect(page).toHaveURL('http://localhost:3000/settings');
  });
});
