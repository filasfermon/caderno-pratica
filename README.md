# Caderno Prática

Aplicativo para **revisar e reforçar** as aulas do *Caderno de Alfabetização · Volume 1*.
O estudante estuda a aula no caderno com o professor e, depois, pratica **a mesma aula**
sozinho, em casa, no celular. Tudo é falado em voz alta. Funciona **sem internet**
depois da primeira vez.

- Sem cadastro, sem senha do estudante, sem anúncios, sem coleta de dados.
- Tudo fica guardado só no celular.
- Tamanho: menos de 0,5 MB (sem os áudios gravados).

---

## 1. Endereço e instalação no celular

**Endereço do app:** <https://filasfermon.github.io/caderno-pratica/>
(funciona depois que a publicação for ativada — veja a seção 8, "O que falta fazer").

**Instalar no Android (Chrome):**

1. Abra o endereço acima no **Chrome**, com internet.
2. Espere a tela inicial aparecer (o app se guarda sozinho no celular).
3. Toque nos **três pontinhos ⋮** no canto de cima.
4. Toque em **"Adicionar à tela inicial"** (ou **"Instalar app"**).
5. Confirme. O ícone laranja **"Caderno Prática"** aparece na tela do celular.

Pronto: a partir daí o app abre mesmo sem internet.

> Dica: se aparecer na parte de baixo a faixa **"NOVA VERSÃO DISPONÍVEL"**,
> toque em **ATUALIZAR** (precisa de internet só nesse momento).

---

## 2. Como o estudante usa (5 passos)

1. **Toque no ícone laranja** do Caderno Prática.
2. **Toque em CONTINUAR** para voltar à última aula. Ou toque em **ESCOLHER A AULA**
   e procure o número da aula que está no caderno (dá para digitar só o número).
3. **Escute a voz.** Ela diz o número da aula e o que fazer. O botão laranja
   com alto-falante 🔊 repete a fala.
4. **Faça as atividades**, uma por tela. As bolinhas no alto mostram o caminho.
   Depois de cada atividade, toque em **SEGUIR**.
5. No fim, toque em **PRATICAR DE NOVO** ou **VOLTAR**. Em **MEU PROGRESSO**, o
   estudante mostra ao professor as aulas que já praticou (✓) e quantas vezes.

Quando o estudante erra, o app **não diz "errado"**: a voz diz *"Vamos tentar de novo"*
e repete o modelo. Se errar de novo, o app mostra a resposta certa, lê em voz alta e segue.
Não há cronômetro, pontos, vidas nem ranking.

---

## 3. O professor: gravar a própria voz e passar para os celulares

O app fala com a voz do celular. Ela é boa para palavras e frases, mas às vezes
erra sílabas soltas. Por isso o professor pode **gravar a própria voz uma vez** e
**passar o pacote de áudios** para os celulares dos estudantes.

### Entrar no modo professor

1. Na tela inicial, toque na **engrenagem ⚙** (canto de cima).
2. Na primeira vez, **crie um PIN de 4 números** (anote em lugar seguro).
   Nas outras vezes, digite o PIN.

### Gravar

1. Toque em **GRAVAÇÕES E PRONÚNCIA**.
2. Escolha a **AULA** (e, se quiser, só **SÍLABAS E LETRAS**, **PALAVRAS** ou **FRASES**).
   A primeira opção da lista traz as **instruções e frases do app** ("Escute e toque a sílaba certa", "Muito bem"...).
3. Em cada item:
   - **OUVIR**: ouve a voz que o estudante vai ouvir agora.
   - **GRAVAR** → fale → **PARAR**: grava a sua voz. O app toca a gravação para conferir.
   - **REGRAVAR**: grava de novo. **APAGAR**: volta para a voz do celular.
   - **EDITAR FALA**: muda só o texto que a voz do celular lê (a tela continua igual).
     Exemplo: a tela mostra **PE** e a voz lê *"pé"*; dá para trocar por *"pê"*.
