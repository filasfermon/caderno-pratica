// Abre o app, escolhe a aula 23, faz uma sessão inteira e confere que tudo funciona SEM INTERNET.
import { test, expect } from '@playwright/test';
import { fazerSessao } from './ajudantes';

test('aula 23 completa, sem internet', async ({ page, context }) => {
  // 1) Primeira visita (com internet): o service worker guarda o app no aparelho.
  await page.goto('/');
  await expect(page.locator('[data-continuar]')).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30_000 });

  // 2) Sem internet a partir daqui.
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('[data-continuar]')).toBeVisible();
  expect(await page.evaluate(() => navigator.onLine)).toBe(false);

  // 3) Escolher a aula 23 pelo caminho Parte → Unidade → Aula.
  await page.getByRole('link', { name: /ESCOLHER A AULA/ }).click();
  await page.locator('a[href="#/escolher/parte/3"]').click();
  await page.locator('a[href="#/escolher/unidade/5"]').click();
  await page.locator('a[href="#/aula/23"]').click();
  await expect(page.getByText('AULA 23').first()).toBeVisible();
  await expect(page.getByText('PÁGINA 51')).toBeVisible();

  // 4) Sessão inteira.
  await page.locator('[data-comecar]').click();
  const bolinhas = await page.locator('.bolinhas li').count();
  expect(bolinhas).toBeGreaterThanOrEqual(8);
  expect(bolinhas).toBeLessThanOrEqual(12);
  const feitos = await fazerSessao(page);
  expect(feitos.length).toBe(bolinhas);

  // 5) Tela final: incentivo, sem contar erros.
  await expect(page.locator('[data-fim]')).toContainText(`VOCÊ PRATICOU ${bolinhas} ATIVIDADES`);
  await expect(page.locator('body')).not.toContainText(/ERROU|ERRADO/);
  await expect(page.getByRole('button', { name: 'PRATICAR DE NOVO' })).toBeVisible();
  await expect(page.getByRole('link', { name: /VOLTAR/ })).toBeVisible();

  // 6) A busca pelo número também funciona sem internet, e o progresso registra a aula.
  await page.goto('/#/escolher');
  await page.locator('#busca-aula').fill('23');
  await page.getByRole('button', { name: 'IR', exact: true }).click();
  await expect(page.locator('[data-comecar]')).toBeVisible();
  await page.goto('/#/progresso');
  await expect(page.getByText(/AULA 23/).first()).toBeVisible();
  await expect(page.getByText(/PRATICADA 1 VEZ/)).toBeVisible();
});
