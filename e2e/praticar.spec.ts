// Ouça e fale (sem gravação), MAIS DEVAGAR (tartaruga) e erros que voltam no fim da mesma prática.
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { pularDemonstracao, resolverAtividade } from './ajudantes';
import { usarVozDeTeste, falasDaPagina, tocadosDaPagina } from './vozes-de-teste';

const tipoAtual = (page: Page) => page.getAttribute('[data-sessao]', 'data-tipo');
const indiceAtual = (page: Page) => page.getAttribute('[data-sessao]', 'data-indice');

/** Toca nas bolinhas até achar uma atividade de um destes tipos. */
async function irAteTipo(page: Page, tipos: string[]): Promise<void> {
  const total = await page.locator('[data-bolinha]').count();
  for (let i = 0; i < total; i++) {
    if (i > 0) await page.locator(`[data-bolinha="${i}"]`).click();
    await pularDemonstracao(page);
    if (tipos.includes((await tipoAtual(page)) ?? '')) return;
  }
  throw new Error(`nenhuma atividade ${tipos.join('/')} nesta prática`);
}

// A lista de áudios prontos é servida pelo teste (o service worker fica de fora).
test.use({ serviceWorkers: 'block' });
test.beforeEach(async ({ page }) => usarVozDeTeste(page));

test('Ouça e fale: o modelo, AGORA FALE VOCÊ (cerca de 3 s, sem números), o modelo de novo, e SEGUIR', async ({ page }) => {
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  await irAteTipo(page, ['ouca_fale']);
  const aviso = page.locator('.area [data-fale-voce]');
  await expect(aviso).toBeVisible({ timeout: 10_000 });
  await expect(aviso).toHaveText('AGORA FALE VOCÊ');
  await expect(aviso).not.toHaveText(/\d/);
  await expect(page.locator('.area [data-seguir]')).toBeVisible({ timeout: 10_000 });
  await expect(aviso).toBeHidden();
  // O modelo foi falado duas vezes, com a pausa para o estudante no meio.
  const modelo = ((await page.locator('.area .tocavel').first().textContent()) ?? '').trim();
  const falas = (await falasDaPagina(page)).filter((f) => f.texto === 'éle' || f.texto === modelo.toLowerCase());
  expect(falas.length, JSON.stringify(falas)).toBeGreaterThanOrEqual(2);
  const [a, b] = falas.slice(-2);
  expect(b.inicio - a.fim!).toBeGreaterThanOrEqual(2700);
  expect(b.inicio - a.fim!).toBeLessThanOrEqual(3800);
  await expect(page.getByRole('button', { name: /OUVIR DE NOVO/ })).toBeVisible();
  // Nada de gravar
  await expect(page.getByText(/GRAVAR|MICROFONE/)).toHaveCount(0);
  const antes = Number(await indiceAtual(page));
  await page.locator('.area [data-seguir]').click();
  await expect.poll(async () => Number(await indiceAtual(page))).toBe(antes + 1);
});

test('MAIS DEVAGAR: a tartaruga toca a mesma fala uma vez a 0,8 (voz do celular e áudio pronto)', async ({ page }) => {
  // Áudio pronto para as sílabas do L (servido pelo teste, sem o service worker).
  await page.route('**/audio/lista.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(['silabas/la.mp3', 'silabas/le.mp3', 'silabas/li.mp3', 'silabas/lo.mp3', 'silabas/lu.mp3']) }));
  const som = readFileSync(new URL('./arquivos/som-de-teste.mp3', import.meta.url));
  await page.route(/\/audio\/silabas\/[^/]+\.mp3$/, (r) => r.fulfill({ contentType: 'audio/mpeg', body: som }));

  // Tela inicial: alto-falante a 1,0; tartaruga a 0,8
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ESCOLHER A AULA' })).toBeVisible();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Ouvir de novo' }).click();
  await page.waitForTimeout(300);
  await page.getByRole('button', { name: 'Mais devagar' }).click();
  await page.waitForTimeout(300);
  const falas = await falasDaPagina(page);
  expect(falas.at(-1)!.rate).toBe(0.8);
  expect(falas.at(-2)!.rate).toBe(1);
  expect(falas.at(-1)!.texto).toBe(falas.at(-2)!.texto);

  // Numa atividade com áudio pronto: OUVIR DE NOVO na velocidade do arquivo; tartaruga a 0,8
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  await irAteTipo(page, ['escute_silaba']);
  await page.waitForTimeout(600);
  const area = page.locator('.area');
  await area.getByRole('button', { name: /OUVIR DE NOVO/ }).click();
  await page.waitForTimeout(400);
  await area.getByRole('button', { name: 'Mais devagar' }).click();
  await page.waitForTimeout(400);
  const tocados = await tocadosDaPagina(page);
  expect(tocados.length).toBeGreaterThanOrEqual(2);
  expect(tocados.at(-2)!.rate).toBe(1);
  expect(tocados.at(-1)!.rate).toBe(0.8);
  // Não é uma configuração: o próximo OUVIR DE NOVO volta ao normal
  await area.getByRole('button', { name: /OUVIR DE NOVO/ }).click();
  await page.waitForTimeout(400);
  expect((await tocadosDaPagina(page)).at(-1)!.rate).toBe(1);
});

test('erro volta uma vez no fim da mesma prática; pular não conta', async ({ page }) => {
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  await pularDemonstracao(page);
  const bolinhas = page.locator('[data-bolinha]');
  const total = await bolinhas.count();
  // Pular duas atividades não muda nada
  await bolinhas.nth(2).click();
  await pularDemonstracao(page);
  await bolinhas.nth(0).click();
  await pularDemonstracao(page);
  expect(await bolinhas.count()).toBe(total);
  // Errar duas vezes numa escolha: a resposta aparece e a atividade volta no fim
  await irAteTipo(page, ['escute_letra', 'escute_silaba', 'escute_palavra', 'complete_palavra', 'quantas_silabas']);
  const tipo = await tipoAtual(page);
  await page.waitForTimeout(300);
  await page.locator('.area [data-certo="nao"]:not([disabled])').first().click();
  await page.waitForTimeout(1200);
  await page.locator('.area [data-certo="nao"]:not([disabled])').first().click();
  await expect(bolinhas).toHaveCount(total + 1, { timeout: 15_000 });
  await expect(bolinhas.last()).toHaveAttribute('aria-label', `Atividade ${total + 1} de ${total + 1}`);
  // A atividade que voltou: mesmo tipo, com o selo DE NOVO
  await bolinhas.last().click();
  await pularDemonstracao(page);
  expect(await tipoAtual(page)).toBe(tipo);
  await expect(page.locator('[data-de-novo]')).toBeVisible();
  // Acertar na volta (ou errar de novo) não faz voltar outra vez
  await resolverAtividade(page);
  await expect(page.locator('[data-fim]')).toBeVisible();
  await expect(page.locator('[data-fim]')).toContainText(/VOCÊ PRATICOU 2 ATIVIDADES/);
});
