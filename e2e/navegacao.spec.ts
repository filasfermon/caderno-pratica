// Correção 3: as bolinhas navegam; VOLTAR, AVANÇAR e TERMINAR; pular não conta como erro.
import { test, expect } from '@playwright/test';
import { resolverAtividade } from './ajudantes';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('caderno-pratica:progresso'))
      localStorage.setItem(
        'caderno-pratica:progresso',
        JSON.stringify({ sessoes: 0, ultimaAula: null, aulas: {}, itens: {}, tiposVistos: [
          'conheca', 'escute_letra', 'diga_letra', 'escute_silaba', 'monte_silaba', 'complete_palavra', 'forme_palavra',
          'quantas_silabas', 'escute_palavra', 'escreva', 'complete_frase', 'ligue', 'leia', 'ordene', 'maiuscula',
          'conte', 'conta', 'pague', 'troco', 'da', 'hora'] }),
      );
  });
});

const indice = (page: import('@playwright/test').Page) => page.getAttribute('[data-sessao]', 'data-indice');
const itensNoProgresso = (page: import('@playwright/test').Page) =>
  page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('caderno-pratica:progresso') ?? '{}').itens ?? {}).length);

test('bolinhas, voltar, avançar, refazer e terminar', async ({ page }) => {
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  const bolinhas = page.locator('[data-bolinha]');
  const total = await bolinhas.count();
  expect(total).toBeGreaterThanOrEqual(8);

  // Acessibilidade: rótulo e área de toque de 44 × 44 px
  await expect(bolinhas.nth(2)).toHaveAttribute('aria-label', `Atividade 3 de ${total}`);
  for (let i = 0; i < total; i++) {
    const caixa = await bolinhas.nth(i).boundingBox();
    expect(caixa!.width).toBeGreaterThanOrEqual(44);
    expect(caixa!.height).toBeGreaterThanOrEqual(44);
  }
  await expect(bolinhas.nth(0)).toHaveAttribute('aria-current', 'step');
  await expect(page.locator('[data-voltar]')).toBeDisabled();

  // Pular para a frente (bolinha 4) e voltar não conta como erro nem entra no progresso
  await bolinhas.nth(3).click();
  expect(await indice(page)).toBe('3');
  await expect(bolinhas.nth(3)).toHaveAttribute('aria-current', 'step');
  await page.locator('[data-avancar]').click();
  expect(await indice(page)).toBe('4');
  await page.locator('[data-voltar]').click();
  await page.locator('[data-voltar]').click();
  expect(await indice(page)).toBe('2');
  expect(await itensNoProgresso(page)).toBe(0);

  // Responder a atividade 3 → ela fica marcada com ✓ e o app segue para a 4
  await resolverAtividade(page);
  expect(await indice(page)).toBe('3');
  await expect(bolinhas.nth(2)).toHaveAttribute('aria-label', `Atividade 3 de ${total}, feita`);
  await expect(bolinhas.nth(2)).toContainText('✓');
  expect(await itensNoProgresso(page)).toBe(1);

  // Voltar à atividade respondida: mostra a resposta dada e deixa refazer
  await bolinhas.nth(2).click();
  await expect(page.locator('.resposta-dada')).toBeVisible();
  await page.locator('[data-refazer]').click();
  await expect(page.locator('.resposta-dada')).toBeHidden();
  await resolverAtividade(page);

  // Terminar a qualquer momento: a tela final mostra só o que foi feito
  await page.locator('[data-terminar]').click();
  await expect(page.locator('[data-fim]')).toContainText('VOCÊ PRATICOU 1 ATIVIDADE.');
  await expect(page.locator('[data-fim]')).not.toContainText(/FALT/);
});
