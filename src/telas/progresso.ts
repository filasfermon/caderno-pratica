// Meu progresso: por Parte e Unidade, quais aulas já foram praticadas e quantas vezes.
// Em linguagem simples, para o estudante mostrar ao professor.

import { el } from '../util/dom';
import { anunciar, mostrarTela, obterConteudo, topo } from '../app';
import { progresso } from '../dados/progresso';

export function telaProgresso(): void {
  const c = obterConteudo();
  const p = progresso();
  const praticadas = c.aulas.filter((a) => p.aulas[a.aula]?.vezes).length;
  const fala =
    praticadas === 0
      ? 'Aqui aparecem as aulas que você praticar.'
      : `Você já praticou ${praticadas} ${praticadas === 1 ? 'aula' : 'aulas'}. Mostre esta tela ao professor.`;
  const partes = c.partes.map((parte) => {
    const aulasDaParte = c.aulas.filter((a) => a.parte === parte.parte);
    const feitas = aulasDaParte.filter((a) => p.aulas[a.aula]?.vezes).length;
    const unidades = [...new Set(aulasDaParte.map((a) => a.unidade))].map((u) => {
      const nome = c.unidades.find((x) => x.unidade === u)?.nome ?? '';
      return el(
        'div',
        { class: 'unidade-progresso' },
        el('h3', {}, `UNIDADE ${u} · ${nome}`),
        el(
          'ul',
          { class: 'linhas-progresso' },
          ...aulasDaParte
            .filter((a) => a.unidade === u)
            .map((a) => {
              const vezes = p.aulas[a.aula]?.vezes ?? 0;
              return el(
                'li',
                {},
                el('span', {}, `AULA ${a.aula}`),
                vezes
                  ? el('span', { class: 'sim' }, `✓ PRATICADA ${vezes} ${vezes === 1 ? 'VEZ' : 'VEZES'}`)
                  : el('span', { class: 'nao' }, 'AINDA NÃO'),
              );
            }),
        ),
      );
    });
    return el(
      'details',
      { class: 'parte', open: feitas > 0 },
      el('summary', {}, `PARTE ${parte.parte} · ${parte.nome} — ${feitas} DE ${aulasDaParte.length}`),
      ...unidades,
    );
  });
  mostrarTela(
    'Meu progresso',
    topo({ titulo: 'MEU PROGRESSO', voltar: '#/', fala }),
    el('p', { class: 'resumo-progresso' }, praticadas === 0 ? 'VOCÊ AINDA NÃO PRATICOU NENHUMA AULA.' : `VOCÊ JÁ PRATICOU ${praticadas} ${praticadas === 1 ? 'AULA' : 'AULAS'}.`),
    el('div', {}, ...partes),
  );
  anunciar(fala);
}
