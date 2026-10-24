// Correção 4: qualquer aula abre livremente, sem precisar concluir as anteriores.
import { test, expect } from '@playwright/test';

test('aulas avançadas abrem com o progresso vazio; SÓ ESTA AULA é o padrão', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/#/escolher');
  // A Parte 1 (caligrafia) não aparece; as outras partes, sim.
  await expect(page.locator('a[href="#/escolher/parte/1"]')).toHaveCount(0);
  for (const parte of [2, 3, 4, 5, 6]) await expect(page.locator(`a[href="#/escolher/parte/${parte}"]`)).toBeVisible();

  // A aula mais avançada com atividades abre direto
  await page.locator('a[href="#/escolher/parte/6"]').click();
  await page.locator('a[href="#/escolher/unidade/18"]').click();
  await page.locator('a[href="#/aula/149"]').click();
  const botoes = page.locator('.abertura .pilha .botao');
  await expect(botoes.nth(0)).toHaveText(/SÓ ESTA AULA/);
  await expect(botoes.nth(0)).toHaveClass(/principal/);
  await expect(botoes.nth(1)).toHaveText(/ESTA AULA \+ REVISÃO/);

  // SÓ ESTA AULA: nenhuma atividade de revisão
  await page.locator('[data-comecar]').click();
  await expect(page.locator('[data-sessao]')).toBeVisible();
  const n = await page.locator('[data-bolinha]').count();
  for (let i = 0; i < n; i++) {
    await page.locator(`[data-bolinha="${i}"]`).click();
    await expect(page.locator('.selo-revisao')).toBeHidden();
  }

  // ESTA AULA + REVISÃO também abre, em qualquer aula (busca pelo número)
  await page.goto('/#/escolher');
  await page.locator('#busca-aula').fill('135');
  await page.getByRole('button', { name: 'IR', exact: true }).click();
  await page.locator('[data-comecar-revisao]').click();
  await expect(page.locator('[data-sessao]')).toBeVisible();
  // Aula da Parte 1 pelo número: avisa que é só no caderno (não há trava, só não há atividades)
  await page.goto('/#/aula/3');
  await expect(page.locator('[data-aula-indisponivel]')).toBeVisible();
});
