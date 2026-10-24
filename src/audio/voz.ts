// A VOZ DO APP — três camadas, nesta ordem:
//   (a) gravação do professor feita neste aparelho;
//   (b) áudio do pacote .zip importado;
//   (c) voz sintetizada do navegador (Web Speech API), em português do Brasil.
//
// Também faz o "karaokê": avisa qual palavra está sendo lida.

import { config } from '../dados/config';
import { ler, type Audio } from '../dados/banco';
import { chaveDoItem, textoParaFala, type ItemAudio } from './pronuncia';

export type OrigemAudio = 'professor' | 'pacote' | 'voz';

export interface OpcoesFala {
  /** Chamado com o número da palavra que está sendo lida (0, 1, 2...). */
  aoLerPalavra?: (indice: number) => void;
  /** Ignora gravações e usa só a voz do aparelho (modo professor: "ouvir a voz do aparelho"). */
  soVozDoAparelho?: boolean;
  /** Avisado quando um áudio gravado começa a tocar de verdade. */
  aoComecar?: () => void;
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

export function vozesPortugues(): SpeechSynthesisVoice[] {
  carregarVozes();
  return vozes.filter((v) => pontuar(v) >= 0).sort((a, b) => pontuar(b) - pontuar(a));
}

function vozEscolhida(): SpeechSynthesisVoice | undefined {
  const lista = vozesPortugues();
  const nome = config().voz;
  return lista.find((v) => v.name === nome) ?? lista[0];
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

/** Procura a gravação de um item: primeiro a do professor, depois a do pacote. */
export async function gravacaoDe(chave: string): Promise<{ audio: Audio; origem: OrigemAudio } | null> {
  const doProfessor = await ler<Audio>('gravacoes', chave);
  if (doProfessor) return { audio: doProfessor, origem: 'professor' };
  const doPacote = await ler<Audio>('pacote', chave);
  if (doPacote) return { audio: doPacote, origem: 'pacote' };
  return null;
}

export async function origemDoAudio(item: ItemAudio): Promise<OrigemAudio> {
  return (await gravacaoDe(chaveDoItem(item)))?.origem ?? 'voz';
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

// Um só tocador de áudio para o app inteiro. No iPhone (Safari), um áudio só toca
// depois de um toque na tela; por isso o tocador é "destravado" no primeiro toque.
const SILENCIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
let tocador: HTMLAudioElement | null = null;
let destravado = false;

function obterTocador(): HTMLAudioElement {
  if (!tocador) {
    tocador = new Audio();
    tocador.preload = 'auto';
  }
  return tocador;
}

/** Chame dentro de um toque (ex.: no botão PARAR) para garantir que o áudio seguinte toque. */
export function destravarAudio(): void {
  if (typeof Audio === 'undefined') return;
  const t = obterTocador();
  if (destravado && t.src) return;
  destravado = true;
  t.src = SILENCIO;
  t.play().catch(() => undefined);
}

if (typeof document !== 'undefined') {
  document.addEventListener('pointerdown', () => destravarAudio(), { once: true, capture: true });
}

function tocarBlob(blob: Blob, texto: string, opcoes: OpcoesFala): Promise<void> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob);
    const audio = obterTocador();
    audio.pause();
    audio.playbackRate = 1; // gravações tocam sempre na velocidade original
    audio.src = url;
    const fala = novaFala(
      () => {
        audio.onended = audio.onerror = audio.onloadedmetadata = null;
        URL.revokeObjectURL(url);
        resolve();
      },
      () => audio.pause(),
    );
    audio.onended = fala.terminar;
    audio.onerror = fala.terminar;
    audio.onloadedmetadata = () => {
      if (opcoes.aoLerPalavra && isFinite(audio.duration)) karaokePorTempo(texto, audio.duration * 1000, opcoes.aoLerPalavra, fala.timers);
    };
    // Segurança: se o áudio não avisar o fim, seguimos depois de um tempo.
    fala.timers.push(window.setTimeout(fala.terminar, 30_000));
    audio.play().then(
      () => opcoes.aoComecar?.(),
      () => fala.terminar(),
    );
  });
}

/** Tempo estimado de leitura (para quando a voz do aparelho não avisa o fim). */
function duracaoEstimada(texto: string): number {
  return (texto.length * 85) / Math.max(0.5, config().velocidade) + 400;
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
    enunciado.rate = config().velocidade;
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
  const minha = ++geracao;
  pararFala();
  if (!opcoes.soVozDoAparelho) {
    const gravacao = await gravacaoDe(chaveDoItem(item));
    if (minha !== geracao) return; // outra fala começou enquanto procurávamos a gravação
    if (gravacao) return tocarBlob(gravacao.audio.blob, item.texto, opcoes);
  }
  if (minha !== geracao) return;
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

/** Toca um áudio qualquer (ex.: a gravação do próprio estudante). */
export function tocarAudio(blob: Blob, opcoes: OpcoesFala = {}): Promise<void> {
  geracao++;
  pararFala();
  return tocarBlob(blob, '', opcoes);
}
