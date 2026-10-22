// Leitura e escrita simples no localStorage, à prova de falhas
// (em alguns navegadores o armazenamento pode estar bloqueado).

const PREFIXO = 'caderno-pratica:';

export function lerLocal<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(PREFIXO + chave);
    return bruto === null ? padrao : (JSON.parse(bruto) as T);
  } catch {
    return padrao;
  }
}

export function gravarLocal<T>(chave: string, valor: T): void {
  try {
    localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch {
    /* sem espaço ou bloqueado: o app continua funcionando nesta sessão */
  }
}

export function apagarLocal(chave: string): void {
  try {
    localStorage.removeItem(PREFIXO + chave);
  } catch {
    /* nada a fazer */
  }
}
