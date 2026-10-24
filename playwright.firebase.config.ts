// Testes da conta Google (Correção 6), com os emuladores do Firebase (Auth e Firestore).
// Uso: npm run test:e2e:firebase  (liga os emuladores, monta o app ligado a eles e roda e2e-firebase/).
// Precisa de Java 11 ou mais novo (os emuladores do Firebase rodam em Java).
import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

const chromiumLocal = '/opt/pw-browsers/chromium';

// Projeto de demonstração: "demo-..." nunca fala com o Firebase de verdade.
const ambiente = [
  'VITE_FIREBASE_API_KEY=demo-chave',
  'VITE_FIREBASE_AUTH_DOMAIN=localhost',
  'VITE_FIREBASE_PROJECT_ID=demo-caderno',
  'VITE_FIREBASE_APP_ID=1:1:web:1',
  'VITE_FIREBASE_EMULADOR=127.0.0.1',
].join(' ');

export default defineConfig({
  testDir: 'e2e-firebase',
  timeout: 180_000,
  expect: { timeout: 20_000 },
  reporter: [['list']],
  workers: 1,
  use: {
    baseURL: 'http://localhost:4174/',
    ...devices['Pixel 5'],
    viewport: { width: 360, height: 640 },
    launchOptions: existsSync(chromiumLocal) ? { executablePath: chromiumLocal } : {},
    serviceWorkers: 'allow',
  },
  webServer: {
    command: `${ambiente} npx vite build --outDir dist-firebase --emptyOutDir && npx vite preview --outDir dist-firebase --port 4174 --strictPort`,
    url: 'http://localhost:4174/',
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
