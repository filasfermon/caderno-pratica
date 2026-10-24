// Animações: seguem a preferência do celular ("reduzir movimento" nas configurações
// de acessibilidade). Nada é guardado no aparelho.

export function animacoesLigadas(): boolean {
  return !(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}
