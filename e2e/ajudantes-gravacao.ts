// Ajudantes dos testes de gravação.
import type { Page } from '@playwright/test';

const TODOS_OS_TIPOS = [
  'conheca', 'escute_letra', 'diga_letra', 'escute_silaba', 'monte_silaba', 'complete_palavra', 'forme_palavra',
  'quantas_silabas', 'escute_palavra', 'escreva', 'complete_frase', 'ligue', 'leia', 'ordene', 'maiuscula',
  'conte', 'conta', 'pague', 'troco', 'da', 'hora',
];

export async function semDemonstracoes(page: Page) {
  await page.addInitScript((tipos) => {
    localStorage.setItem('caderno-pratica:progresso', JSON.stringify({ sessoes: 0, ultimaAula: null, aulas: {}, itens: {}, tiposVistos: tipos }));
  }, TODOS_OS_TIPOS);
}

/** Vai até a atividade "Diga o nome da letra" da aula 23. */
export async function irParaDigaLetra(page: Page) {
  await page.goto('/#/aula/23');
  await page.locator('[data-comecar]').click();
  const n = await page.locator('[data-bolinha]').count();
  for (let i = 0; i < n; i++) {
    await page.locator(`[data-bolinha="${i}"]`).click();
    if ((await page.getAttribute('[data-sessao]', 'data-tipo')) === 'diga_letra') return;
  }
  throw new Error('sem "Diga o nome da letra" na aula 23');
}

/** Lê do banco do aparelho a gravação do estudante e mede a duração do áudio. */
export async function gravacaoSalva(page: Page) {
  return page.evaluate(async () => {
    const db: IDBDatabase = await new Promise((ok, erro) => {
      const r = indexedDB.open('caderno-pratica');
      r.onsuccess = () => ok(r.result);
      r.onerror = () => erro(r.error);
    });
    const itens: { blob: Blob; mime: string }[] = await new Promise((ok) => {
      const r = db.transaction('aluno', 'readonly').objectStore('aluno').getAll();
      r.onsuccess = () => ok(r.result);
    });
    if (!itens.length) return null;
    const { blob, mime } = itens[itens.length - 1];
    const audio = await new AudioContext().decodeAudioData(await blob.arrayBuffer());
    return { tamanho: blob.size, mime, duracao: audio.duration };
  });
}

