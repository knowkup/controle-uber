# CONTEXTO_CODEX.md

Memoria compartilhada do projeto Controle Uber para uso entre computadores, sessoes e agentes Codex.

## Regra permanente

- Antes de iniciar qualquer trabalho neste projeto, ler este arquivo.
- Se este arquivo nao existir em uma nova copia do projeto, recriar esta estrutura.
- Ao finalizar qualquer tarefa, atualizar este arquivo com decisoes, mudancas, pendencias, comandos relevantes e proximos passos.
- Manter os registros breves, objetivos e uteis para continuidade.

## Projeto

- Nome: Controle Uber.
- Repositorio GitHub: `https://github.com/kupka1988/controle-uber.git`.
- Branch principal: `main`.
- Pasta local do Codex nesta sessao: `C:\Users\felipe.k\Documents\New project`.
- Pasta do OneDrive usada pelo usuario: `C:\Users\felipe.k\OneDrive\Documentos\14. Sistemas Kupka\App Uber`.

## Fluxo combinado

- Antes de alterar arquivos do OneDrive, criar backup em `C:\Users\felip\OneDrive\Documentos\14. Sistemas Kupka\App Uber\backups`.
- Manter o mesmo tratamento usado no projeto Rota Financeira: backup, alteracao cuidadosa, validacao, commit, push e email de confirmacao quando solicitado.
- Para email de confirmacao, usar o mesmo modelo do Rota Financeira, trocando o assunto para iniciar com `Controle Uber`.

## Arquitetura atual

- App estatico em HTML, CSS e JavaScript puro.
- Arquivos principais:
  - `index.html`: estrutura da pagina e imports.
  - `styles.css`: estilos e responsividade mobile.
  - `app.js`: logica do app, dashboard, historico, import/export JSON, localStorage e Firebase.
  - `.firebaserc`: projeto Firebase padrao `controle-uber-9af6b`.
  - `.gitignore`: ignora `backups/` e `controle-uber.json`.
  - `firebase.json`: referencia local para regras do Firestore.
  - `firestore.rules`: regras seguras preparadas para Firestore.
- Foco principal de UX: mobile.
- Integracao atual: Firebase Firestore via scripts compat `firebase-app-compat.js` e `firebase-firestore-compat.js`.
- Documento usado no Firestore: `controleUber/estadoPrincipal`.

## Mudancas recentes

- Commit `cdf6c3a`: `Separa arquivos e reforca seguranca`.
- O antigo `index.html` monolitico foi separado em `index.html`, `styles.css` e `app.js`.
- Eventos inline foram removidos do HTML e registrados em `app.js`.
- Foi adicionada Content Security Policy no `index.html`.
- Renderizacoes de dados vindos de Firebase/importacao JSON passaram a escapar texto dinamico.
- Dados importados/sincronizados passaram por normalizacao basica.
- Corrigida a leitura da meta consistente no historico mensal.
- Arquivos atualizados tambem na pasta do OneDrive.
- Backup criado antes da alteracao: `20260517-132641`.
- Em 2026-05-18 nesta maquina, instalados Git `2.54.0`, Node.js `24.15.0`, npm `11.12.1` e Firebase CLI `14.11.0` via winget.
- Git local inicializado na pasta do OneDrive, conectado ao remoto `origin` e branch `main` configurada para acompanhar `origin/main`.
- Usuario Git local configurado como `kupka1988 <kupka1988@users.noreply.github.com>`.
- Adicionados `.firebaserc` e `.gitignore` para preparar deploy Firebase e evitar versionar backups/JSON legado.
- Commit `e9f5207`: `Configura Git e Firebase local`, enviado para `origin/main`.
- Backup criado antes das alteracoes de configuracao: `20260518-172258`.

## Pendencias importantes

- As regras de `firestore.rules` ainda nao foram publicadas no Firebase.
- Antes de publicar `firestore.rules`, configurar autenticacao no Firebase e trocar `COLOQUE_O_UID_AUTORIZADO_AQUI` pelo UID autorizado do usuario.
- Fazer login no Firebase CLI nesta maquina antes do deploy, se `firebase deploy` solicitar autenticacao.
- Sem publicar regras seguras no Firebase, o banco pode continuar publicamente legivel/escrevivel dependendo das regras atuais do console.
- Nao houve teste automatizado em navegador nesta rodada; foco foi configurar Git/Firebase CLI e preparar deploy das regras.

## Comandos uteis

- Ver estado do Git: `git status --short --branch`.
- Ver ultimo commit: `git log -1 --oneline`.
- Validar whitespace do diff: `git diff --check`.
- Enviar alteracoes: `git add .firebaserc .gitignore firebase.json firestore.rules CONTEXTO_CODEX.md`, `git commit -m "<mensagem>"`, `git push origin main`.
- Publicar regras: `firebase deploy --only firestore:rules`.

## Proximos passos sugeridos

- Configurar Firebase Auth para uso individual.
- Obter o UID autorizado no Firebase.
- Atualizar e publicar `firestore.rules`.
- Fazer teste visual em mobile real ou com navegador automatizado quando ambiente permitir.
- Considerar remover o arquivo antigo `controle-uber.json` do OneDrive se ele nao for mais usado pelo app atual.
