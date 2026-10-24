# Como ligar o "ENTRAR COM GOOGLE" e publicar na Cloudflare

Este guia é para quem administra o app. Faça uma vez só, no computador, com calma.
Leva cerca de 40 minutos. Não precisa saber programar.

O que você vai ter no fim:

- o app publicado num endereço como `https://caderno-pratica.pages.dev`;
- o botão **ENTRAR COM GOOGLE** funcionando: o progresso do estudante fica guardado
  na conta Google dele e aparece em qualquer celular;
- o botão **ENTRAR SEM CONTA** continua lá, para quem não quer usar conta.

> **Importante:** enquanto este guia não for feito, o app funciona normalmente, só com
> "ENTRAR SEM CONTA" (a tela de entrada nem aparece). O endereço do GitHub Pages
> (`https://filasfermon.github.io/caderno-pratica/`) continua funcionando assim.
>
> As gravações de voz **nunca** vão para a internet: ficam no celular e no pacote `.zip`.
> Na conta Google vai só o progresso (quais aulas e itens o estudante já praticou).

Os nomes dos botões podem mudar um pouco com o tempo, ou aparecer em inglês. Ao lado de
cada nome em português, entre parênteses, está o nome em inglês.

Tenha à mão um papel (ou um bloco de notas no computador) para anotar 4 coisas que
vão aparecer no caminho. Elas estão marcadas com 📝.

---

## Passo 1. Criar o projeto no Firebase

1. Abra o navegador e entre na conta Gmail **do administrador** (a conta que vai cuidar
   do app; não use a conta de um estudante).
2. Vá para **https://console.firebase.google.com**
3. Clique em **Criar um projeto** (*Create a project*). Se aparecer
   **Começar com um projeto do Firebase** (*Get started with a Firebase project*), clique nele.
4. Em **Nome do projeto**, escreva `caderno-pratica` (ou outro nome que você quiser).
   Embaixo do nome aparece o **código do projeto** (por exemplo `caderno-pratica-1a2b3`).
   📝 **Anote o código do projeto.**
5. Marque a caixa que aceita os termos e clique em **Continuar** (*Continue*).
6. Na tela do **Gemini no Firebase** (se aparecer), pode desligar e clicar em **Continuar**.
7. Na tela do **Google Analytics**, **desligue** a chave "Ativar o Google Analytics"
   (o app não usa) e clique em **Criar projeto** (*Create project*).
8. Espere aparecer "Seu novo projeto está pronto" e clique em **Continuar**.

## Passo 2. Ligar o login com Google e o banco de dados (Firestore)

### 2a. Login com Google

1. No menu da esquerda, clique em **Criação** (*Build*) e depois em **Authentication**.
   (Se não vir o menu, clique no ícone ☰ no canto de cima.)
2. Clique em **Vamos começar** (*Get started*).
3. Na aba **Método de login** (*Sign-in method*), clique em **Google**.
4. Clique na chave **Ativar** (*Enable*) para ela ficar azul.
5. Em **Nome do projeto exibido ao público** (*Public-facing name*), escreva `Caderno Prática`.
6. Em **E-mail de suporte do projeto** (*Support email*), escolha o seu Gmail.
7. Clique em **Salvar** (*Save*). O Google aparece na lista como **Ativado** (*Enabled*).

### 2b. Banco de dados (Cloud Firestore)

1. No menu da esquerda, clique em **Criação** (*Build*) e depois em **Firestore Database**.
2. Clique em **Criar banco de dados** (*Create database*).
3. Se perguntar a **edição**, escolha **Standard** e clique em **Próxima** (*Next*).
4. Em **ID do banco de dados**, deixe `(default)`.
   Em **Local** (*Location*), escolha **southamerica-east1 (São Paulo)**.
   Clique em **Próxima**. (O local não pode ser trocado depois.)
5. Escolha **Iniciar no modo de produção** (*Start in production mode*) e clique em
   **Criar** (*Create*). Espere um minuto até o banco aparecer.

