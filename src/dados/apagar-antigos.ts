// O app não guarda nenhum dado no aparelho. Versões antigas guardavam progresso,
// configurações, PIN e gravações (localStorage e IndexedDB). Ao abrir, esta versão
// apaga o que tiver sobrado delas, para não ficar nenhum registro de ninguém.
// Só apaga o que é deste app (as chaves "caderno-pratica:" e o banco "caderno-pratica"):
// no GitHub Pages, outros sites do mesmo endereço podem usar o mesmo armazenamento.

const PREFIXO_ANTIGO = 'caderno-pratica:';
const BANCO_ANTIGO = 'caderno-pratica';

export function apagarDadosDeVersoesAntigas(): void {
  try {
    const chaves: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(PREFIXO_ANTIGO)) chaves.push(k);
    }
    chaves.forEach((k) => localStorage.removeItem(k));
  } catch {
    /* armazenamento bloqueado: não há o que apagar */
  }
  try {
    // Apagar um banco que não existe não cria nada.
    indexedDB?.deleteDatabase(BANCO_ANTIGO);
  } catch {
    /* sem IndexedDB: não há o que apagar */
  }
}
