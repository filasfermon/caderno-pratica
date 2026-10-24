// Letras e sílabas: primeiro o áudio pronto (public/audio); se faltar ou falhar, a voz do celular.
// Palavras e frases: sempre a voz do celular.
import { test, expect, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolverAtividade, pularDemonstracao } from './ajudantes';
import { usarVozDeTeste, falasDaPagina } from './vozes-de-teste';

// A lista e os arquivos são servidos pelo teste (o service worker fica de fora para isso).
test.use({ serviceWorkers: 'block' });

const som = readFileSync(new URL('./arquivos/som-de-teste.mp3', import.meta.url));
// Aula 23 (L): sílabas da família do L e as letras.
const SILABAS = ['LA', 'LE', 'LI', 'LO', 'LU'];
const tabela = JSON.parse(readFileSync(new URL('../src/dados/pronuncia.json', import.meta.url), 'utf8')) as { silabas: Record<string, string | { aberta: string }> };
const FALAS = SILABAS.map((s) => {
  const e = tabela.silabas[s];
  return typeof e === 'string' ? e : e.aberta; // vogal aberta (src/config/padroes.ts)
});
const LISTA = [...SILABAS.map((s) => `silabas/${s.toLowerCase()}.mp3`), 'letras/l.mp3'];

async function servir(page: Page, arquivoFunciona: boolean): Promise<string[]> {
  const pedidos: string[] = [];
  await page.route('**/audio/lista.json', (r) => r.fulfill({ contentType: 'application/json', body: JSON.stringify(LISTA) }));
  await page.route(/\/audio\/(letras|silabas)\/[^/]+\.mp3$/, (r) => {
    pedidos.push(new URL(r.request().url()).pathname.replace(/.*\/audio\//, ''));
    return arquivoFunciona ? r.fulfill({ contentType: 'audio/mpeg', body: som }) : r.fulfill({ status: 404, body: '' });
  });
  return pedidos;
}

async function praticarAte(page: Page, tipos: string[]): Promise<void> {
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  for (let i = 0; i < 12; i++) {
    await page.waitForSelector('[data-sessao], [data-fim]');
    if (await page.locator('[data-fim]').count()) return;
    await pularDemonstracao(page);
    const tipo = await page.getAttribute('[data-sessao]', 'data-tipo');
    await page.waitForTimeout(500); // deixa o modelo tocar
    if (tipos.includes(tipo ?? '')) return;
    await resolverAtividade(page);
  }
}

test('sílaba com áudio pronto: toca o arquivo, e a voz do celular não lê a sílaba', async ({ page }) => {
  await usarVozDeTeste(page);
  const pedidos = await servir(page, true);
  await praticarAte(page, ['escute_silaba']);
  await expect(page.locator('[data-sessao][data-tipo="escute_silaba"]')).toBeVisible();
  await page.getByRole('button', { name: /OUVIR DE NOVO/ }).first().click();
  await page.waitForTimeout(400);
  expect(pedidos.some((p) => p.startsWith('silabas/l'))).toBe(true);
  const ditas = (await falasDaPagina(page)).map((f) => f.texto);
  for (const f of FALAS) expect(ditas, `a voz do celular leu "${f}"`).not.toContain(f);
  // Palavras e frases continuam com a voz do celular (instruções e retornos também).
  expect(ditas.length).toBeGreaterThan(0);
});

test('áudio pronto que falha: a voz do celular fala a sílaba no lugar', async ({ page }) => {
  await usarVozDeTeste(page);
  const pedidos = await servir(page, false);
  await praticarAte(page, ['escute_silaba']);
  await expect(page.locator('[data-sessao][data-tipo="escute_silaba"]')).toBeVisible();
  await page.waitForTimeout(400);
  expect(pedidos.length).toBeGreaterThan(0);
  const ditas = (await falasDaPagina(page)).map((f) => f.texto);
  expect(ditas.some((t) => FALAS.includes(t)), ditas.join(' | ')).toBe(true);
});
