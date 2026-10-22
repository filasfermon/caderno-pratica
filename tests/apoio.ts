// Carrega o conteudo_licoes.json para os testes.
import { readFileSync } from 'node:fs';
import type { Conteudo } from '../src/conteudo/tipos';

export const conteudo: Conteudo = JSON.parse(readFileSync(new URL('../conteudo_licoes.json', import.meta.url), 'utf8'));

export function aula(n: number) {
  const a = conteudo.aulas.find((x) => x.aula === n);
  if (!a) throw new Error(`Aula ${n} não existe`);
  return a;
}
