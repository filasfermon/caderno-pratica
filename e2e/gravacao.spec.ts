// Correção 5: gravação e reprodução da voz confiáveis (microfone simulado do Chromium).
import { test, expect } from '@playwright/test';
import { gravacaoSalva, irParaDigaLetra, semDemonstracoes } from './ajudantes-gravacao';
import { existsSync } from 'node:fs';

const chromiumLocal = '/opt/pw-browsers/chromium';
test.use({
  permissions: ['microphone'],
  launchOptions: {
    ...(existsSync(chromiumLocal) ? { executablePath: chromiumLocal } : {}),
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});

test.describe('com microfone (simulado)', () => {
  test('gravar, parar, salvar e tocar na hora', async ({ page }) => {
    await semDemonstracoes(page);
    await irParaDigaLetra(page);
    const painel = page.locator('.painel-gravacao');
    await expect(painel).toHaveAttribute('data-estado', 'parado');
    await page.locator('[data-gravar]').click();
    await expect(painel).toHaveAttribute('data-estado', 'gravando');
    // Durante a gravação: PARAR vermelho, ponto piscando e contador de segundos
    await expect(page.locator('[data-gravar]')).toHaveClass(/gravando/);
    await expect(page.locator('.ponto-gravando')).toBeVisible();
    await expect(page.locator('[data-contador]')).toHaveText('0:02', { timeout: 5000 });
    await page.locator('[data-gravar]').click(); // PARAR
    await expect(painel).toHaveAttribute('data-estado', 'pronto', { timeout: 10_000 });
    await expect(painel).toHaveAttribute('data-salvo', 'sim');
    await expect(painel).toHaveAttribute('data-tocou', 'sim', { timeout: 10_000 });
    await expect(page.locator('[data-ouvir-gravacao]')).toBeEnabled();
    const g = await gravacaoSalva(page);
    expect(g).not.toBeNull();
    expect(g!.tamanho).toBeGreaterThan(0);
    expect(g!.duracao).toBeGreaterThan(0.5);
    expect(g!.mime).toMatch(/^audio\/webm/); // Chromium: o primeiro formato da lista
    // Ouvir de novo toca de novo
    await page.evaluate(() => document.querySelector<HTMLElement>('.painel-gravacao')!.removeAttribute('data-tocou'));
    await page.locator('[data-ouvir-gravacao]').click();
    await expect(painel).toHaveAttribute('data-tocou', 'sim');
    // A atividade conta como feita depois de gravar
    await expect(page.locator('[data-sessao]')).toHaveAttribute('data-feita', 'sim');
  });

  test('para sozinho em 15 segundos', async ({ page }) => {
    test.setTimeout(60_000);
    await semDemonstracoes(page);
    await irParaDigaLetra(page);
    await page.locator('[data-gravar]').click();
    await expect(page.locator('.painel-gravacao')).toHaveAttribute('data-estado', 'gravando');
    await expect(page.locator('.painel-gravacao')).toHaveAttribute('data-estado', 'pronto', { timeout: 25_000 });
    const g = await gravacaoSalva(page);
    expect(g!.duracao).toBeGreaterThan(12);
    expect(g!.duracao).toBeLessThan(17);
  });
});

