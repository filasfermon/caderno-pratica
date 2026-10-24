// Tela inicial: CONTINUAR, ESCOLHER A AULA, MEU PROGRESSO e a engrenagem do professor.

import { el } from '../util/dom';
import { icones } from '../ui/icones';
import { anunciar, botaoOuvir, mostrarTela, obterConteudo, textoPaginas } from '../app';
import { progresso } from '../dados/progresso';
import { aulasDisponiveis } from '../atividades/disponiveis';
import { opcoesDoConteudo } from '../dados/config';

const FALA = 'Toque no botão laranja para praticar.';

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
    ),
  );
  anunciar(FALA);
}
