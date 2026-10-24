// O app não guarda nenhum dado e nunca pede o microfone.
// Percorre a tela inicial, a escolha da aula e uma prática inteira; no fim, o
// localStorage, o sessionStorage, o IndexedDB e os cookies têm de estar vazios.
// (O único armazenamento permitido é o cache dos arquivos do app, do service worker.)
import { test, expect } from '@playwright/test';
import { fazerSessao } from './ajudantes';

test('nenhum dado guardado e nenhum pedido de microfone', async ({ page, context }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __pedidos: string[] };
    w.__pedidos = [];
    const anotar = (o: string) => w.__pedidos.push(o);
    if (navigator.mediaDevices) {
      navigator.mediaDevices.getUserMedia = () => {
        anotar('getUserMedia');
        return Promise.reject(new Error('não deveria pedir o microfone'));
      };
    }
    const MR = (window as unknown as { MediaRecorder?: unknown }).MediaRecorder;
    if (MR)
      (window as unknown as { MediaRecorder: unknown }).MediaRecorder = class {
        constructor() {
          anotar('MediaRecorder');
          throw new Error('não deveria gravar');
        }
      };
    const consultar = navigator.permissions?.query?.bind(navigator.permissions);
    if (consultar)
      navigator.permissions.query = (d: PermissionDescriptor) => {
        anotar(`permissions:${d.name}`);
        return consultar(d);
      };
  });

  // Tela inicial → Parte → Unidade → Aula
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'ESCOLHER A AULA' })).toBeVisible();
  await page.locator('a[href="#/escolher/parte/3"]').click();
  await page.locator('a[href="#/escolher/unidade/5"]').click();
  await page.locator('a[href="#/aula/23"]').click();
  await page.locator('[data-comecar]').click();
  const feitos = await fazerSessao(page);
  expect(feitos.length).toBeGreaterThanOrEqual(8);
  await expect(page.locator('[data-fim]')).toBeVisible();
  // Volta para o início e abre outra aula pela busca
  await page.goto('/');
  await page.locator('#busca-aula').fill('8');
  await page.getByRole('button', { name: 'IR', exact: true }).click();
  await expect(page.locator('[data-comecar]')).toBeVisible();

  const estado = await page.evaluate(async () => ({
    local: localStorage.length,
    sessao: sessionStorage.length,
    bancos: (await indexedDB.databases()).map((b) => b.name),
    cookie: document.cookie,
    pedidos: (window as unknown as { __pedidos: string[] }).__pedidos,
    caches: await caches.keys(),
  }));
  expect(estado.local).toBe(0);
  expect(estado.sessao).toBe(0);
  expect(estado.bancos).toEqual([]);
  expect(estado.cookie).toBe('');
  expect(await context.cookies()).toEqual([]);
  expect(estado.pedidos).toEqual([]);
  // O cache do service worker (só os arquivos do app) pode existir.
  for (const nome of estado.caches) expect(nome).toMatch(/workbox|precache/);
});