4. A etiqueta de cada item mostra de onde vem a voz: **SUA GRAVAÇÃO**, **DO PACOTE** ou **VOZ DO APARELHO**.

Dica: grave num lugar quieto, com o celular a um palmo da boca, falando devagar e claro.

### Passar para os celulares dos estudantes

1. No seu celular: modo professor → **PACOTE DE ÁUDIOS** → **EXPORTAR GRAVAÇÕES (.ZIP)**.
   O arquivo `caderno-pratica-audios-AAAA-MM-DD.zip` vai para a pasta **Downloads**.
2. Mande o arquivo para o celular do estudante (WhatsApp, Bluetooth ou cabo).
3. No celular do estudante: modo professor → **PACOTE DE ÁUDIOS** → **IMPORTAR PACOTE (.ZIP)**
   e escolha o arquivo.
4. Pronto. O pacote novo substitui o anterior. As correções de fala também vão no pacote.

A ordem das vozes é: **gravação feita no próprio celular** → **pacote importado** → **voz do celular**.

### Configurações (só no modo professor)

- **Tamanho do texto:** normal, grande ou muito grande.
- **Velocidade da voz:** padrão 0,85 (um pouco mais devagar que o normal).
- **Vogal E e vogal O nas sílabas:** aberta (*pé, pó*) ou fechada (*pê, pô*).
- **Voz do aparelho:** automática (a melhor em português do Brasil) ou outra.
- **Atividades por sessão:** de 8 a 12 (padrão 10).
- **Animações:** ligar ou desligar.
- **Mostrar as demonstrações de novo.**
- **Progresso do estudante → Apagar o progresso:** para começar de novo ou passar o celular a outro estudante.
- **Trocar o PIN.**

---

## 4. Como atualizar o conteúdo (trocar o `conteudo_licoes.json`)

Todo o conteúdo do app (aulas, páginas, sílabas, palavras, frases, contas...) vem do
arquivo **`conteudo_licoes.json`**, na raiz deste repositório. Nada está fixo no código.

Para uma versão nova do caderno (por exemplo, com outra numeração de páginas):

1. No GitHub, abra o repositório, clique em `conteudo_licoes.json` e no lápis ✏ (editar),
   ou use **Add file → Upload files** e envie o arquivo novo **com o mesmo nome**.
2. Salve (**Commit changes**) na branch **main**.
3. A publicação roda sozinha (aba **Actions**). Em poucos minutos o app novo está no ar.
4. Nos celulares, aparece **"NOVA VERSÃO DISPONÍVEL" → ATUALIZAR**.

Se o conteúdo novo trouxer **sílabas novas**, os testes automáticos avisam (a publicação
para com a mensagem *"toda sílaba do conteúdo tem entrada"*). Quem cuida do código roda
`npm run pronuncia` para acrescentar as sílabas novas à tabela de pronúncia
(nada do que já foi corrigido à mão é apagado) e envia de novo.

### A tabela de pronúncia

Fica em `src/dados/pronuncia.json` e explica a si mesma (campo `_leia_me`):

- `silabas`: `"PA": "pá"` → a tela mostra **PA**, a voz lê *pá*. Sílabas com E ou O
  têm as duas formas: `{"aberta": "pé", "fechada": "pê"}`.
- `letras`: `"nome"` (lido nas teclas: *pê*) e `"fala"` (lido quando a letra aparece
  sozinha: *pê, de pai* — nunca o "som" da consoante isolada).
- `palavras`: siglas e palavras que a voz lê mal (`"IFCE": "í éfe cê é"`).

As correções feitas no modo professor (**EDITAR FALA**) valem por cima da tabela.

---

## 5. Para quem cuida do código

Pilha: **Vite + TypeScript** (sem framework), PWA com `vite-plugin-pwa`, `.zip` com `fflate`.
O código está comentado em português.