## Passo 3. Publicar as regras de segurança

As regras garantem que **cada pessoa só vê e só muda o próprio progresso**.

1. Ainda em **Firestore Database**, clique na aba **Regras** (*Rules*).
2. Apague todo o texto que está na caixa.
3. Abra o arquivo `firestore.rules` deste repositório no GitHub:
   **https://github.com/filasfermon/caderno-pratica/blob/main/firestore.rules**
   e copie todo o texto dele (do `rules_version` até a última `}`).
   O texto é este:

   ```
   rules_version = '2';

   // Regras do Cloud Firestore do Caderno Prática.
   // Cada pessoa lê e escreve SÓ os próprios dados, em users/{uid}.
   // Nenhum outro caminho pode ser lido ou escrito pelo app.
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;

         match /{documento=**} {
           allow read, write: if request.auth != null && request.auth.uid == uid;
         }
       }
     }
   }
   ```

4. Cole na caixa e clique em **Publicar** (*Publish*).
5. Confira: em cima da caixa aparece a data e a hora de agora.

## Passo 4. Pegar os dados do app web

1. No canto de cima, à esquerda, clique na **engrenagem ⚙** ao lado de
   "Visão geral do projeto" (*Project Overview*) e depois em
   **Configurações do projeto** (*Project settings*).
2. Na aba **Geral** (*General*), desça até **Seus apps** (*Your apps*).
3. Clique no ícone **`</>`** (Web).
4. Em **Apelido do app** (*App nickname*), escreva `Caderno Prática`.
   **Não** marque "Firebase Hosting". Clique em **Registrar app** (*Register app*).
5. Aparece um quadro com um código parecido com este:

   ```
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "caderno-pratica-1a2b3.firebaseapp.com",
     projectId: "caderno-pratica-1a2b3",
     storageBucket: "...",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };
   ```

   📝 **Anote** os valores de `apiKey`, `projectId`, `messagingSenderId` e `appId`
   (só o que está entre aspas). O `authDomain` daqui **não** será usado: no passo 5
   você vai usar o endereço do próprio app.
6. Clique em **Continuar no console** (*Continue to console*).

> Esses dados não são senha: eles aparecem para qualquer pessoa que abre o app.
> Quem protege os dados são as regras do passo 3 e a restrição do passo 7.

## Passo 5. Criar o projeto na Cloudflare Pages

1. Vá para **https://dash.cloudflare.com** e entre (ou crie uma conta grátis com
   **Inscrever-se** / *Sign up*).
2. No menu da esquerda, clique em **Computação (Workers)** (*Compute (Workers)*) e depois em
   **Workers e Pages** (*Workers & Pages*).
3. Clique em **Criar** (*Create*).
4. Clique na aba **Pages** (atenção: **Pages**, não "Workers") e depois em
   **Importar um repositório Git existente** (*Import an existing Git repository*)
   → **Começar** (*Get started*).
5. Clique em **Conectar GitHub** (*Connect GitHub*). Abre uma janela do GitHub:
   escolha a sua conta, marque **Only select repositories**, escolha
   `filasfermon/caderno-pratica` e clique em **Install & Authorize**.
6. De volta à Cloudflare, clique no repositório `caderno-pratica` e em
   **Iniciar configuração** (*Begin setup*).
7. Preencha:
   - **Nome do projeto** (*Project name*): `caderno-pratica`.
     O endereço do app vai ser `https://NOME-DO-PROJETO.pages.dev`
     (aparece embaixo do nome; se o nome já existir, a Cloudflare acrescenta letras).
     📝 **Anote o endereço** (por exemplo `caderno-pratica.pages.dev`).
   - **Branch de produção** (*Production branch*): `main`
   - **Predefinição de framework** (*Framework preset*): `None` (Nenhum)
   - **Comando de build** (*Build command*): `npm run build`
   - **Diretório de saída do build** (*Build output directory*): `dist`
   - **Diretório raiz** (*Root directory*): deixe vazio.
