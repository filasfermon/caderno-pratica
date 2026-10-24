// Correção 6: o login usa a janela do Google (popup); se ela for bloqueada, ou no app
// instalado, usa o redirecionamento. (O Firebase é simulado aqui.)
import { beforeEach, describe, expect, it, vi } from 'vitest';

const chamadas: string[] = [];
let erroDoPopup: string | null = null;

vi.mock('firebase/app', () => ({ initializeApp: () => ({}) }));
vi.mock('firebase/firestore', () => ({
  initializeFirestore: () => ({}),
  persistentLocalCache: () => ({}),
  persistentMultipleTabManager: () => ({}),
  connectFirestoreEmulator: () => undefined,
}));
vi.mock('firebase/auth', () => ({
  initializeAuth: () => ({}),
  indexedDBLocalPersistence: {},
  browserLocalPersistence: {},
  browserPopupRedirectResolver: {},
  connectAuthEmulator: () => undefined,
  GoogleAuthProvider: class {
    setCustomParameters() {}
  },
  signInWithPopup: async () => {
    chamadas.push('popup');
    if (erroDoPopup) throw Object.assign(new Error(erroDoPopup), { code: erroDoPopup });
    return { user: { uid: 'u1', displayName: 'Maria', email: 'maria@example.com' } };
  },
  signInWithRedirect: async () => {
    chamadas.push('redirect');
  },
}));

let instalado = false;
(globalThis as any).window = { matchMedia: () => ({ matches: instalado }) };
(globalThis as any).navigator ??= {};

const fb = await import('../src/conta/firebase');
fb.iniciarFirebase({ apiKey: 'x', authDomain: 'x', projectId: 'x', appId: 'x' }, null);

beforeEach(() => {
  chamadas.length = 0;
  erroDoPopup = null;
  instalado = false;
});

describe('entrar com Google', () => {
  it('no navegador: usa a janela do Google (popup)', async () => {
    expect(await fb.entrarComGoogle()).toEqual({ uid: 'u1', nome: 'Maria', email: 'maria@example.com' });
    expect(chamadas).toEqual(['popup']);
  });

  it('popup bloqueado: vai para a página do Google (redirect)', async () => {
    erroDoPopup = 'auth/popup-blocked';
    expect(await fb.entrarComGoogle()).toBeNull();
    expect(chamadas).toEqual(['popup', 'redirect']);
  });

  it('app instalado (tela cheia): usa o redirect direto', async () => {
    instalado = true;
    expect(await fb.entrarComGoogle()).toBeNull();
    expect(chamadas).toEqual(['redirect']);
  });

  it('a pessoa fechou a janela: não insiste', async () => {
    erroDoPopup = 'auth/popup-closed-by-user';
    await expect(fb.entrarComGoogle()).rejects.toMatchObject({ code: 'auth/popup-closed-by-user' });
    expect(chamadas).toEqual(['popup']);
  });
});
