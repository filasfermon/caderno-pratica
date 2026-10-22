// Gravação de voz pelo microfone (MediaRecorder).
// Usada pelo professor (gravar os modelos) e pelo estudante ("Ouça e repita").

export interface Gravacao {
  blob: Blob;
  mime: string;
}

export interface GravadorAtivo {
  parar(): Promise<Gravacao>;
  cancelar(): void;
}

export function podeGravar(): boolean {
  return typeof window !== 'undefined' && 'MediaRecorder' in window && !!navigator.mediaDevices?.getUserMedia;
}

function melhorFormato(): string {
  const opcoes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus'];
  return opcoes.find((m) => MediaRecorder.isTypeSupported?.(m)) ?? '';
}

/** Começa a gravar. Pede licença do microfone na primeira vez. */
export async function comecarGravacao(): Promise<GravadorAtivo> {
  const fluxo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const formato = melhorFormato();
  const gravador = new MediaRecorder(fluxo, formato ? { mimeType: formato } : undefined);
  const pedacos: Blob[] = [];
  gravador.ondataavailable = (e) => {
    if (e.data.size > 0) pedacos.push(e.data);
  };
  const desligarMicrofone = () => fluxo.getTracks().forEach((t) => t.stop());
  gravador.start();
  return {
    parar: () =>
      new Promise((resolve) => {
        gravador.onstop = () => {
          desligarMicrofone();
          const mime = gravador.mimeType || formato || 'audio/webm';
          resolve({ blob: new Blob(pedacos, { type: mime }), mime });
        };
        gravador.stop();
      }),
    cancelar: () => {
      try {
        gravador.stop();
      } catch {
        /* já parado */
      }
      desligarMicrofone();
    },
  };
}