```bash
npm install          # instala as dependências
npm run dev          # abre o app em modo de desenvolvimento (http://localhost:5173)
npm test             # testes Vitest (regra de progressão, atividades, contas, pronúncia)
npm run test:e2e     # testes Playwright (aula 23 sem internet; modo professor)
npm run build        # gera o site na pasta dist/
npm run pronuncia    # completa a tabela de pronúncia com sílabas novas do conteúdo
npm run relatorio    # lista o que do conteúdo não aparece por causa da regra de progressão
npm run icones       # gera de novo os ícones PNG
```

Mapa rápido:

| Pasta / arquivo | O que tem |
|---|---|
| `src/conteudo/progressao.ts` | **validador da regra de progressão** |
| `src/conteudo/silabas.ts` | divisão silábica |
| `src/atividades/gerar.ts` | geração das 19 atividades a partir de cada aula |
| `src/atividades/sessao.ts` | sessão (70% aula, 30% revisão) |
| `src/dados/progresso.ts` | progresso e repetição espaçada (Leitner) |
| `src/audio/` | voz, pronúncia, gravação, pacote .zip |
| `src/atividades/telas/` | telas das atividades |
| `src/telas/` | início, escolher aula, aula/sessão, progresso, professor |
| `.github/workflows/publicar.yml` | publicação no GitHub Pages |

O caminho do site no GitHub Pages (`/NOME-DO-REPOSITORIO/`) é preenchido sozinho pelo workflow
(variável `BASE_PATH`). Se o repositório for renomeado, nada precisa mudar.

---

## 6. Decisões tomadas

Quando o pedido não definia algo, escolhi o mais simples, acessível e didático:

**Conteúdo e progressão**
- O validador confere **tudo o que aparece escrito na atividade**: sílabas, palavras,
  frases, opções erradas (distratores), teclas, contas, preços. O que não passa **não é mostrado**.
- A regra vale para o **conteúdo de leitura**. Os textos da interface (VOLTAR, SEGUIR,
  as instruções, "PREÇO", "SEM VALOR" nas notas) não seguem a progressão, porque são
  **sempre lidos em voz alta** e acompanhados de ícones — como os comandos do caderno, que o professor lê.
- Botões **SIM / NÃO** do "O dinheiro dá?" só mostram as palavras quando elas já foram
  ensinadas; antes disso, aparecem só os desenhos de mão para cima / mão para baixo (e a voz explica).
- Palavras de leitura global (como HOJE antes do H) **aparecem para ler**, mas **não** entram
  na atividade de escrever letra por letra enquanto as letras não forem ensinadas.
- Até a Parte 5 tudo fica em MAIÚSCULAS, **menos nas aulas de minúsculas** ("AS MESMAS LETRAS"),
  em que o texto fica como no caderno (é o assunto da aula), e na atividade Maiúscula/minúscula.
- Os distratores vêm do próprio conteúdo (sílabas e palavras desta aula e das anteriores),
  preferindo a mesma família (PA → PE, PO).
- "Complete a frase" com resposta `null`: vale a opção que deixa a frase igual a uma
  frase dos textos da aula; se nenhuma deixar, o item não é usado (veja a seção 7).
- Os pares do "Ligue" são descobertos sozinhos (iguais; maiúscula ↔ minúscula; palavra ↔ "LU + PA";
  número ↔ preço). Os 21 itens "ligar" do caderno foram todos ligados certo.
