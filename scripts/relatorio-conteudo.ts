// Relatório: lista o que do conteúdo NÃO passa na regra de progressão
// (na própria aula em que aparece) e confere a divisão silábica.
// Uso: npx tsx scripts/relatorio-conteudo.ts
import { readFileSync } from 'node:fs';
import type { Conteudo } from '../src/conteudo/tipos';
import { conhecimentoDaAula, problemasDoTexto } from '../src/conteudo/progressao';
import { silabar } from '../src/conteudo/silabas';

const c: Conteudo = JSON.parse(readFileSync(new URL('../conteudo_licoes.json', import.meta.url), 'utf8'));
let total = 0;
for (const a of c.aulas) {
  const k = conhecimentoDaAula(a);
  const itens: string[] = [
    ...(a.silabas ?? []),
    ...(a.palavras ?? []),
    ...(a.textos ?? []).flat(),
    ...(a.ditado ?? []),
    ...(a.completar ?? []).flatMap((x) => [x.frase.replace('____', x.resposta ?? '___'), ...x.opcoes]),
    ...(a.formar ?? []).flatMap((x) => [x.palavra, ...x.partes]),
    ...(a.ligar ?? []).flatMap((x) => [...x.esquerda, ...x.direita]),
    ...(a.contas ?? []).map((x) => x.conta),
    ...(a.produtos ?? []).flatMap((x) => [x.produto, x.preco]),
    ...(a.horas ?? []),
  ];
  for (const t of itens) {
    const p = problemasDoTexto(t, k);
    if (p.length) {
      total++;
      console.log(`Aula ${a.aula}: ${t}  →  ${p.join('; ')}`);
    }
  }
}
console.log('Itens que não passam:', total);
// Divisão silábica conferida com o caderno
let erros = 0;
for (const a of c.aulas) {
  for (const f of a.formar ?? []) {
    const s = silabar(f.palavra).join('-');
    if (s !== f.partes.join('-')) { erros++; console.log('FORMAR', f.palavra, s, '≠', f.partes.join('-')); }
  }
  for (const l of a.ligar ?? []) for (const d of l.direita) if (d.includes(' + ')) {
    const w = d.split(' + ').join('');
    const s = silabar(w).join('-');
    if (s !== d.split(' + ').join('-')) { erros++; console.log('LIGAR', w, s, '≠', d); }
  }
}
console.log('Divisões diferentes do caderno:', erros);
