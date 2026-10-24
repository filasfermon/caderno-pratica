// A voz em ritmo natural. Usa uma voz "de mentira" que anota cada fala (e2e/vozes-de-teste.ts).
import { test, expect } from '@playwright/test';
import { resolverAtividade } from './ajudantes';
import { usarVozDeTeste, falasDaPagina } from './vozes-de-teste';

test.beforeEach(async ({ page }) => usarVozDeTeste(page));

test('voz a 1,0, sem pausas longas, e a instrução não se repete no mesmo tipo', async ({ page }) => {
  await page.goto('/#/aula/24');
  await page.locator('[data-comecar]').click();
  const tipos: string[] = [];
  for (let i = 0; i < 14; i++) {
    await page.waitForSelector('[data-sessao], [data-fim]');
    if (await page.locator('[data-fim]').count()) break;
    await page.waitForTimeout(400); // como uma pessoa: escuta antes de tocar
    tipos.push(await resolverAtividade(page));
  }
  const falas = await falasDaPagina(page);
  // 1) Velocidade natural
  expect(falas.length).toBeGreaterThan(10);
  for (const f of falas) expect(f.rate).toBe(1);
  // 2) A instrução só é falada quando o tipo de atividade muda
  const mudancas = tipos.filter((t, i) => i === 0 || t !== tipos[i - 1]).length;
  const faladas = falas.filter((f) => /^(Escute e leia|Escute e toque a letra|Diga o nome|Qual é|Forme a|Complete a|Quantas sílabas|Escreva a palavra|Ligue |Conte e toque|Faça a conta|Pague o preço|Quanto é o troco|O dinheiro dá|Que horas são)/.test(f.texto));
  expect(faladas.length).toBe(mudancas);
  // 3) Depois do retorno de acerto, a fala seguinte começa em até 250 ms (com folga de 100 ms do teste)
  for (let i = 0; i < falas.length - 1; i++) {
    if (!/^(Isso mesmo|Muito bem|Certo)\.$/.test(falas[i].texto) || falas[i].fim === undefined) continue;
    expect(falas[i + 1].inicio - falas[i].fim!, `depois de "${falas[i].texto}"`).toBeLessThanOrEqual(350);
  }
});
