// Ajudantes do teste de ponta a ponta: fazem uma sessão inteira, atividade por atividade.
// Cada tela de atividade guarda a resposta esperada em data-resposta (só para os testes).
import { type Page } from '@playwright/test';

/**
 * A demonstração aparece na primeira vez de cada tipo de atividade, desde que o app abriu
 * (nada fica guardado). Os testes tocam PULAR, como faria quem já sabe fazer.
 */
export async function pularDemonstracao(page: Page): Promise<void> {
  // Dá tempo de a demonstração começar (ela começa logo que a atividade abre).
  await page.waitForTimeout(150);
  if (await page.locator('[data-sessao][data-demo]').count()) {
    await page.locator('[data-pular-demo]').click().catch(() => undefined);
  }
  await page.waitForFunction(() => !document.querySelector('[data-sessao][data-demo]'), null, { timeout: 90_000 });
}

async function clicarSePuder(page: Page, seletor: string): Promise<void> {
  await page.locator(seletor).first().click();
}

/** Resolve a atividade que está na tela. Devolve o tipo resolvido. */
export async function resolverAtividade(page: Page): Promise<string> {
  await pularDemonstracao(page);
  const tipo = (await page.getAttribute('[data-sessao]', 'data-tipo')) ?? '';
  const indice = (await page.getAttribute('[data-sessao]', 'data-indice')) ?? '';
  const resposta = JSON.parse((await page.getAttribute('.area', 'data-resposta')) ?? 'null');
  switch (tipo) {
    case 'conheca':
    case 'leia':
    case 'diga_letra':
      break; // só ouvir/falar: o botão SEGUIR aparece sozinho
    case 'monte_silaba':
    case 'forme_palavra':
    case 'ordene':
    case 'escreva':
      for (const peca of resposta as string[]) {
        await page.locator(`.area button[data-peca="${peca.replace(/"/g, '\\"')}"]:not([disabled])`).first().click();
      }
      break;
    case 'conta':
      for (const c of resposta as string[]) await clicarSePuder(page, `.area [data-tecla="${c}"]`);
      await clicarSePuder(page, '.area [data-pronto]');
      break;
    case 'pague': {
      // data-resposta traz uma combinação certa de notas e moedas.
      for (const v of resposta as number[]) await clicarSePuder(page, `.area [data-valor="${v}"]`);
      await clicarSePuder(page, '.area [data-pronto]');
      break;
    }
    case 'ligue':
    case 'maiuscula':
      for (const [i, j] of resposta as [number, number][]) {
        await clicarSePuder(page, `.area [data-lado="e"][data-indice="${i}"]`);
        await clicarSePuder(page, `.area [data-lado="d"][data-indice="${j}"]`);
      }
      break;
    default:
      // Escolhas: escute, complete, quantas, conte, troco, dá?, hora, tutorial
      await clicarSePuder(page, '.area [data-certo="sim"]');
  }
  if (['conheca', 'leia', 'diga_letra'].includes(tipo)) {
    // Atividades só de ouvir/ler/falar: contam como feitas depois de ouvidas; o estudante toca AVANÇAR.
    await page.waitForSelector('[data-sessao][data-feita="sim"]', { timeout: 30_000 });
    await page.locator('[data-avancar]').click();
  }
  // Depois do acerto (ou da resposta mostrada), o próximo item começa sozinho.
  await page.waitForFunction(
    (antes) => !!document.querySelector('[data-fim]') || document.querySelector<HTMLElement>('[data-sessao]')?.dataset.indice !== antes,
    indice,
    { timeout: 30_000 },
  );
  return tipo;
}

/** Faz a sessão inteira até a tela final. Devolve os tipos de atividade feitos. */
export async function fazerSessao(page: Page): Promise<string[]> {
  const feitos: string[] = [];
  for (let i = 0; i < 14; i++) {
    await page.waitForSelector('[data-sessao], [data-fim]');
    if (await page.locator('[data-fim]').count()) return feitos;
    feitos.push(await resolverAtividade(page));
  }
  await page.waitForSelector('[data-fim]');
  return feitos;
}