8. Abra **Variáveis de ambiente (avançado)** (*Environment variables (advanced)*) e
   clique em **+ Adicionar variável** (*Add variable*) para cada linha abaixo
   (nome à esquerda, valor à direita):

   | Nome da variável | Valor |
   |---|---|
   | `NODE_VERSION` | `22` |
   | `VITE_FIREBASE_API_KEY` | o `apiKey` anotado no passo 4 |
   | `VITE_FIREBASE_AUTH_DOMAIN` | o endereço do app, **sem** `https://` (ex.: `caderno-pratica.pages.dev`) |
   | `VITE_FIREBASE_PROJECT_ID` | o `projectId` anotado no passo 4 |
   | `VITE_FIREBASE_APP_ID` | o `appId` anotado no passo 4 |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | o `messagingSenderId` anotado no passo 4 |
   | `FIREBASE_AUTH_HOST` | o código do projeto + `.firebaseapp.com` (ex.: `caderno-pratica-1a2b3.firebaseapp.com`) |

   Não crie a variável `BASE_PATH` (na Cloudflare o caminho é `/`, que é o padrão).
9. Clique em **Salvar e implantar** (*Save and Deploy*). Espere uns 2 minutos até aparecer
   **Sucesso** (*Success*) e clique em **Continuar para o projeto**.

Por que o `VITE_FIREBASE_AUTH_DOMAIN` é o endereço do próprio app? Os celulares
(principalmente o iPhone) bloqueiam o login quando ele acontece em outro endereço. Por isso
o app tem um "repasse" (`functions/__/auth`): o endereço do app recebe a página de login
e a busca no Firebase, sem o estudante perceber.

**Se precisar mudar uma variável depois:** no projeto da Cloudflare, vá em
**Configurações** (*Settings*) → **Variáveis e segredos** (*Variables and Secrets*),
mude o valor, depois vá em **Implantações** (*Deployments*), clique nos **três pontinhos**
da implantação mais recente → **Tentar implantar novamente** (*Retry deployment*).
A mudança só vale depois disso.

**Domínio próprio (opcional):** em **Domínios personalizados** (*Custom domains*) →
**Configurar um domínio personalizado**. Se fizer isso, use o domínio próprio no
`VITE_FIREBASE_AUTH_DOMAIN`, implante de novo e acrescente esse domínio também nos passos 6 e 7.

## Passo 6. Autorizar o endereço do app no Firebase e no Google Cloud

### 6a. Domínios autorizados (Firebase)

1. Volte para **https://console.firebase.google.com** e abra o projeto.
2. Clique em **Criação** (*Build*) → **Authentication** → aba **Configurações** (*Settings*).
3. Clique em **Domínios autorizados** (*Authorized domains*) → **Adicionar domínio**
   (*Add domain*).
4. Escreva o endereço do app, sem `https://` (ex.: `caderno-pratica.pages.dev`) e clique
   em **Adicionar** (*Add*).
5. (Opcional) Se tiver domínio próprio, adicione ele também.

### 6b. Endereço de volta do login (Google Cloud)

1. Vá para **https://console.cloud.google.com/apis/credentials** e, no alto da página,
   escolha o projeto do Firebase (mesmo nome do passo 1).
2. Em **IDs do cliente OAuth 2.0** (*OAuth 2.0 Client IDs*), clique em
   **Web client (auto created by Google Service)**.
3. Em **URIs de redirecionamento autorizados** (*Authorized redirect URIs*), clique em
   **+ Adicionar URI** (*Add URI*) e escreva:
   `https://caderno-pratica.pages.dev/__/auth/handler`
   (troque `caderno-pratica.pages.dev` pelo endereço anotado; repare nos **dois**
   sublinhados antes de `auth`).
4. Clique em **Salvar** (*Save*). Pode levar alguns minutos para valer.

## Passo 7. Restringir a chave do app ao endereço do app

Isso impede que outros sites usem a chave do seu projeto.

1. Ainda em **https://console.cloud.google.com/apis/credentials**, em
   **Chaves de API** (*API Keys*), clique em **Browser key (auto created by Firebase)**.
   (Confira: o valor da chave é o mesmo `apiKey` anotado no passo 4.)
