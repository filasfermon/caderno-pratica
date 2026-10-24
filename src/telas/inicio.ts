// Tela inicial: CONTINUAR, ESCOLHER A AULA, MEU PROGRESSO e a engrenagem do professor.

import { el } from '../util/dom';
import { icones } from '../ui/icones';
import { anunciar, botaoOuvir, mostrarTela, obterConteudo, textoPaginas } from '../app';
import { progresso } from '../dados/progresso';
import { aulasDisponiveis } from '../atividades/disponiveis';
import { opcoesDoConteudo } from '../dados/config';
import { contaGoogleDisponivel, sairDaConta, usuarioDaConta } from '../conta/conta';
import { botaoEntrarComGoogle } from './entrada';

const FALA = 'Toque no botão laranja para praticar.';

/** Conta Google (só aparece quando está configurada): quem entrou, ou o botão para entrar. */
function blocoDaConta(): HTMLElement | null {
  if (!contaGoogleDisponivel()) return null;
  const u = usuarioDaConta();
  if (u) {
    const sair = el('button', { type: 'button', class: 'botao-icone contorno', 'data-sair-conta': '' }, 'SAIR DA CONTA');
    sair.addEventListener('click', async () => {
      await sairDaConta();
      telaInicio();
    });
    return el(
      'div',
      { class: 'conta', 'data-conta': 'google' },
      el('p', {}, icones.google(22), el('span', {}, 'PROGRESSO GUARDADO NA CONTA: ', el('strong', {}, u.nome.toLocaleUpperCase('pt-BR')))),
      sair,
    );
  }
  const aviso = el('p', { class: 'aviso', 'aria-live': 'polite', hidden: true });
  return el(
    'div',
    { class: 'conta', 'data-conta': 'sem-conta' },
    el('p', {}, 'SEM CONTA: O PROGRESSO FICA SÓ NESTE CELULAR.'),
    botaoEntrarComGoogle(aviso, () => telaInicio()),
    aviso,
  );
}

export function telaInicio(): void {
  const c = obterConteudo();
  const lista = aulasDisponiveis(c, opcoesDoConteudo());
  const ultima = progresso().ultimaAula;
  const aula = lista.find((a) => a.aula === ultima) ?? lista[0] ?? c.aulas[0];
  const continuar = el(
    'a',
    { class: 'botao principal', href: `#/aula/${aula.aula}`, 'data-continuar': '' },
    icones.seguir(36),
    el('span', { class: 'coluna' }, ultima && aula.aula === ultima ? 'CONTINUAR' : 'COMEÇAR', el('small', {}, `AULA ${aula.aula} · ${textoPaginas(aula.paginas)}`)),
  );
  mostrarTela(
    '',
    el(
      'div',
      { class: 'inicio' },
      el(
        'header',
        { class: 'topo' },
        el('div', { class: 'marca' }, el('div', { class: 'selo', 'aria-hidden': 'true' }, 'Aa'), el('div', {}, el('h1', {}, 'CADERNO PRÁTICA'), el('p', {}, c.titulo.toLocaleUpperCase('pt-BR')))),
        el('span', { class: 'espaco' }),
        el('a', { class: 'botao-icone', href: '#/professor', 'aria-label': 'Professor' }, icones.engrenagem(30)),
      ),
      el('div', { style: { display: 'flex', justifyContent: 'center' } }, botaoOuvir(() => FALA)),
      el(
        'nav',
        { class: 'pilha', 'aria-label': 'Menu principal' },
        continuar,
        el('a', { class: 'botao', href: '#/escolher' }, icones.lista(30), 'ESCOLHER A AULA'),
        el('a', { class: 'botao', href: '#/progresso' }, icones.estrela(30), 'MEU PROGRESSO'),
      ),
      blocoDaConta(),
    ),
  );
  anunciar(FALA);
}
