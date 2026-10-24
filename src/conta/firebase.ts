// FIREBASE (carregado só quando a conta Google está configurada, para o app continuar leve).
//
// - Login com Google: signInWithPopup é o caminho principal. Se o popup for bloqueado,
//   ou no app instalado (tela cheia, "standalone"), usa signInWithRedirect.
// - A sessão fica guardada no aparelho (IndexedDB): o login continua valendo sem internet.
// - O progresso de cada pessoa fica no Cloud Firestore, em users/{uid}. O Firestore guarda
//   uma cópia no aparelho e envia as mudanças quando a internet volta.

import { initializeApp, type FirebaseApp } from 'firebase/app';
import {
  browserLocalPersistence,
  browserPopupRedirectResolver,
  connectAuthEmulator,
  getRedirectResult,
  GoogleAuthProvider,
  indexedDBLocalPersistence,
  initializeAuth,
  onAuthStateChanged,
  signInWithCredential,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  doc,
  getDoc,
  initializeFirestore,
  onSnapshot,
  persistentLocalCache,
  persistentMultipleTabManager,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';
import type { ConfigFirebase } from './config-firebase';
import type { Progresso } from '../dados/progresso';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let comEmulador = false;

export function iniciarFirebase(config: ConfigFirebase, emulador: string | null): void {
  if (app) return;
  app = initializeApp(config);
  auth = initializeAuth(app, {
    // Primeiro o IndexedDB (dura mais e funciona sem internet); se não houver, o localStorage.
    persistence: [indexedDBLocalPersistence, browserLocalPersistence],
    popupRedirectResolver: browserPopupRedirectResolver,
  });
  auth.languageCode = 'pt-BR';
  db = initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
  if (emulador) {
    comEmulador = true;
    connectAuthEmulator(auth, `http://${emulador}:9099`, { disableWarnings: true });
    connectFirestoreEmulator(db, emulador, 8080);
  }
}

export interface Usuario {
  uid: string;
  nome: string;
  email: string;
}

function paraUsuario(u: User): Usuario {
  return { uid: u.uid, nome: u.displayName ?? u.email ?? 'Conta Google', email: u.email ?? '' };
}

/** O app está aberto como aplicativo instalado (tela cheia)? */
function modoInstalado(): boolean {
  return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as unknown as { standalone?: boolean }).standalone === true;
}

/**
 * Só nos testes automáticos, com o emulador do Firebase: o teste escolhe a conta Google
 * (window.__contaGoogleDeTeste) e o emulador aceita uma credencial simulada. A janela do
 * Google precisa de apis.google.com, que o ambiente de testes não alcança.
 */
function contaDeTeste(): Record<string, unknown> | null {
  if (!comEmulador) return null;
  return (window as unknown as { __contaGoogleDeTeste?: Record<string, unknown> }).__contaGoogleDeTeste ?? null;
}

const ERROS_DE_POPUP = ['auth/popup-blocked', 'auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported'];

/** Entra com Google. Devolve o usuário, ou null se o app foi para a página do Google (redirect). */
export async function entrarComGoogle(): Promise<Usuario | null> {
  const teste = contaDeTeste();
  if (teste) {
    const r = await signInWithCredential(auth, GoogleAuthProvider.credential(JSON.stringify(teste)));
    return paraUsuario(r.user);
  }
  const provedor = new GoogleAuthProvider();
  provedor.setCustomParameters({ prompt: 'select_account' });
  if (modoInstalado()) {
    await signInWithRedirect(auth, provedor);
    return null;
  }
  try {
    const r = await signInWithPopup(auth, provedor);
    return paraUsuario(r.user);
  } catch (e) {
    const codigo = (e as { code?: string }).code ?? '';
    if (ERROS_DE_POPUP.includes(codigo)) {
      await signInWithRedirect(auth, provedor);
      return null;
    }
    throw e;
  }
}

/** Depois de voltar da página do Google (redirect). */
export async function resultadoDoRedirect(): Promise<Usuario | null> {
  const r = await getRedirectResult(auth);
  return r ? paraUsuario(r.user) : null;
}

export function observarUsuario(cb: (u: Usuario | null) => void): () => void {
  return onAuthStateChanged(auth, (u) => cb(u ? paraUsuario(u) : null));
}

export async function sairDoFirebase(): Promise<void> {
  await signOut(auth);
}

// ---------- Progresso no Firestore: users/{uid} ----------

export async function lerProgressoDaConta(uid: string): Promise<Progresso | null> {
  try {
    const d = await getDoc(doc(db, 'users', uid));
    return (d.exists() ? (d.data().progresso as Progresso) : null) ?? null;
  } catch {
    return null; // sem internet e sem cópia no aparelho: segue com o progresso local
  }
}

export async function salvarProgressoNaConta(uid: string, p: Progresso): Promise<void> {
  // Sem internet, o Firestore guarda a gravação no aparelho e envia quando a conexão voltar.
  await setDoc(doc(db, 'users', uid), { progresso: p, atualizadoEm: serverTimestamp(), versao: 1 }, { merge: true });
}

/** Avisa quando o progresso da conta muda (por exemplo, praticado em outro aparelho). */
export function observarProgressoDaConta(uid: string, cb: (p: Progresso) => void): () => void {
  return onSnapshot(doc(db, 'users', uid), (d) => {
    if (d.exists() && !d.metadata.hasPendingWrites && d.data().progresso) cb(d.data().progresso as Progresso);
  });
}
