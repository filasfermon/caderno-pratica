// As bolinhas navegam; VOLTAR, AVANÇAR e TERMINAR; pular não conta como erro.
import { test, expect } from '@playwright/test';
import { pularDemonstracao, resolverAtividade } from './ajudantes';

const indice = (page: import('@playwright/test').Page) => page.getAttribute('[data-sessao]', 'data-indice');

test('bolinhas, voltar, avançar, refazer e terminar', async ({ page }) => {
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  await pularDemonstracao(page);
  const bolinhas = page.locator('[data-bolinha]');
  // Cada tipo novo começa com uma demonstração (PULAR encerra).
  const tocar = async (alvo: import('@playwright/test').Locator) => {
    await alvo.click();
    await pularDemonstracao(page);
  };
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

  // Pular para a frente (bolinha 4) e voltar não conta como erro
  await tocar(bolinhas.nth(3));
  expect(await indice(page)).toBe('3');
  await expect(bolinhas.nth(3)).toHaveAttribute('aria-current', 'step');
  await tocar(page.locator('[data-avancar]'));
  expect(await indice(page)).toBe('4');
  await tocar(page.locator('[data-voltar]'));
  await tocar(page.locator('[data-voltar]'));
  expect(await indice(page)).toBe('2');

  // Responder uma atividade que tem resposta (as de só ouvir/falar não mostram resposta dada).
  // A ordem das atividades é sorteada: procura a primeira, a partir da 3.
  const SO_OUVIR = ['conheca', 'leia', 'ouca_fale'];
  let k = 2;
  await tocar(bolinhas.nth(k));
  while (SO_OUVIR.includes((await page.getAttribute('[data-sessao]', 'data-tipo')) ?? '')) await tocar(bolinhas.nth(++k));
  expect(await indice(page)).toBe(String(k));
  // Respondida → fica marcada com ✓ e o app segue para a próxima
  await resolverAtividade(page);
  expect(await indice(page)).toBe(String(k + 1));
  await expect(bolinhas.nth(k)).toHaveAttribute('aria-label', `Atividade ${k + 1} de ${total}, feita`);
  await expect(bolinhas.nth(k)).toContainText('✓');

  // Voltar à atividade respondida: mostra a resposta dada e deixa refazer
  await bolinhas.nth(k).click();
  await expect(page.locator('.resposta-dada')).toBeVisible();
  await page.locator('[data-refazer]').click();
  await expect(page.locator('.resposta-dada')).toBeHidden();
  await resolverAtividade(page);

  // Terminar a qualquer momento: a tela final mostra só o que foi feito
  await page.locator('[data-terminar]').click();
  await expect(page.locator('[data-fim]')).toContainText('VOCÊ PRATICOU 1 ATIVIDADE.');
  await expect(page.locator('[data-fim]')).not.toContainText(/FALT/);
});
