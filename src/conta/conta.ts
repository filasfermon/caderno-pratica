// CONTA DO ESTUDANTE: "ENTRAR COM GOOGLE" ou "ENTRAR SEM CONTA".
//
// - Sem conta: o progresso fica só no celular (como sempre foi).
// - Com Google: o progresso também vai para a conta (Firestore, users/{uid}) e volta
//   em qualquer aparelho. Funciona sem internet e sincroniza quando a conexão voltar.
// - Quem entrou sem conta pode entrar com Google depois: o progresso local vai junto.
// O Firebase só é carregado quando está configurado e é usado (o app continua leve).

import { lerLocal, gravarLocal, apagarLocal } from '../dados/local';
import { aoMudarProgresso, progresso, substituirProgresso } from '../dados/progresso';
import { configFirebase, firebaseConfigurado, hostDoEmulador } from './config-firebase';
import { juntarProgressos, mesmoProgresso } from './juntar';
import type { Usuario } from './firebase';

export type ModoConta = 'google' | 'sem-conta';
export type { Usuario };

const carregarFirebase = () => import('./firebase');
type ModuloFirebase = Awaited<ReturnType<typeof carregarFirebase>>;

export function contaGoogleDisponivel(): boolean {
  return firebaseConfigurado();
}

export function modoDaConta(): ModoConta | null {
  return lerLocal<ModoConta | null>('conta-modo', null);
}

/** Nome e e-mail de quem entrou (guardados no aparelho, para mostrar mesmo sem internet). */
export function usuarioDaConta(): Usuario | null {
  return modoDaConta() === 'google' ? lerLocal<Usuario | null>('conta-usuario', null) : null;
}

/** Mostrar a tela de entrada? Só quando a conta Google está configurada e a pessoa ainda não escolheu. */
export function precisaEscolherConta(): boolean {
  return contaGoogleDisponivel() && modoDaConta() === null && !entradaPendente();
}

/** Voltando da página do Google (login por redirecionamento)? */
export function entradaPendente(): boolean {
  return lerLocal<boolean>('conta-redirect', false);
}

export function entrarSemConta(): void {
  gravarLocal('conta-modo', 'sem-conta');
}

// ---------- Firebase e sincronização ----------

let fb: ModuloFirebase | null = null;
let pararSincronia: (() => void) | null = null;
const avisos = new Set<() => void>();

/** Avisa a tela quando a conta muda (entrou, saiu). */
export function aoMudarConta(cb: () => void): () => void {
  avisos.add(cb);
  return () => avisos.delete(cb);
}

async function firebase(): Promise<ModuloFirebase> {
  if (!fb) {
    fb = await carregarFirebase();
    fb.iniciarFirebase(configFirebase()!, hostDoEmulador());
  }
  return fb;
}

/** Liga o progresso do aparelho à conta: cada mudança vai para a nuvem e vice-versa. */
function ligarSincronia(m: ModuloFirebase, u: Usuario): void {
  pararSincronia?.();
  let espera = 0;
  const enviar = () => void m.salvarProgressoNaConta(u.uid, progresso()).catch(() => undefined);
  const deixarDeOuvirLocal = aoMudarProgresso((_, motivo) => {
    clearTimeout(espera);
    if (motivo === 'apagado') enviar();
    else espera = window.setTimeout(enviar, 800);
  });
  const deixarDeOuvirConta = m.observarProgressoDaConta(u.uid, (remoto) => {
    const local = progresso();
    const junto = juntarProgressos(local, remoto);
    if (!mesmoProgresso(junto, local)) substituirProgresso(junto);
    if (!mesmoProgresso(junto, remoto)) enviar();
  });
  pararSincronia = () => {
    clearTimeout(espera);
    deixarDeOuvirLocal();
    deixarDeOuvirConta();
    pararSincronia = null;
  };
}

/** Depois de entrar: junta o progresso do aparelho com o da conta e liga a sincronização. */
async function depoisDeEntrar(m: ModuloFirebase, u: Usuario): Promise<void> {
  gravarLocal('conta-modo', 'google');
  gravarLocal('conta-usuario', u);
  apagarLocal('conta-redirect');
  const remoto = await m.lerProgressoDaConta(u.uid);
  const junto = remoto ? juntarProgressos(progresso(), remoto) : progresso();
  substituirProgresso(junto);
  void m.salvarProgressoNaConta(u.uid, junto).catch(() => undefined); // sem internet: vai depois
  ligarSincronia(m, u);
  avisos.forEach((cb) => cb());
}

export type ResultadoEntrada = 'entrou' | 'redirecionando' | 'cancelado' | 'erro';

export async function entrarComGoogle(): Promise<ResultadoEntrada> {
  if (!contaGoogleDisponivel()) return 'erro';
  try {
    const m = await firebase();
    gravarLocal('conta-redirect', true); // se o app for para a página do Google, sabemos ao voltar
    const u = await m.entrarComGoogle();
    if (!u) return 'redirecionando';
    await depoisDeEntrar(m, u);
    return 'entrou';
  } catch (e) {
    apagarLocal('conta-redirect');
    const codigo = (e as { code?: string }).code ?? '';
    return codigo === 'auth/popup-closed-by-user' || codigo === 'auth/cancelled-popup-request' ? 'cancelado' : 'erro';
  }
}

export async function sairDaConta(): Promise<void> {
  pararSincronia?.();
  try {
    if (fb) await fb.sairDoFirebase();
  } catch {
    /* sem internet: a sessão é apagada do aparelho mesmo assim */
  }
  gravarLocal('conta-modo', 'sem-conta');
  apagarLocal('conta-usuario');
  avisos.forEach((cb) => cb());
}

/**
 * Ao abrir o app: termina um login por redirecionamento e liga a sincronização de quem
 * já entrou com Google. Não trava o app: tudo acontece em segundo plano.
 */
export async function iniciarConta(): Promise<void> {
  if (!contaGoogleDisponivel()) return;
  if (modoDaConta() !== 'google' && !entradaPendente()) return;
  try {
    const m = await firebase();
    if (entradaPendente()) {
      const u = await m.resultadoDoRedirect().catch(() => null);
      if (u) await depoisDeEntrar(m, u);
      else apagarLocal('conta-redirect');
    }
    m.observarUsuario((u) => {
      if (u && modoDaConta() === 'google' && !pararSincronia) {
        gravarLocal('conta-usuario', u);
        ligarSincronia(m, u);
      }
    });
  } catch {
    apagarLocal('conta-redirect');
  }
  avisos.forEach((cb) => cb());
}
