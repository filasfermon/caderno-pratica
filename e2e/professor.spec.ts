// Modo professor: cria o PIN, grava um áudio (microfone simulado), exporta o pacote .zip
// e importa o pacote em outro "celular" (outro navegador limpo).
import { test, expect, chromium } from '@playwright/test';
import { existsSync } from 'node:fs';

const chromiumLocal = '/opt/pw-browsers/chromium';
test.use({
  permissions: ['microphone'],
  launchOptions: {
    ...(existsSync(chromiumLocal) ? { executablePath: chromiumLocal } : {}),
    args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  },
});

test('professor grava, exporta e o estudante importa o pacote', async ({ page, baseURL }, testInfo) => {
  await page.goto('/#/professor');
  await page.locator('#pin1').fill('2468');
  await page.locator('#pin2').fill('2468');
  await page.getByRole('button', { name: /ENTRAR/ }).click();
  await expect(page.getByRole('heading', { name: 'MODO PROFESSOR' })).toBeVisible();

  // Gravar a sílaba LA da aula 23
  await page.goto('/#/professor/gravacoes/23/silaba');
  const item = page.locator('.item-gravacao', { has: page.locator('.texto', { hasText: /^LA$/ }) });
  await expect(item).toBeVisible();
  await expect(item.locator('.origem')).toHaveText('VOZ DO APARELHO');
  await expect(item.locator('.fala')).toContainText('lá');
  await item.getByRole('button', { name: 'GRAVAR' }).click();
  await page.waitForTimeout(1200);
  await item.getByRole('button', { name: 'PARAR' }).click();
  await expect(item.locator('.origem')).toHaveText('SUA GRAVAÇÃO');

  // Corrigir o texto falado de outro item
  const le = page.locator('.item-gravacao', { has: page.locator('.texto', { hasText: /^LE$/ }) });
  await le.getByRole('button', { name: 'EDITAR FALA' }).click();
  await le.locator('input[type=text]').fill('lê');
  await le.getByRole('button', { name: 'SALVAR' }).click();
  await expect(le.locator('.fala')).toContainText('"lê"');

  // Exportar o pacote .zip
  await page.goto('/#/professor/pacote');
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: /EXPORTAR/ }).click()]);
  expect(download.suggestedFilename()).toMatch(/^caderno-pratica-audios-.*\.zip$/);
  const caminho = testInfo.outputPath('pacote.zip');
  await download.saveAs(caminho);
  await expect(page.getByText(/PACOTE PRONTO: 1 ÁUDIO\./)).toBeVisible();

  // "Celular do estudante": navegador novo, sem nada gravado
  const outro = await chromium.launch(existsSync(chromiumLocal) ? { executablePath: chromiumLocal } : {});
  const pagina = await (await outro.newContext({ baseURL })).newPage();
  await pagina.goto('/#/professor');
  await pagina.locator('#pin1').fill('1357');
  await pagina.locator('#pin2').fill('1357');
  await pagina.getByRole('button', { name: /ENTRAR/ }).click();
  await pagina.goto('/#/professor/pacote');
  await pagina.locator('#arquivo-pacote').setInputFiles(caminho);
  await expect(pagina.getByText(/PACOTE IMPORTADO: 1 ÁUDIO E 1 CORREÇÃO/)).toBeVisible();
  await pagina.goto('/#/professor/gravacoes/23/silaba');
  const doPacote = pagina.locator('.item-gravacao', { has: pagina.locator('.texto', { hasText: /^LA$/ }) });
  await expect(doPacote.locator('.origem')).toHaveText('DO PACOTE');
  const corrigido = pagina.locator('.item-gravacao', { has: pagina.locator('.texto', { hasText: /^LE$/ }) });
  await expect(corrigido.locator('.fala')).toContainText('"lê"');
  await outro.close();
});
