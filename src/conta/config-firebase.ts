// Configuração do Firebase, lida das variáveis de ambiente do Vite (arquivo .env ou
// as variáveis do projeto na Cloudflare Pages). Nenhum dado real fica no código.
// Sem essas variáveis, o app funciona normalmente, só com "ENTRAR SEM CONTA".

export interface ConfigFirebase {
  apiKey: string;
  authDomain: string;
  projectId: string;
  appId: string;
  messagingSenderId?: string;
}

const env = import.meta.env ?? {};

export function configFirebase(): ConfigFirebase | null {
  const c = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || undefined,
  };
  if (!c.apiKey || !c.authDomain || !c.projectId || !c.appId) return null;
  return c as ConfigFirebase;
}

export function firebaseConfigurado(): boolean {
  return configFirebase() !== null;
}

/** Para os testes: liga o app aos emuladores do Firebase (Auth e Firestore). */
export function hostDoEmulador(): string | null {
  return env.VITE_FIREBASE_EMULADOR ? String(env.VITE_FIREBASE_EMULADOR) : null;
}
