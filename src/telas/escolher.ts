// Escolher a aula: Partes → Unidades → Aulas. A busca aceita só o número da aula.

import { el } from '../util/dom';
import { icones } from '../ui/icones';
import { anunciar, irPara, mostrarTela, obterConteudo, textoPaginas, topo } from '../app';
import type { Aula } from '../conteudo/tipos';
import { aulaDisponivel } from '../atividades/disponiveis';

/** Só as aulas que têm atividades no app (sem as excluídas). Nenhuma aula é trancada. */
function disponivel(a: Aula): boolean {
  return aulaDisponivel(obterConteudo(), a);
}

/** Aulas disponíveis, conferindo só as que passam no filtro (as telas abrem mais rápido). */
function disponiveis(filtro: (a: Aula) => boolean): Aula[] {
  return obterConteudo().aulas.filter((a) => filtro(a) && disponivel(a));
}

function busca(): HTMLElement {
  const entrada = el('input', {
    type: 'text',
    inputmode: 'numeric',
    pattern: '[0-9]*',
    autocomplete: 'off',
    id: 'busca-aula',
    'aria-describedby': 'aviso-busca',
  }) as HTMLInputElement;
  const aviso = el('p', { id: 'aviso-busca', class: 'aviso', 'aria-live': 'polite', hidden: true });
  const formulario = el(
    'form',
    { class: 'busca', role: 'search' },
    el('label', { for: 'busca-aula' }, 'NÚMERO DA AULA', entrada),
    el('button', { type: 'submit', class: 'botao principal' }, 'IR'),
  );
  formulario.addEventListener('submit', (e) => {
    e.preventDefault();
    const n = parseInt(entrada.value.replace(/\D/g, ''), 10);
    const aula = obterConteudo().aulas.find((a) => a.aula === n);
    const existe = !!aula;
    if (aula && disponivel(aula)) irPara(`#/aula/${n}`);
    else {
      aviso.hidden = false;
      aviso.textContent = existe
        ? `A AULA ${n} É FEITA SÓ NO CADERNO. ESCOLHA OUTRA AULA.`
        : 'ESSA AULA NÃO EXISTE. DIGITE O NÚMERO QUE ESTÁ NO CADERNO.';
    }
  });
  return el('div', {}, formulario, aviso);
}

function unidadesDaParte(parte: number): number[] {
  return [...new Set(disponiveis((a) => a.parte === parte).map((a) => a.unidade))];
}

/** Tela inicial: o app abre direto aqui (sem conta, sem cadastro, sem progresso). */
export function telaPartes(): void {
  const c = obterConteudo();
  const fala = 'Escolha a parte do caderno. Ou digite o número da aula.';
  mostrarTela(
    '',
    el(
      'div',
      { class: 'inicio' },
      el('div', { class: 'marca' }, el('div', { class: 'selo', 'aria-hidden': 'true' }, 'Aa'), el('p', {}, 'CADERNO PRÁTICA', el('small', {}, c.titulo.toLocaleUpperCase('pt-BR')))),
      topo({ titulo: 'ESCOLHER A AULA', fala }),
    ),
    busca(),
    el(
      'ul',
      { class: 'lista-escolha', 'aria-label': 'Partes do caderno' },
      ...c.partes.filter((p) => c.aulas.some((a) => a.parte === p.parte && disponivel(a))).map((p) =>
        el(
          'li',
          {},
          el(
            'a',
            { class: 'botao', href: `#/escolher/parte/${p.parte}` },
            el('span', { class: 'numero' }, `${p.parte}`),
            el('span', { class: 'nome' }, el('small', {}, `PARTE ${p.parte}`), p.nome),
            icones.seguir(26),
          ),
        ),
      ),
    ),
  );
  anunciar(fala);
}

export function telaUnidades(parte: number): void {
  const c = obterConteudo();
  const p = c.partes.find((x) => x.parte === parte);
  const fala = 'Escolha a unidade.';
  mostrarTela(
    `Parte ${parte}`,
    topo({ titulo: `PARTE ${parte}${p ? ' · ' + p.nome : ''}`, voltar: '#/', fala }),
    el(
      'ul',
      { class: 'lista-escolha', 'aria-label': 'Unidades' },
      ...unidadesDaParte(parte).map((u) => {
        const nome = c.unidades.find((x) => x.unidade === u)?.nome ?? '';
        return el(
          'li',
          {},
          el(
            'a',
            { class: 'botao', href: `#/escolher/unidade/${u}` },
            el('span', { class: 'numero' }, `${u}`),
            el('span', { class: 'nome' }, el('small', {}, `UNIDADE ${u}`), nome),
            icones.seguir(26),
          ),
        );
      }),
    ),
  );
  anunciar(fala);
}

function cartaoAula(a: Aula): HTMLElement {
  return el(
    'li',
    {},
    el(
      'a',
      { class: 'cartao-aula', href: `#/aula/${a.aula}`, style: { textDecoration: 'none', color: 'inherit' } },
      el('span', { class: 'rotulo' }, `AULA ${a.aula}`),
      el('span', { class: 'paginas' }, textoPaginas(a.paginas)),
    ),
  );
}

export function telaAulasDaUnidade(unidade: number): void {
  const c = obterConteudo();
  const aulas = disponiveis((a) => a.unidade === unidade);
  const nome = c.unidades.find((x) => x.unidade === unidade)?.nome ?? '';
  const parte = aulas[0]?.parte ?? 1;
  const fala = 'Escolha a aula. O número da aula está no caderno.';
  mostrarTela(
    `Unidade ${unidade}`,
    topo({ titulo: `UNIDADE ${unidade} · ${nome}`, voltar: `#/escolher/parte/${parte}`, fala }),
    el('ul', { class: 'grade-aulas', 'aria-label': 'Aulas' }, ...aulas.map(cartaoAula)),
  );
  anunciar(fala);
}
