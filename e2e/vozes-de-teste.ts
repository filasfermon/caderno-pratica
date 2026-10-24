// Voz do celular "de mentira" para os testes: anota cada fala (texto, velocidade e tempo).
import type { Page } from '@playwright/test';

export interface Fala {
  texto: string;
  rate: number;
  inicio: number;
  fim?: number;
}

export async function usarVozDeTeste(page: Page): Promise<void> {
  await page.addInitScript(() => {
    const registro: { texto: string; rate: number; inicio: number; fim?: number }[] = [];
    (window as unknown as { __falas: typeof registro }).__falas = registro;
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
        const r = { texto: u.text, rate: u.rate, inicio: performance.now() } as (typeof registro)[number];
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
    // Anota também os áudios prontos tocados (e a velocidade de cada um).
    const tocados: { src: string; rate: number }[] = [];
    (window as unknown as { __tocados: typeof tocados }).__tocados = tocados;
    const play = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function (this: HTMLMediaElement) {
      if (!this.src.startsWith('data:')) tocados.push({ src: this.src, rate: this.playbackRate });
      return play.call(this);
    };
  });
}

export const falasDaPagina = (page: Page) => page.evaluate(() => (window as unknown as { __falas: Fala[] }).__falas);
export const tocadosDaPagina = (page: Page) => page.evaluate(() => (window as unknown as { __tocados: { src: string; rate: number }[] }).__tocados);
