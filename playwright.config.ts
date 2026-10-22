// Teste de ponta a ponta (Playwright). Uso: npm run test:e2e
// Monta o app (npm run build), abre um servidor local e roda os testes em e2e/.
import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// Neste ambiente o Chromium já vem instalado em /opt/pw-browsers; em outros, use "npx playwright install chromium".
const chromiumLocal = '/opt/pw-browsers/chromium';

export default defineConfig({
  testDir: 'e2e',
  timeout: 240_000,
  expect: { timeout: 15_000 },
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173/',
    ...devices['Pixel 5'],
    viewport: { width: 360, height: 640 },
    launchOptions: existsSync(chromiumLocal) ? { executablePath: chromiumLocal } : {},
    serviceWorkers: 'allow',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
