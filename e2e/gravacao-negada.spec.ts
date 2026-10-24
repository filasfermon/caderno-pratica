// Correção 5: sem licença do microfone, o app avisa e nada trava.
import { test, expect } from '@playwright/test';
import { irParaDigaLetra, semDemonstracoes } from './ajudantes-gravacao';

test.describe('sem microfone', () => {
  test('microfone negado: aviso simples, TENTAR DE NOVO, e a atividade não trava', async ({ page }) => {
    await semDemonstracoes(page);
    await irParaDigaLetra(page);
    await page.locator('[data-gravar]').click();
    await expect(page.locator('.painel-gravacao')).toHaveAttribute('data-estado', 'erro', { timeout: 10_000 });
    await expect(page.locator('.aviso-gravacao')).toHaveText('PARA GRAVAR, PERMITA O USO DO MICROFONE.');
    await expect(page.locator('[data-gravar]')).toContainText('TENTAR DE NOVO');
    const antes = await page.getAttribute('[data-sessao]', 'data-indice');
    await page.locator('[data-avancar]').click();
    expect(await page.getAttribute('[data-sessao]', 'data-indice')).not.toBe(antes);
  });
});
