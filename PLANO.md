# Plano de construção — Caderno Prática

Plano curto, seguido na ordem. Cada etapa termina com um commit.

1. **Estrutura do PWA e navegação**
   - Vite + TypeScript puro (sem framework). Fonte Atkinson Hyperlegible local.
   - `conteudo_licoes.json` fica na raiz; o app o baixa em tempo de execução (nada fixo no código).
   - Telas: início, escolher a aula (Partes → Unidades → Aulas, busca por número), abertura da aula, fim da sessão, meu progresso.
   - Manifest, ícones 192/512 (maskable), service worker (vite-plugin-pwa) e aviso "nova versão".
2. **Áudio**
   - Voz do navegador (Web Speech API), melhor voz pt-BR, velocidade 0,85.
   - Tabela de pronúncia em `src/dados/pronuncia.json` (gerada por script e editável), com vogal aberta/fechada.
   - Ordem: gravação do professor → pacote importado → voz do aparelho.
3. **Atividades de leitura** (1–7, 11–13): silabador, distratores, demonstração animada.
4. **Escrita (8), completar (9) e ligar (10).**
5. **Números e dinheiro (14–19)**: desenhos SVG próprios (objetos, notas "SEM VALOR", relógio).
6. **Modo professor**: PIN, gravar/ouvir/apagar, editar fala, exportar/importar .zip, configurações.
7. **Progresso e repetição espaçada** (Leitner por item; 70% aula / 30% revisão).
8. **Testes**: Vitest (progressão, geração, contas, pronúncia) e Playwright (aula 23 sem internet). Lighthouse.
9. **Publicação**: GitHub Actions → GitHub Pages. README para o professor.

Regra de ouro: tudo o que aparece para o estudante passa pelo validador de progressão
(`src/conteudo/progressao.ts`). O que não passa não é mostrado.
