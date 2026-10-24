# Como publicar o app na Cloudflare Pages

Este guia é para quem não é programador. Faça uma vez só, no computador.
Leva uns 15 minutos.

**Você não precisa da Cloudflare para o app funcionar.** Ele já é publicado sozinho no
GitHub Pages: <https://filasfermon.github.io/caderno-pratica/>.
A Cloudflare é um segundo endereço, opcional, com um nome mais curto
(por exemplo `https://caderno-pratica.pages.dev`) e cabeçalhos de segurança a mais.

O app é um **site simples**: não tem conta, não tem senha, não tem banco de dados e não
guarda nada de ninguém. Por isso, na Cloudflare **não é preciso criar nenhuma variável
nem chave**: é só ligar o repositório e pronto.

Os nomes dos botões podem mudar um pouco com o tempo ou aparecer em inglês. Ao lado de
cada nome em português, entre parênteses, está o nome em inglês.

---

## Passo 1. Entrar na Cloudflare

1. Abra **<https://dash.cloudflare.com>**.
2. Se ainda não tem conta, clique em **Inscrever-se** (*Sign up*), escreva um e-mail e uma
   senha e confirme o e-mail que a Cloudflare enviar. A conta é grátis.
3. Entre com o seu e-mail e senha.

## Passo 2. Criar o projeto ligado ao GitHub

1. No menu da esquerda, clique em **Computação (Workers)** (*Compute (Workers)*) e depois
   em **Workers e Pages** (*Workers & Pages*).
   (Se não vir o menu, clique no ícone ☰ no canto de cima.)
2. Clique no botão **Criar** (*Create*).
3. Clique na aba **Pages** (atenção: **Pages**, não "Workers").
4. Clique em **Importar um repositório Git existente** (*Import an existing Git repository*)
   e depois em **Começar** (*Get started*).
5. Clique em **Conectar GitHub** (*Connect GitHub*). Abre uma janela do GitHub:
   - escolha a sua conta (**filasfermon**);
   - marque **Only select repositories** e escolha **caderno-pratica**;
   - clique em **Install & Authorize** (se pedir, digite a senha do GitHub).
6. De volta à Cloudflare, clique no repositório **caderno-pratica** e em
   **Iniciar configuração** (*Begin setup*).

## Passo 3. Preencher a configuração

Preencha exatamente assim:

| Campo | O que escrever |
|---|---|
| **Nome do projeto** (*Project name*) | `caderno-pratica` |
| **Branch de produção** (*Production branch*) | `main` |
| **Predefinição de framework** (*Framework preset*) | **Nenhum** (*None*) |
| **Comando de build** (*Build command*) | `npm run build` |
| **Diretório de saída do build** (*Build output directory*) | `dist` |
| **Diretório raiz** (*Root directory*) | deixe **vazio** |

Embaixo do nome do projeto aparece o endereço do app: `https://NOME-DO-PROJETO.pages.dev`.
Se o nome já existir, a Cloudflare acrescenta letras. **Anote o endereço.**

Depois, abra **Variáveis de ambiente (avançado)** (*Environment variables (advanced)*),
clique em **+ Adicionar variável** (*Add variable*) e crie **só esta**:

| Nome da variável | Valor |
|---|---|
| `NODE_VERSION` | `22` |

(Ela só diz qual versão do Node a Cloudflare usa para montar o site. Não crie `BASE_PATH`:
na Cloudflare o caminho é `/`, que já é o padrão.)

## Passo 4. Publicar

1. Clique em **Salvar e implantar** (*Save and Deploy*).
2. Espere uns 2 minutos. Aparece **Sucesso** (*Success*) e o endereço do app.
3. Clique em **Continuar para o projeto** (*Continue to project*).

Pronto. A partir de agora, **cada mudança na branch `main` publica sozinha** na Cloudflare
(e também no GitHub Pages). Não precisa fazer mais nada.

## Passo 5. Conferir

1. Abra o endereço anotado (ex.: `https://caderno-pratica.pages.dev`).
2. Deve aparecer a tela **ESCOLHER A AULA**, com uma voz explicando.
3. Escolha uma aula e faça algumas atividades.
4. No celular, abra o mesmo endereço e instale o app:
   - **Android (Chrome):** três pontinhos **⋮** → **Instalar app** (ou **Adicionar à tela inicial**);
   - **iPhone (Safari):** botão **Compartilhar** (quadrado com seta para cima) →
     **Adicionar à Tela de Início** → **Adicionar**.
5. Ligue o **modo avião** e abra o app pelo ícone: ele deve funcionar sem internet.

## Domínio próprio (opcional)

Se você tiver um domínio (ex.: `www.meusite.com.br`):

1. No projeto da Cloudflare, clique na aba **Domínios personalizados** (*Custom domains*).
2. Clique em **Configurar um domínio personalizado** (*Set up a custom domain*), escreva o
   domínio e siga os passos que a Cloudflare mostrar.

## Se algo der errado

| O que aparece | O que fazer |
|---|---|
| A publicação falhou (**Failed**) | Clique na publicação e veja o **registro do build** (*Build log*). Confira o comando `npm run build`, a pasta `dist` e a variável `NODE_VERSION = 22`. Depois, nos **três pontinhos** da publicação, clique em **Tentar implantar novamente** (*Retry deployment*). |
| A página abre em branco | Confira se o **Diretório de saída** é `dist` (sem barra) e se **não** existe a variável `BASE_PATH`. |
| O app não atualiza no celular | Abra o app com internet e toque em **ATUALIZAR** quando aparecer **NOVA VERSÃO DISPONÍVEL**. |

Para mexer no código, veja o `README.md` (seção "Para quem cuida do código").