- **Aulas sem conteúdo praticável**: mensagem de incentivo (*"Esta aula é feita no caderno,
  com o professor..."*) e uma atividade simples: na Parte 1, um treino de como usar o app
  ("toque no botão laranja"); nas outras, uma revisão curta (4 atividades) de aulas anteriores.
- Aulas com pouco conteúdo no começo do caderno (aulas 8 a 10, só vogais) repetem as
  atividades da aula para chegar a 8 atividades.

**Atividades**
- Nas atividades de **escolher** (escute e toque, complete...), as opções **não falam** ao
  serem tocadas (falar entregaria a resposta); há sempre o botão **OUVIR DE NOVO**.
  Em todas as outras telas, sílabas, palavras e frases tocadas são lidas.
- "Quantas sílabas?": o estudante escolhe **1, 2, 3 ou 4** (só palavras de até 4 sílabas).
- "Escreva a palavra": nas Partes 3 (Unidades 5 a 7) as teclas são **sílabas**; da Parte 4
  em diante, **letras** — só as letras da palavra mais algumas já ensinadas (8 a 12 teclas),
  em ordem alfabética, para caber grande na tela. **ÃO** é uma tecla só. Itens de ditado
  com mais de uma palavra ("O PAI LEU") não entram na escrita.
- "Ligue": em cada item, depois de 2 tentativas erradas, o app mostra o par certo.
- "Pague com notas": qualquer combinação certa vale; o total juntado aparece na tela.
- "Troco": as moedas e notas aparecem uma a uma, **contando a partir do preço** até o
  valor pago (como no caixa). Os valores vêm das contas de diminuir com R$ do caderno.
- "O dinheiro dá?": como o caderno não traz "dinheiro na mão", o app usa o preço de
  **outro produto da mesma aula** como dinheiro na mão (valores do próprio conteúdo).
- "Conte": acima de 20, as dezenas aparecem em "pacotes de 10".
- Demonstração animada (uma mão que toca na resposta) na **primeira vez** de cada tipo
  de atividade, com a faixa **VEJA COMO SE FAZ** (expressão do caderno) e botão **PULAR**.

**Voz**
- Vogal **aberta** (pé, pó) é o padrão nas sílabas, mais próxima da fala do Ceará; o professor pode trocar.
- O texto mandado para a voz vai sempre em minúsculas (a voz às vezes soletra palavras em MAIÚSCULAS).
- A gravação do estudante ("ouça e repita") **não é guardada**: fica só na tela, até sair dela.

**Repetição espaçada (Leitner, por item)**
- Cada item tem uma caixa de 1 a 5. Acertou de primeira → sobe uma caixa; errou → caixa 1.
  Caixa 1 volta na próxima sessão; 2 → em 2 sessões; 3 → 4; 4 → 8; 5 → 16.
- A revisão (cerca de 30% da sessão) pega primeiro os itens vencidos (os errados antes)
  e completa com itens das aulas anteriores mais próximas.

**Outros**
- "Restaurar o progresso do estudante" = **apagar o progresso** (começar do zero), com confirmação.
- PIN guardado como resumo criptográfico (SHA-256), só no aparelho.
- Os endereços usam `#` (ex.: `#/aula/23`), que funcionam no GitHub Pages e sem internet.

---

## 7. O que falta no conteúdo (conferência do `conteudo_licoes.json`)

Li o arquivo inteiro e conferi se tudo o que o app precisa tem de onde sair:

- **Aulas sem nada para praticar no app** (o app mostra a mensagem e a atividade simples):
  1, 2, 3, 4, 5, 6, 7, 12, 20, 35, 55, 57, 58, 82, 136, 145, 150.
  - Aula 5 traz as letras dos traços, e a aula 7 as vogais, **antes** de elas aparecerem em
    `letras_conhecidas` — pela regra de progressão, o app não as mostra nessas aulas.
  - Aula 82 ("O troco") e aula 145 ("A conta de luz") **não têm contas nem dados**.
    O troco é praticado com as contas de diminuir com R$ das aulas 81, 88, 140 e 144.
- **Não existe campo "dinheiro na mão"** para "O dinheiro dá?" (veja as decisões).
- **Produtos** só nas aulas 54, 88 e 106; **horas** só na aula 97 (4 horários).
- **"Complete a frase" sem resposta e sem frase igual nos textos** (não usados):
  aula 51 "____ PANO."; aula 52 "EU LEVO A ____ ."; aula 86 "EU VOU ____ RIO.";
  aula 89 "A ____ DA AULA."; aula 135 "NO SÁBADO, EU TOMO ____ ." e "NO ____ TEM ARROZ.";
  aula 138 "Eu trabalho no IFCE ____" e "Que alegria ____".
  Para usá-los, basta preencher `"resposta"` no JSON.
- A **Parte 6** quase não tem sílabas e palavras soltas; as sessões dela são feitas de
  textos (Leia, Ordene), contas e revisão.
- `letras_conhecidas` a partir da aula 124 começa com uma vírgula (`",ABC..."`); o app ignora.
- Todas as contas do JSON foram recalculadas pelos testes e **estão certas**.
- Todas as divisões silábicas do caderno (campo `formar` e os `"LU + PA"`) batem com o silabador do app.

---

## 8. O que falta fazer (para publicar)

1. **Dar acesso ao GitHub**: o envio (push) deste trabalho foi recusado porque o app Claude
   não tem acesso ao repositório. Reconecte o GitHub em <https://claude.ai/connect-github>
   e instale o app Claude no repositório `filasfermon/caderno-pratica`.
2. **Juntar o trabalho na branch `main`** (abrir e aceitar um *pull request* da branch
   `claude/determined-brown-2nhf40`).
3. **Ativar o GitHub Pages**: no repositório, **Settings → Pages → Build and deployment →
   Source: GitHub Actions**.
4. Esperar a publicação terminar (aba **Actions**, "Publicar no GitHub Pages") e abrir
   <https://filasfermon.github.io/caderno-pratica/>.

---

## 9. Limitações conhecidas

- A qualidade da voz depende do celular. Se o celular não tiver voz em português, o app
  funciona em silêncio — por isso o pacote de áudios do professor é importante.
  (No Android: Configurações → Idioma → Saída de texto para fala → Google → instalar *Português (Brasil)*.)
- Sílabas com LH e NH sozinhas (LHA, NHA) costumam soar estranhas na voz sintetizada: vale gravar.
- O destaque palavra por palavra (karaokê) usa os avisos da própria voz; quando o celular
  não manda esses avisos, o destaque segue pelo relógio e pode ficar um pouco adiantado ou atrasado.
- Gravar voz precisa do Chrome atualizado e da permissão do microfone.
- O progresso fica só naquele celular: se o app for desinstalado ou os dados do Chrome forem
  apagados, o progresso e as gravações se perdem (o pacote .zip do professor serve de cópia dos áudios).
- O histórico de commits foi organizado por etapa (1 a 9); os arquivos de cada etapa foram
  escritos juntos e depois separados nos commits, então commits intermediários podem não montar sozinhos.

---

## 10. Testes e notas de qualidade

| Verificação | Resultado |
|---|---|
| Vitest (5 arquivos, 43 testes) | ✅ todos passam |
| — validador de progressão em **todas** as atividades de **todas** as 150 aulas (3 sorteios cada) e em sessões com revisão | ✅ 0 problemas (mais de 10.000 textos conferidos) |
| — geração das atividades (os 19 tipos), sessões de 8 a 12, 70/30, Leitner | ✅ |
| — contas: toda resposta gerada = resultado do JSON; troco; pagar | ✅ |
| — tabela de pronúncia sem lacunas (262 sílabas) | ✅ |
| Playwright: abre o app, **sem internet** escolhe a aula 23 e faz a sessão inteira | ✅ |
| Playwright: modo professor — PIN, gravar (microfone simulado), exportar .zip, importar em outro aparelho | ✅ |
| Lighthouse 11 (celular), páginas início, escolher, aula 23, progresso | **PWA 100 · Acessibilidade 100 · Boas práticas 100 · Desempenho 99** |
| axe-core (WCAG 2 A/AA) em 37 telas, incluindo todas as atividades | ✅ 0 violações |
| Tamanho do app publicado (sem áudios) | 0,44 MB (limite: 2 MB) |

Telas testadas em 360 × 640 (Android pequeno), em retrato, nos três tamanhos de texto.

---

## Créditos

- Fonte **Atkinson Hyperlegible** (Braille Institute), licença SIL Open Font License 1.1
  (`src/fontes/LICENCA-OFL.txt`).
- Atividades inspiradas no modelo do aplicativo Silabando, adaptadas para adultos.
