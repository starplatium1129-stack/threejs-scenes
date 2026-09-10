import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests', timeout: 60000, use: { channel: 'msedge', headless: true, viewport: { width: 1440, height: 1100 } }, webServer: { command: 'npm run dev -- --port 5173', url: 'http://localhost:5173', reuseExistingServer: true }, reporter: 'list' });
