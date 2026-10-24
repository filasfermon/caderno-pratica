// A VOZ DO APP: a voz sintetizada do celular (Web Speech API), em português do Brasil.
// Nada é gravado e nada é guardado no aparelho.
//
// Também faz o "karaokê": avisa qual palavra está sendo lida.

import { VELOCIDADE_DA_VOZ } from '../config/padroes';
import { textoParaFala, type ItemAudio } from './pronuncia';

export interface OpcoesFala {
  /** Chamado com o número da palavra que está sendo lida (0, 1, 2...). */
  aoLerPalavra?: (indice: number) => void;
}

// ---------- Escolha da melhor voz pt-BR ----------

let vozes: SpeechSynthesisVoice[] = [];

function sintese(): SpeechSynthesis | null {
  return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
}

function carregarVozes(): void {
  const s = sintese();
  if (!s) return;
  vozes = s.getVoices();
}

if (sintese()) {
  carregarVozes();
  sintese()!.addEventListener?.('voiceschanged', carregarVozes);
}

/** Pontua as vozes: pt-BR primeiro; depois as que funcionam sem internet; depois as mais naturais. */
function pontuar(v: SpeechSynthesisVoice): number {
  const lang = v.lang.replace('_', '-').toLowerCase();
  let p = 0;
  if (lang === 'pt-br') p += 100;
  else if (lang.startsWith('pt')) p += 50;
  else return -1;
  if (v.localService) p += 20;
  if (/natural|neural|premium|enhanced|aprimorad/i.test(v.name)) p += 10;
  if (/google/i.test(v.name)) p += 5;
  if (/luciana|francisca|thalita|helo|daniel|antonio/i.test(v.name)) p += 3;
  return p;
}

function vozesPortugues(): SpeechSynthesisVoice[] {
  carregarVozes();
  return vozes.filter((v) => pontuar(v) >= 0).sort((a, b) => pontuar(b) - pontuar(a));
}

function vozEscolhida(): SpeechSynthesisVoice | undefined {
  return vozesPortugues()[0];
}

// ---------- Tocar ----------

/** A fala que está tocando agora (só uma por vez). */
let atual: { parar: () => void } | null = null;
let geracao = 0;

/** Número que muda a cada nova fala (serve para saber se uma fala foi interrompida por outra). */
export function geracaoAtual(): number {
  return geracao;
}

/** Para qualquer fala ou áudio que esteja tocando. */
let ultimoCancelamento = 0;

export function pararFala(): void {
  const a = atual;
  atual = null;
  a?.parar();
  const s = sintese();
  if (s && (s.speaking || s.pending)) {
    s.cancel();
    ultimoCancelamento = Date.now();
  }
}

function palavrasDe(texto: string): string[] {
  return texto.split(/\s+/).filter(Boolean);
}

/** Karaokê por tempo: distribui a duração pelas palavras, conforme o tamanho de cada uma. */
function karaokePorTempo(texto: string, duracaoMs: number, aoLer: (i: number) => void, timers: number[]): void {
  const palavras = palavrasDe(texto);
  const total = palavras.reduce((s, p) => s + p.length + 2, 0);
  let acumulado = 0;
  palavras.forEach((p, i) => {
    timers.push(window.setTimeout(() => aoLer(i), (acumulado / total) * Math.max(0, duracaoMs)));
    acumulado += p.length + 2;
  });
}

/**
 * Cria o "controle" de uma fala: guarda os temporizadores DESTA fala e termina uma vez só.
 * Assim uma fala nova nunca apaga os temporizadores de outra.
 */
function novaFala(resolve: () => void, aoParar: () => void = () => undefined) {
  const timers: number[] = [];
  let acabou = false;
  const controle = {
    timers,
    terminar: () => {
      if (acabou) return;
      acabou = true;
      timers.forEach((t) => clearTimeout(t));
      if (atual === parada) atual = null;
      resolve();
    },
  };
  const parada = {
    parar: () => {
      aoParar();
      controle.terminar();
    },
  };
  atual = parada;
  return controle;
}

/** Tempo estimado de leitura (para quando a voz do aparelho não avisa o fim). */
function duracaoEstimada(texto: string): number {
  return (texto.length * 85) / Math.max(0.5, VELOCIDADE_DA_VOZ) + 400;
}

function falarSintetizado(textoTela: string, textoFala: string, opcoes: OpcoesFala): Promise<void> {
  return new Promise((resolve) => {
    const s = sintese();
    const voz = vozEscolhida();
    const fala = novaFala(resolve);
    if (!s || !voz) {
      // Aparelho sem voz em português: o app segue funcionando, só que em silêncio.
      if (opcoes.aoLerPalavra) karaokePorTempo(textoTela, Math.min(1500, duracaoEstimada(textoTela)), opcoes.aoLerPalavra, fala.timers);
      fala.timers.push(window.setTimeout(fala.terminar, Math.min(1500, duracaoEstimada(textoTela))));
      return;
    }
    const enunciado = new SpeechSynthesisUtterance(textoFala);
    enunciado.lang = 'pt-BR';
    enunciado.voice = voz;
    enunciado.rate = VELOCIDADE_DA_VOZ;
    let recebeuLimite = false;
    if (opcoes.aoLerPalavra) {
      // Quando a fala tem as mesmas palavras da tela, usamos os avisos de palavra da própria voz.
      const mesmaQuantidade = palavrasDe(textoFala).length === palavrasDe(textoTela).length;
      const inicios: number[] = [];
      textoFala.replace(/\S+/g, (p, pos: number) => {
        inicios.push(pos);
        return p;
      });
      enunciado.onboundary = (ev) => {
        if (ev.name !== 'word' || !mesmaQuantidade) return;
        recebeuLimite = true;
        let i = inicios.findIndex((ini, k) => ev.charIndex >= ini && (k === inicios.length - 1 || ev.charIndex < inicios[k + 1]));
        if (i < 0) i = 0;
        opcoes.aoLerPalavra!(i);
      };
      // Se a voz não mandar avisos de palavra em 600 ms, o karaokê segue pelo relógio.
      fala.timers.push(
        window.setTimeout(() => {
          if (!recebeuLimite) karaokePorTempo(textoTela, duracaoEstimada(textoFala) - 600, opcoes.aoLerPalavra!, fala.timers);
        }, 600),
      );
    }
    enunciado.onend = fala.terminar;
    enunciado.onerror = fala.terminar;
    // Segurança: algumas vozes não avisam o fim. Depois do tempo estimado (com folga), seguimos.
    fala.timers.push(window.setTimeout(fala.terminar, duracaoEstimada(textoFala) * 2 + 3000));
    // Alguns Android perdem a fala se ela começa logo depois de um cancelamento: esperamos um pouquinho.
    const espera = Math.max(0, 80 - (Date.now() - ultimoCancelamento));
    if (espera) fala.timers.push(window.setTimeout(() => s.speak(enunciado), espera));
    else s.speak(enunciado);
  });
}

/**
 * Fala um item (sílaba, palavra, frase, instrução...).
 * A promessa termina quando a fala acaba (ou é interrompida por outra).
 */
export async function falar(item: ItemAudio, opcoes: OpcoesFala = {}): Promise<void> {
  geracao++;
  pararFala();
  return falarSintetizado(item.texto, textoParaFala(item), opcoes);
}

/** Fala vários itens em sequência. Para no meio se outra fala começar. */
export async function falarEmSequencia(itens: ItemAudio[]): Promise<boolean> {
  for (const item of itens) {
    const antes = geracao;
    await falar(item);
    if (geracao !== antes + 1) return false; // outra fala começou no meio: paramos aqui
  }
  return true;
}
