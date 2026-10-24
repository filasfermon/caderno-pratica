// Tela de entrada: ENTRAR COM GOOGLE ou ENTRAR SEM CONTA.
// Só aparece quando a conta Google está configurada (variáveis do Firebase) e a pessoa
// ainda não escolheu. Muitos estudantes não têm ou não lembram a conta: sem conta funciona igual.

import { el } from '../util/dom';
import { icones } from '../ui/icones';
import { anunciar, botaoOuvir, irPara, mostrarTela } from '../app';
import { aoMudarConta, entradaPendente, entrarComGoogle, entrarSemConta } from '../conta/conta';
import { falar } from '../audio/voz';

export const FALA_ENTRADA =
  'Para guardar o seu progresso na sua conta Google, toque em entrar com Google. Se não tiver conta, toque em entrar sem conta.';

/** Botão grande ENTRAR COM GOOGLE (também usado na tela inicial). */
export function botaoEntrarComGoogle(aviso: HTMLElement, depois: () => void): HTMLButtonElement {
  const botao = el('button', { type: 'button', class: 'botao principal botao-google', 'data-entrar-google': '' }, el('span', { class: 'fundo-g' }, icones.google(30)), 'ENTRAR COM GOOGLE');
  botao.addEventListener('click', async () => {
    botao.disabled = true;
    aviso.hidden = false;
    aviso.textContent = 'ENTRANDO...';
    const r = await entrarComGoogle();
    botao.disabled = false;
    if (r === 'entrou') return depois();
    if (r === 'redirecionando') return; // o app vai para a página do Google e volta sozinho
    const texto =
      r === 'cancelado'
        ? 'A entrada não foi concluída. Tente de novo ou entre sem conta.'
        : 'Não foi possível entrar agora. Confira a internet e tente de novo, ou entre sem conta.';
    aviso.textContent = texto.toLocaleUpperCase('pt-BR');
    void falar({ categoria: 'retorno', texto });
  });
  return botao;
}

export function telaEntrada(): void {
  const aviso = el('p', { class: 'aviso', 'aria-live': 'polite', hidden: true });
  const semConta = el('button', { type: 'button', class: 'botao', 'data-entrar-sem-conta': '' }, icones.seguir(28), 'ENTRAR SEM CONTA');
  semConta.addEventListener('click', () => {
    entrarSemConta();
    irPara('#/');
  });
  const voltando = entradaPendente();
  mostrarTela(
    'Entrar',
    el(
      'section',
      { class: 'entrada', 'data-entrada': '' },
      el('div', { class: 'marca' }, el('div', { class: 'selo', 'aria-hidden': 'true' }, 'Aa'), el('h1', {}, 'CADERNO PRÁTICA')),
      el('p', { class: 'objetivo' }, 'ENTRE COM A SUA CONTA GOOGLE PARA GUARDAR O PROGRESSO EM QUALQUER CELULAR. OU ENTRE SEM CONTA: O PROGRESSO FICA SÓ NESTE CELULAR.'),
      el('div', { style: { display: 'flex', justifyContent: 'center' } }, botaoOuvir(() => FALA_ENTRADA)),
      el('div', { class: 'pilha' }, botaoEntrarComGoogle(aviso, () => irPara('#/')), semConta),
      aviso,
    ),
  );
  if (voltando) {
    // Voltando da página do Google: espera o login terminar e segue para o início.
    aviso.hidden = false;
    aviso.textContent = 'ENTRANDO...';
    const parar = aoMudarConta(() => {
      if (!entradaPendente()) {
        parar();
        irPara('#/');
      }
    });
  } else anunciar(FALA_ENTRADA);
}
