// Correção 6: ENTRAR COM GOOGLE e ENTRAR SEM CONTA, com os emuladores do Firebase.
// O teste escolhe a conta Google simulada (window.__contaGoogleDeTeste); o emulador do
// Auth aceita essa credencial. O progresso vai para o emulador do Firestore (users/{uid}).
import { test, expect, type BrowserContext, type Page } from '@playwright/test';
import { resolverAtividade } from '../e2e/ajudantes';

const FIRESTORE = 'http://127.0.0.1:8080/v1/projects/demo-caderno/databases/(default)/documents';
const AUTH = 'http://127.0.0.1:9099';

interface DocUsuario {
  sessoes: number;
  itens: number;
  aulas: string[];
}

/** Lê users/{uid} direto do emulador (como administrador). */
async function lerDaNuvem(uid: string): Promise<DocUsuario | null> {
  const r = await fetch(`${FIRESTORE}/users/${uid}`, { headers: { Authorization: 'Bearer owner' } });
  if (r.status === 404) return null;
  const d = (await r.json()) as { fields: { progresso: { mapValue: { fields: Record<string, any> } } } };
  const p = d.fields.progresso.mapValue.fields;
  return {
    sessoes: Number(p.sessoes?.integerValue ?? 0),
    itens: Object.keys(p.itens?.mapValue?.fields ?? {}).length,
    aulas: Object.keys(p.aulas?.mapValue?.fields ?? {}),
  };
}

async function limparEmuladores(): Promise<void> {
  await fetch('http://127.0.0.1:8080/emulator/v1/projects/demo-caderno/databases/(default)/documents', { method: 'DELETE' });
  await fetch(`${AUTH}/emulator/v1/projects/demo-caderno/accounts`, { method: 'DELETE' });
}

async function usarConta(ctx: BrowserContext, sub: string): Promise<void> {
  await ctx.addInitScript((s) => {
    (window as any).__contaGoogleDeTeste = { sub: s, email: `${s}@example.com`, name: `Aluno ${s}`, email_verified: true };
  }, sub);
}

const uidDaPagina = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('caderno-pratica:conta-usuario') ?? 'null')?.uid as string);

const progressoLocal = (page: Page) =>
  page.evaluate(() => JSON.parse(localStorage.getItem('caderno-pratica:progresso') ?? '{}'));

/** Abre a aula 23, faz uma atividade e toca TERMINAR. */
async function praticarUmPouco(page: Page): Promise<void> {
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  await page.waitForSelector('[data-sessao]');
  await resolverAtividade(page);
  await page.locator('[data-terminar]').click();
  await expect(page.locator('[data-fim]')).toBeVisible();
}

test.beforeEach(async () => {
  await limparEmuladores();
});

test('ENTRAR SEM CONTA: o progresso fica só no aparelho, e dá para entrar com Google depois', async ({ page, context }) => {
  await usarConta(context, 'aluno-a');
  await page.goto('/');
  await expect(page.locator('[data-entrada]')).toBeVisible();
  await expect(page.locator('[data-entrar-google]')).toHaveText(/ENTRAR COM GOOGLE/);
  await page.locator('[data-entrar-sem-conta]').click();
  await expect(page.getByText('SEM CONTA: O PROGRESSO FICA SÓ NESTE CELULAR.')).toBeVisible();

  // Ao abrir de novo, não pergunta outra vez
  await page.reload();
  await expect(page.locator('[data-entrada]')).toHaveCount(0);

  // Pratica sem conta: nada vai para a nuvem
  await praticarUmPouco(page);
  const local = await progressoLocal(page);
  expect(Object.keys(local.itens).length).toBeGreaterThan(0);
  const lista = await (await fetch(`${FIRESTORE}/users`, { headers: { Authorization: 'Bearer owner' } })).json();
  expect(lista.documents ?? []).toHaveLength(0);

  // Entra com Google depois: o progresso do aparelho vai junto para a conta
  await page.goto('/');
  await page.locator('.conta [data-entrar-google]').click();
  await expect(page.getByText('PROGRESSO GUARDADO NA CONTA:')).toBeVisible();
  const uid = await uidDaPagina(page);
  await expect.poll(async () => (await lerDaNuvem(uid))?.itens ?? 0).toBe(Object.keys(local.itens).length);
  expect((await lerDaNuvem(uid))!.aulas).toContain('23');
});

