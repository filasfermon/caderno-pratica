// Banco de dados do aparelho (IndexedDB). Guarda os áudios, que são grandes demais
// para o localStorage. Nada sai do aparelho.
//
// "Gavetas" (object stores):
//   gravacoes     → áudios gravados pelo professor neste aparelho (camada a)
//   pacote        → áudios do pacote .zip importado (camada b)
//   falas         → textos falados editados pelo professor (correções de pronúncia)
//   falas_pacote  → textos falados que vieram no pacote importado

export type Gaveta = 'gravacoes' | 'pacote' | 'falas' | 'falas_pacote';

export interface Audio {
  chave: string;
  texto: string;
  blob: Blob;
  mime: string;
  data: number;
}

export interface Fala {
  chave: string;
  fala: string;
}

const NOME = 'caderno-pratica';
const VERSAO = 1;
let abertura: Promise<IDBDatabase> | null = null;

function abrir(): Promise<IDBDatabase> {
  if (abertura) return abertura;
  abertura = new Promise((resolve, reject) => {
    const pedido = indexedDB.open(NOME, VERSAO);
    pedido.onupgradeneeded = () => {
      const db = pedido.result;
      for (const g of ['gravacoes', 'pacote', 'falas', 'falas_pacote']) {
        if (!db.objectStoreNames.contains(g)) db.createObjectStore(g, { keyPath: 'chave' });
      }
    };
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
  return abertura;
}

function promessa<T>(pedido: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    pedido.onsuccess = () => resolve(pedido.result);
    pedido.onerror = () => reject(pedido.error);
  });
}

async function gaveta(nome: Gaveta, modo: IDBTransactionMode): Promise<IDBObjectStore> {
  const db = await abrir();
  return db.transaction(nome, modo).objectStore(nome);
}

export async function ler<T>(nome: Gaveta, chave: string): Promise<T | undefined> {
  try {
    return await promessa((await gaveta(nome, 'readonly')).get(chave) as IDBRequest<T | undefined>);
  } catch {
    return undefined; // sem IndexedDB (navegação privada, por exemplo): segue sem áudio gravado
  }
}

export async function lerTodos<T>(nome: Gaveta): Promise<T[]> {
  try {
    return await promessa((await gaveta(nome, 'readonly')).getAll() as IDBRequest<T[]>);
  } catch {
    return [];
  }
}

export async function listarChaves(nome: Gaveta): Promise<string[]> {
  try {
    return (await promessa((await gaveta(nome, 'readonly')).getAllKeys())) as string[];
  } catch {
    return [];
  }
}

export async function guardar<T>(nome: Gaveta, valor: T): Promise<void> {
  await promessa((await gaveta(nome, 'readwrite')).put(valor));
}

export async function apagar(nome: Gaveta, chave: string): Promise<void> {
  await promessa((await gaveta(nome, 'readwrite')).delete(chave));
}

export async function esvaziar(nome: Gaveta): Promise<void> {
  await promessa((await gaveta(nome, 'readwrite')).clear());
}
