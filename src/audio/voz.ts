// A VOZ DO APP, nesta ordem:
//   1. letras e sílabas: o áudio pronto de public/audio (veja audio/arquivos.ts), se existir;
//   2. todo o resto (e letras e sílabas sem arquivo): a voz do celular (Web Speech API),
//      em português do Brasil.
// Nada é gravado e nada é guardado no aparelho.
//
// Também faz o "karaokê": avisa qual palavra está sendo lida.

import { VELOCIDADE_DA_VOZ } from '../config/padroes';
import { textoParaFala, type ItemAudio } from './pronuncia';
import { arquivoDoItem, temAudioPronto } from './arquivos';

export interface OpcoesFala {
  /** Chamado com o número da palavra que está sendo lida (0, 1, 2...). */
  aoLerPalavra?: (indice: number) => void;
  /**
   * Velocidade só desta fala (o botão MAIS DEVAGAR usa 0,8). Vale para a voz do celular
   * e para o áudio pronto. Sem isto: voz do celular em VELOCIDADE_DA_VOZ e áudio pronto
   * na velocidade em que foi gravado.
   */
  velocidade?: number;
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
/** Muda a cada pararFala(): um áudio que ainda estava sendo lido não toca mais. */
let cortes = 0;

export function pararFala(): void {
  cortes++;
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
function duracaoEstimada(texto: string, velocidade = VELOCIDADE_DA_VOZ): number {
  return (texto.length * 85) / Math.max(0.5, velocidade) + 400;
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
    enunciado.rate = opcoes.velocidade ?? VELOCIDADE_DA_VOZ;
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
          if (!recebeuLimite) karaokePorTempo(textoTela, duracaoEstimada(textoFala, opcoes.velocidade) - 600, opcoes.aoLerPalavra!, fala.timers);
        }, 600),
      );
    }
    enunciado.onend = fala.terminar;
    enunciado.onerror = fala.terminar;
    // Segurança: algumas vozes não avisam o fim. Depois do tempo estimado (com folga), seguimos.
    fala.timers.push(window.setTimeout(fala.terminar, duracaoEstimada(textoFala, opcoes.velocidade) * 2 + 3000));
    // Alguns Android perdem a fala se ela começa logo depois de um cancelamento: esperamos um pouquinho.
    const espera = Math.max(0, 80 - (Date.now() - ultimoCancelamento));
    if (espera) fala.timers.push(window.setTimeout(() => s.speak(enunciado), espera));
    else s.speak(enunciado);
  });
}

// ---------- Áudios prontos (public/audio) ----------

// Um só tocador de áudio para o app inteiro. No iPhone (Safari), um áudio só toca
// depois de um toque na tela; por isso o tocador é "destravado" no primeiro toque.
const SILENCIO = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
let tocador: HTMLAudioElement | null = null;

function obterTocador(): HTMLAudioElement {
  if (!tocador) {
    tocador = new Audio();
    tocador.preload = 'auto';
  }
  return tocador;
}

if (typeof document !== 'undefined' && typeof Audio !== 'undefined') {
  document.addEventListener(
    'pointerdown',
    () => {
      const t = obterTocador();
      if (t.src) return;
      t.src = SILENCIO;
      t.play().catch(() => undefined);
    },
    { once: true, capture: true },
  );
}

// Cada arquivo é lido inteiro (do cache do app, sem internet) e tocado da memória.
// Assim o iPhone toca o áudio mesmo sem internet (ele não aceita tocar "aos pedaços"
// direto do cache). Nada disso é guardado: some quando o app fecha.
const naMemoria = new Map<string, Promise<string | null>>();

function lerArquivo(url: string): Promise<string | null> {
  if (!naMemoria.has(url)) {
    const lido = fetch(url)
      .then((r) => (r.ok ? r.blob() : null))
      .then((b) => (b && b.size > 0 ? URL.createObjectURL(b) : null))
      .catch(() => null);
    naMemoria.set(url, lido);
    void lido.then((u) => u === null && naMemoria.delete(url)); // falhou: tenta de novo da próxima vez
  }
  return naMemoria.get(url)!;
}

/** Toca um áudio pronto. Devolve false se ele não pôde tocar (aí a voz do celular fala). */
async function tocarArquivo(endereco: string, opcoes: OpcoesFala): Promise<boolean> {
  const meuCorte = cortes;
  const url = await lerArquivo(endereco);
  if (meuCorte !== cortes) return true; // a fala foi parada (ou outra começou) enquanto o arquivo era lido
  if (!url) return false;
  return new Promise((resolve) => {
    const audio = obterTocador();
    audio.pause();
    let tocou = false;
    const fala = novaFala(
      () => {
        audio.onended = audio.onerror = null;
        resolve(tocou);
      },
      () => audio.pause(),
    );
    audio.onended = fala.terminar;
    audio.onerror = fala.terminar;
    audio.src = url;
    audio.playbackRate = opcoes.velocidade ?? 1; // sem velocidade pedida: a do arquivo
    // Segurança: se o áudio não avisar o fim, seguimos depois de um tempo.
    fala.timers.push(window.setTimeout(fala.terminar, 15_000));
    audio.play().then(
      () => {
        tocou = true;
        audio.playbackRate = opcoes.velocidade ?? 1;
        opcoes.aoLerPalavra?.(0);
      },
      () => fala.terminar(),
    );
  });
}

/**
 * Fala um item (sílaba, palavra, frase, instrução...).
 * A promessa termina quando a fala acaba (ou é interrompida por outra).
 */
export async function falar(item: ItemAudio, opcoes: OpcoesFala = {}): Promise<void> {
  const minha = ++geracao;
  pararFala();
  const arquivo = arquivoDoItem(item);
  if (arquivo && temAudioPronto(arquivo)) {
    const tocou = await tocarArquivo(`${import.meta.env.BASE_URL}audio/${arquivo}`, opcoes);
    // Tocou (ou outra fala começou no meio): pronto. Se o arquivo falhou, a voz do celular fala.
    if (tocou || minha !== geracao) return;
  }
  return falarSintetizado(item.texto, textoParaFala(item), opcoes);
}

/** Fala vários itens em sequência. Para no meio se outra fala começar. */
export async function falarEmSequencia(itens: ItemAudio[], opcoes: Pick<OpcoesFala, 'velocidade'> = {}): Promise<boolean> {
  for (const item of itens) {
    const antes = geracao;
    await falar(item, opcoes);
    if (geracao !== antes + 1) return false; // outra fala começou no meio: paramos aqui
  }
  return true;
}