test('ENTRAR COM GOOGLE: o progresso sincroniza, funciona sem internet e envia quando a conexão volta', async ({ page, context, browser }) => {
  await usarConta(context, 'aluno-b');
  await page.goto('/');
  await page.locator('[data-entrar-google]').click();
  await expect(page.getByText('PROGRESSO GUARDADO NA CONTA: ALUNO ALUNO-B')).toBeVisible();
  const uid = await uidDaPagina(page);
  await expect.poll(() => lerDaNuvem(uid)).not.toBeNull();

  // Pratica: o progresso vai para a conta
  await praticarUmPouco(page);
  await expect.poll(async () => (await lerDaNuvem(uid))?.aulas ?? []).toContain('23');
  const sessoesAntes = (await lerDaNuvem(uid))!.sessoes;

  // Sem internet: o app abre (do cache), continua na conta e deixa praticar
  await context.setOffline(true);
  await page.goto('/');
  await page.reload();
  await expect(page.getByText('PROGRESSO GUARDADO NA CONTA: ALUNO ALUNO-B')).toBeVisible();
  await praticarUmPouco(page);
  expect((await progressoLocal(page)).sessoes).toBe(sessoesAntes + 1);
  expect((await lerDaNuvem(uid))!.sessoes).toBe(sessoesAntes); // ainda não chegou na nuvem

  // A internet volta: o que foi feito sem internet vai para a conta
  await context.setOffline(false);
  await expect.poll(async () => (await lerDaNuvem(uid))!.sessoes, { timeout: 60_000 }).toBe(sessoesAntes + 1);

  // Outro aparelho, mesma conta: o progresso aparece lá
  const outro = await browser.newContext({ viewport: { width: 360, height: 640 } });
  await usarConta(outro, 'aluno-b');
  const page2 = await outro.newPage();
  await page2.goto('/');
  await page2.locator('[data-entrar-google]').click();
  await expect(page2.getByText('PROGRESSO GUARDADO NA CONTA: ALUNO ALUNO-B')).toBeVisible();
  await expect.poll(async () => (await progressoLocal(page2)).sessoes).toBe(sessoesAntes + 1);
  expect(await uidDaPagina(page2)).toBe(uid);

  // SAIR DA CONTA: volta a guardar só no aparelho
  await page2.locator('[data-sair-conta]').click();
  await expect(page2.getByText('SEM CONTA: O PROGRESSO FICA SÓ NESTE CELULAR.')).toBeVisible();
  await outro.close();
});

test('regras do Firestore: cada pessoa só lê e grava os próprios dados', async ({ page, context }) => {
  await usarConta(context, 'aluno-c');
  await page.goto('/');
  await page.locator('[data-entrar-google]').click();
  await expect(page.getByText('PROGRESSO GUARDADO NA CONTA:')).toBeVisible();
  const uid = await uidDaPagina(page);
  await expect.poll(() => lerDaNuvem(uid)).not.toBeNull();

  // Outra pessoa (outra conta no emulador) tenta ler e gravar o documento do aluno-c
  const cadastro = await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-chave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ returnSecureToken: true }),
  });
  const { idToken, localId } = (await cadastro.json()) as { idToken: string; localId: string };
  const comoOutra = { Authorization: `Bearer ${idToken}`, 'Content-Type': 'application/json' };
  expect((await fetch(`${FIRESTORE}/users/${uid}`, { headers: comoOutra })).status).toBe(403);
  const corpo = JSON.stringify({ fields: { progresso: { mapValue: { fields: {} } } } });
  expect((await fetch(`${FIRESTORE}/users/${uid}`, { method: 'PATCH', headers: comoOutra, body: corpo })).status).toBe(403);
  // Sem login: também não
  expect((await fetch(`${FIRESTORE}/users/${uid}`)).status).toBe(403);
  // No próprio documento, pode
  expect((await fetch(`${FIRESTORE}/users/${localId}`, { method: 'PATCH', headers: comoOutra, body: corpo })).status).toBe(200);
});
