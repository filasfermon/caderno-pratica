// Som curto e suave de acerto, feito na hora (sem arquivo de áudio).
// Não existe som de erro: o app nunca "buzina".

let contexto: AudioContext | null = null;

export function somDeAcerto(): void {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    contexto ??= new Ctx();
    const agora = contexto.currentTime;
    // Duas notas suaves, subindo (como um "plim").
    [659.25, 880].forEach((freq, i) => {
      const osc = contexto!.createOscillator();
      const volume = contexto!.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const inicio = agora + i * 0.12;
      volume.gain.setValueAtTime(0, inicio);
      volume.gain.linearRampToValueAtTime(0.12, inicio + 0.02);
      volume.gain.exponentialRampToValueAtTime(0.001, inicio + 0.35);
      osc.connect(volume).connect(contexto!.destination);
      osc.start(inicio);
      osc.stop(inicio + 0.4);
    });
  } catch {
    /* sem som neste aparelho: tudo bem */
  }
}