2. Em **Restrições de aplicativos** (*Application restrictions*), escolha
   **Sites** (*Websites*).
3. Em **Restrições de sites** (*Website restrictions*), clique em **Adicionar** (*Add*)
   e cadastre, um de cada vez:
   - `https://caderno-pratica.pages.dev/*` (o endereço do app)
   - `https://*.caderno-pratica.pages.dev/*` (as versões de teste da Cloudflare)
   - `https://caderno-pratica-1a2b3.firebaseapp.com/*` (o código do projeto + `.firebaseapp.com`)
   - seu domínio próprio, se tiver (ex.: `https://www.meudominio.com.br/*`)
4. Em **Restrições de API** (*API restrictions*), **não mude nada** (o Firebase já
   escolheu as que o app precisa).
5. Clique em **Salvar** (*Save*). Pode levar até 5 minutos para valer.

## Passo 8. Testar

### No computador

1. Abra `https://caderno-pratica.pages.dev` (o seu endereço) numa janela anônima.
2. Deve aparecer a tela com **ENTRAR COM GOOGLE** e **ENTRAR SEM CONTA**, e uma voz
   explicando.
3. Toque **ENTRAR COM GOOGLE**. Abre uma janelinha do Google: escolha uma conta.
4. A janelinha fecha e a tela inicial mostra **PROGRESSO GUARDADO NA CONTA: SEU NOME**.
5. Faça uma aula até o fim.
6. Confira no Firebase: **Firestore Database** → aba **Dados** (*Data*) → coleção
   `users` → aparece um documento com o progresso.
7. Abra o app em outro navegador (ou outra janela anônima), entre com a **mesma conta**:
   o progresso aparece lá também (veja em **MEU PROGRESSO**).

### No Android (Chrome)

1. Abra o endereço no Chrome, toque nos **três pontinhos** → **Instalar app**
   (ou **Adicionar à tela inicial**).
2. Abra o app pelo ícone na tela inicial.
3. Toque **ENTRAR COM GOOGLE** e escolha a conta. (No app instalado o login abre a página
   do Google e volta sozinho para o app.)
4. Faça uma aula. Depois ligue o **modo avião** e faça outra aula: o app funciona.
5. Desligue o modo avião, espere um minuto e confira no computador (passo 7 de cima)
   se o progresso chegou.

### No iPhone (Safari)

1. Abra o endereço no **Safari** (não funciona instalar por outro navegador).
2. Toque no botão **Compartilhar** (quadrado com seta para cima) →
   **Adicionar à Tela de Início** → **Adicionar**.
3. Abra o app pelo ícone na Tela de Início.
4. Toque **ENTRAR COM GOOGLE**, escolha a conta e espere voltar para o app.
5. Repita o teste do modo avião (item 4 e 5 do Android).

### Se algo der errado

| O que aparece | O que fazer |
|---|---|
| Não aparece a tela de entrada, só o app | As variáveis do passo 5 não chegaram. Confira os nomes (com `VITE_` na frente) e faça **Tentar implantar novamente**. |
| "NÃO FOI POSSÍVEL ENTRAR AGORA" | Confira os passos 6a e 6b (o endereço tem que ser exatamente igual). Espere 5 minutos e tente de novo. |
| Erro do Google `redirect_uri_mismatch` | Falta o endereço do passo 6b, ou ele tem um erro de digitação. |
| Erro `API key not valid` ou `requests-from-referer-blocked` | Confira as restrições do passo 7 (com `https://` e `/*` no fim). |
| A janelinha do Google não abre | Permita janelas (pop-ups) para o endereço do app. O app tenta sozinho pela página do Google. |
| O progresso não aparece no outro celular | Os dois precisam estar com internet e com a **mesma conta**. Espere um minuto e abra de novo. |

Para mexer no código ou testar no computador, veja o `README.md` (seção 5) e o arquivo
`.env.example`.
