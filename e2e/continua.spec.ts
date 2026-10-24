// O que continua igual: tela inicial só com ESCOLHER A AULA (letras grandes), a demonstração
// do primeiro item de cada tipo e o retorno gentil ao erro.
// (Também continuam, em outros testes: lista de exclusão e acesso livre → acesso.spec.ts;
// voz natural → voz.spec.ts; bolinhas, VOLTAR, AVANÇAR e TERMINAR → navegacao.spec.ts;
// sem internet → aula23.spec.ts.)
import { test, expect } from '@playwright/test';
import { usarVozDeTeste, falasDaPagina } from './vozes-de-teste';

test.beforeEach(async ({ page }) => usarVozDeTeste(page));

test('tela inicial: só ESCOLHER A AULA, em letras grandes, com as partes e a busca', async ({ page }) => {
  await page.goto('/');
  const titulo = page.getByRole('heading', { level: 1, name: 'ESCOLHER A AULA' });
  await expect(titulo).toBeVisible();
  const tamanho = await titulo.evaluate((h) => parseFloat(getComputedStyle(h).fontSize));
  expect(tamanho).toBeGreaterThanOrEqual(32);
  await expect(page.locator('#busca-aula')).toBeVisible();
  await expect(page.locator('a[href="#/escolher/parte/2"]')).toBeVisible();
  // Nada de conta, progresso ou professor
  await expect(page.getByText(/CONTINUAR|MEU PROGRESSO|PROFESSOR|ENTRAR|CONTA/)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Professor' })).toHaveCount(0);
});

test('demonstração no primeiro item de um tipo e retorno gentil ao erro', async ({ page }) => {
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  // 1º item: demonstração ("VEJA COMO SE FAZ"), com PULAR
  await expect(page.locator('.demonstracao-faixa')).toBeVisible();
  await expect(page.locator('.demonstracao-faixa')).toContainText('VEJA COMO SE FAZ');
  await page.waitForFunction(() => !document.querySelector('[data-sessao][data-demo]'), null, { timeout: 60_000 });
  expect((await falasDaPagina(page)).map((f) => f.texto)).toContain('Veja como se faz.');

  // Procura uma atividade de escolher e erra: "Vamos tentar de novo." (nunca "errado")
  const total = await page.locator('[data-bolinha]').count();
  for (let i = 0; i < total; i++) {
    if (i > 0) await page.locator(`[data-bolinha="${i}"]`).click();
    await page.waitForTimeout(150);
    if (await page.locator('[data-sessao][data-demo]').count()) await page.locator('[data-pular-demo]').click();
    await page.waitForFunction(() => !document.querySelector('[data-sessao][data-demo]'));
    if (await page.locator('.area [data-certo="nao"]').count()) break;
  }
  await page.waitForTimeout(300);
  await page.locator('.area [data-certo="nao"]:not([disabled])').first().click();
  await expect(page.locator('.mensagem-retorno')).toHaveText('VAMOS TENTAR DE NOVO.');
  await expect.poll(async () => (await falasDaPagina(page)).map((f) => f.texto)).toContain('Vamos tentar de novo.');
  await page.waitForTimeout(800);
  await page.locator('.area [data-certo="nao"]:not([disabled])').first().click();
  await expect(page.locator('.mensagem-retorno')).toHaveText('OLHE A RESPOSTA CERTA.');
  await expect(page.locator('body')).not.toContainText(/ERROU|ERRADO|INCORRETO/);
});
