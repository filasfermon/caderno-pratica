// Ajudantes do teste de ponta a ponta: fazem uma sessão inteira, atividade por atividade.
// Cada tela de atividade guarda a resposta esperada em data-resposta (só para os testes).
import { expect, type Page } from '@playwright/test';

async function esperarFimDaDemonstracao(page: Page): Promise<void> {
  await page.waitForFunction(() => !document.querySelector('[data-sessao][data-demo]'), null, { timeout: 90_000 });
}

async function clicarSePuder(page: Page, seletor: string): Promise<void> {
  await page.locator(seletor).first().click();
}

/** Resolve a atividade que está na tela. Devolve o tipo resolvido. */
export async function resolverAtividade(page: Page): Promise<string> {
  await esperarFimDaDemonstracao(page);
  const tipo = (await page.getAttribute('[data-sessao]', 'data-tipo')) ?? '';
  const resposta = JSON.parse((await page.getAttribute('.area', 'data-resposta')) ?? 'null');
  switch (tipo) {
    case 'conheca':
    case 'leia':
      break; // só ouvir: o botão SEGUIR aparece sozinho
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
  const seguir = page.locator('[data-seguir]');
  await expect(seguir).toBeVisible({ timeout: 30_000 });
  await seguir.click();
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
  await expect(page.locator('[data-fim]')).toBeVisible();
  return feitos;
}
