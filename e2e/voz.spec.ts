// Correção 2: a voz em ritmo natural. Usa uma voz "de mentira" que anota cada fala.
import { test, expect } from '@playwright/test';
import { resolverAtividade } from './ajudantes';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    type Registro = { texto: string; rate: number; inicio: number; fim?: number };
    const registro: Registro[] = [];
    (window as unknown as { __falas: Registro[] }).__falas = registro;
    let atual: { onend?: (e: unknown) => void } | null = null;
    let timer = 0;
    const sintese = {
      speaking: false,
      pending: false,
      getVoices: () => [{ name: 'Voz de teste', lang: 'pt-BR', localService: true, default: true, voiceURI: 'teste' }],
      addEventListener: () => undefined,
      cancel() {
        const u = atual;
        atual = null;
        clearTimeout(timer);
        u?.onend?.({});
      },
      speak(u: { text: string; rate: number; onend?: (e: unknown) => void }) {
        const r: Registro = { texto: u.text, rate: u.rate, inicio: performance.now() };
        registro.push(r);
        atual = u;
        timer = window.setTimeout(() => {
          atual = null;
          r.fim = performance.now();
          u.onend?.({});
        }, 60 + u.text.length * 3);
      },
    };
    Object.defineProperty(window, 'speechSynthesis', { value: sintese, configurable: true });
    (window as unknown as { SpeechSynthesisUtterance: unknown }).SpeechSynthesisUtterance = class {
      text: string;
      rate = 1;
      constructor(t: string) {
        this.text = t;
      }
    };
    // Sem demonstrações: queremos medir o ritmo das atividades.
    localStorage.setItem(
      'caderno-pratica:progresso',
      JSON.stringify({ sessoes: 0, ultimaAula: null, aulas: {}, itens: {}, tiposVistos: [
        'conheca', 'escute_letra', 'diga_letra', 'escute_silaba', 'monte_silaba', 'complete_palavra', 'forme_palavra',
        'quantas_silabas', 'escute_palavra', 'escreva', 'complete_frase', 'ligue', 'leia', 'ordene', 'maiuscula',
        'conte', 'conta', 'pague', 'troco', 'da', 'hora'] }),
    );
  });
});

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
  const falas = await page.evaluate(() => (window as unknown as { __falas: { texto: string; rate: number; inicio: number; fim?: number }[] }).__falas);
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
