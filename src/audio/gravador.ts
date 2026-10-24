// GRAVAÇÃO DE VOZ (MediaRecorder) — máquina de estados clara:
//
//   parado → pedindo (licença do microfone) → gravando → processando → pronto
//                         ↘ erro (microfone negado ou ausente)
//
// Regras que deixam a gravação confiável em Android, computador e iPhone:
// - formato escolhido com MediaRecorder.isTypeSupported, nesta ordem:
//   audio/webm;codecs=opus → audio/webm → audio/mp4 (iPhone e Safari);
// - os pedaços chegam no evento "dataavailable" e o arquivo (Blob) só é montado
//   no evento "stop", nunca antes;
// - depois de parar, todas as trilhas do microfone são desligadas;
// - limite de 15 segundos: para sozinho.
// Usada pelo estudante ("Ouça e repita", "Diga o nome da letra") e pelo professor.

export type EstadoGravacao = 'parado' | 'pedindo' | 'gravando' | 'processando' | 'pronto' | 'erro';
export type ErroGravacao = 'negado' | 'sem-microfone' | 'nao-suportado' | 'falhou';

export interface Gravacao {
  blob: Blob;
  mime: string;
}

export const LIMITE_SEGUNDOS = 15;
export const FORMATOS = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];

export function podeGravar(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
}

/** O primeiro formato da lista que o navegador grava ("" = o padrão do navegador). */
export function formatoDeGravacao(suporta: (m: string) => boolean = (m) => MediaRecorder.isTypeSupported?.(m) ?? false): string {
  return FORMATOS.find((m) => suporta(m)) ?? '';
}

function tipoDeErro(e: unknown): ErroGravacao {
  const nome = (e as { name?: string })?.name ?? '';
  if (nome === 'NotAllowedError' || nome === 'SecurityError' || nome === 'PermissionDeniedError') return 'negado';
  if (nome === 'NotFoundError' || nome === 'OverconstrainedError' || nome === 'DevicesNotFoundError') return 'sem-microfone';
  return 'falhou';
}

/** Só uma gravação por vez no app inteiro. */
let gravadorEmUso: Gravador | null = null;

/** Para (sem salvar) qualquer gravação em andamento — usado ao trocar de tela. */
export function cancelarGravacaoEmAndamento(): void {
  gravadorEmUso?.cancelar();
}

export class Gravador {
  estado: EstadoGravacao = 'parado';
  erro: ErroGravacao | null = null;
  segundos = 0;
  ultima: Gravacao | null = null;
  /** Avisos para a tela. */
  aoMudar: (estado: EstadoGravacao) => void = () => undefined;
  aoContar: (segundos: number) => void = () => undefined;
  /** Chamado quando a gravação termina sozinha (limite de 15 s). */
  aoPararSozinho: (g: Gravacao) => void = () => undefined;

  private recorder: MediaRecorder | null = null;
  private fluxo: MediaStream | null = null;
  private pedacos: Blob[] = [];
  private relogio = 0;
  private fim: Promise<Gravacao | null> | null = null;
  private cancelado = false;

  private mudar(e: EstadoGravacao): void {
    this.estado = e;
    this.aoMudar(e);
  }

  /** Pede o microfone e começa a gravar. */
  async iniciar(): Promise<boolean> {
    if (this.estado === 'pedindo' || this.estado === 'gravando' || this.estado === 'processando') return false;
    if (!podeGravar()) {
      this.erro = 'nao-suportado';
      this.mudar('erro');
      return false;
    }
    if (gravadorEmUso && gravadorEmUso !== this) gravadorEmUso.cancelar();
    gravadorEmUso = this;
    this.erro = null;
    this.cancelado = false;
    this.mudar('pedindo');
    try {
      this.fluxo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
    } catch (e) {
      this.erro = tipoDeErro(e);
      this.mudar('erro');
      return false;
    }
    if (this.cancelado) {
      this.desligarMicrofone();
      return false;
    }
    const formato = formatoDeGravacao();
    try {
      this.recorder = new MediaRecorder(this.fluxo, formato ? { mimeType: formato } : undefined);
    } catch {
      this.recorder = new MediaRecorder(this.fluxo);
    }
    const recorder = this.recorder;
    this.pedacos = [];
    recorder.ondataavailable = (ev) => {
      if (ev.data && ev.data.size > 0) this.pedacos.push(ev.data);
    };
    // O arquivo só é montado aqui, no "stop", com todos os pedaços já recebidos.
    this.fim = new Promise((resolve) => {
      recorder.onstop = () => {
        const mime = recorder.mimeType || formato || this.pedacos[0]?.type || 'audio/webm';
        const blob = new Blob(this.pedacos, { type: mime });
        this.desligarMicrofone();
        if (this.cancelado || blob.size === 0) {
          if (!this.cancelado) {
            this.erro = 'falhou';
            this.mudar('erro');
          }
          resolve(null);
          return;
        }
        this.ultima = { blob, mime };
        resolve(this.ultima);
      };
    });
    recorder.start(1000); // pedaços a cada segundo: nada se perde se o aparelho for lento
    this.segundos = 0;
    this.mudar('gravando');
    this.aoContar(0);
    this.relogio = window.setInterval(() => {
      this.segundos++;
      this.aoContar(this.segundos);
      if (this.segundos >= LIMITE_SEGUNDOS) {
        void this.parar().then((g) => g && this.aoPararSozinho(g));
      }
    }, 1000);
    return true;
  }

  /** Para de gravar e devolve o áudio (ou null se nada foi gravado). */
  async parar(): Promise<Gravacao | null> {
    if (this.estado !== 'gravando' || !this.recorder) return null;
    clearInterval(this.relogio);
    this.mudar('processando');
    const fim = this.fim;
    try {
      if (this.recorder.state !== 'inactive') {
        this.recorder.requestData?.();
        this.recorder.stop();
      }
    } catch {
      /* já parado */
    }
    const g = fim ? await fim : null;
    if (gravadorEmUso === this) gravadorEmUso = null;
    return g;
  }

  /** O áudio foi salvo e tocado: pronto para ouvir de novo. */
  marcarPronto(): void {
    this.mudar('pronto');
  }

  /** Para sem salvar (ex.: o estudante saiu da tela). */
  cancelar(): void {
    this.cancelado = true;
    clearInterval(this.relogio);
    try {
      if (this.recorder && this.recorder.state !== 'inactive') this.recorder.stop();
    } catch {
      /* nada */
    }
    this.desligarMicrofone();
    if (gravadorEmUso === this) gravadorEmUso = null;
    if (this.estado === 'pedindo' || this.estado === 'gravando' || this.estado === 'processando') this.mudar(this.ultima ? 'pronto' : 'parado');
  }

  private desligarMicrofone(): void {
    this.fluxo?.getTracks().forEach((t) => t.stop());
    this.fluxo = null;
  }
}
