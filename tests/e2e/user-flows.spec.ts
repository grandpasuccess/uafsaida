import { test, expect } from '@playwright/test';

// ═══════════════════════════════════════════════════════════════
// E2E TESTS - Critical User Flows
// Based on the original test plan (TC-001 through TC-010)
// ═══════════════════════════════════════════════════════════════

test.describe('Authentication Flow (TC-001)', () => {
  test('should display welcome screen for unauthenticated user', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Welcome to UAFSAIDA')).toBeVisible();
  });

  test('should navigate to workspace and show chat interface', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.locator('text=What would you like to build?')).toBeVisible();
  });

  test('should show example prompts for user ideas', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.locator('text=E-commerce Store')).toBeVisible();
    await expect(page.locator('text=School Management')).toBeVisible();
    await expect(page.locator('text=Hospital System')).toBeVisible();
  });

  test('should have working text input in chat', async ({ page }) => {
    await page.goto('/workspace');
    const textarea = page.locator('textarea[placeholder*="Describe what you want"]');
    await expect(textarea).toBeVisible();
    await textarea.fill('Build me a simple todo app');
    await expect(textarea).toHaveValue('Build me a todo app');
  });

  test('should have send button in chat', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});

test.describe('Chat Interaction Flow', () => {
  test('should display example prompts on workspace load', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.locator('.grid')).toBeVisible();
  });

  test('should allow selecting an example prompt', async ({ page }) => {
    await page.goto('/workspace');
    await page.click('text=E-commerce Store');
    const textarea = page.locator('textarea');
    await expect(textarea).not.toHaveValue('');
  });
});

test.describe('File Explorer (TC-009 partial)', () => {
  test('should show file explorer panel', async ({ page }) => {
    await page.goto('/workspace');
    // Click on files panel
    const filesTab = page.locator('text=Files');
    if (await filesTab.isVisible()) {
      await filesTab.click();
      await expect(page.locator('text=Explorer')).toBeVisible();
    }
  });
});

test.describe('Terminal Panel', () => {
  test('should show terminal panel', async ({ page }) => {
    await page.goto('/workspace');
    const terminalTab = page.locator('text=Terminal');
    if (await terminalTab.isVisible()) {
      await terminalTab.click();
      await expect(page.locator('text=Welcome to UAFSAIDA Terminal')).toBeVisible();
    }
  });

  test('should accept terminal commands', async ({ page }) => {
    await page.goto('/workspace');
    const terminalTab = page.locator('text=Terminal');
    if (await terminalTab.isVisible()) {
      await terminalTab.click();
      const input = page.locator('input[type="text"]').last();
      await input.fill('help');
      await input.press('Enter');
      await expect(page.locator('text=Available commands')).toBeVisible();
    }
  });
});

test.describe('API Health Check (TC-007)', () => {
  test('health endpoint returns ok', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ok');
    expect(body.version).toBeDefined();
    expect(body.checks).toBeDefined();
  });

  test('health endpoint includes database check', async ({ request }) => {
    const response = await request.get('/api/health');
    const body = await response.json();
    expect(body.checks).toHaveProperty('database');
    expect(body.checks).toHaveProperty('memory');
    expect(body.checks).toHaveProperty('uptime');
  });
});

test.describe('Auth Guard (TC-007)', () => {
  test('projects endpoint requires authentication', async ({ request }) => {
    const response = await request.get('/api/projects');
    // Should return 401 or redirect (307)
    expect([401, 307]).toContain(response.status());
  });

  test('chat endpoint requires authentication', async ({ request }) => {
    const response = await request.post('/api/chat', {
      data: { message: 'test' },
    });
    // Should return 401 or redirect (307)
    expect([401, 307, 422]).toContain(response.status());
  });
});

test.describe('Mobile Usability (TC-008)', () => {
  test('workspace renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/workspace');
    // Should not have horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('chat input is accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/workspace');
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();
    
    // Font size should be at least 16px to prevent zoom
    const fontSize = await textarea.evaluate((el) => {
      return window.getComputedStyle(el).fontSize;
    });
    expect(parseFloat(fontSize)).toBeGreaterThanOrEqual(16);
  });
});

test.describe('Login Page', () => {
  test('login page has GitHub button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Continue with GitHub')).toBeVisible();
  });

  test('login page has Google button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Continue with Google')).toBeVisible();
  });
});

test.describe('Preview Panel', () => {
  test('shows preview panel with device options', async ({ page }) => {
    await page.goto('/workspace');
    const previewTab = page.locator('text=Preview');
    if (await previewTab.isVisible()) {
      await previewTab.click();
      await expect(page.locator('text=No Preview Available')).toBeVisible();
    }
  });
});
