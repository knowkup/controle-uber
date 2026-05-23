# CONTEXTO_CODEX.md

Memoria compartilhada do projeto Controle Uber para uso entre computadores, sessoes e agentes Codex.

## Regra permanente

- Antes de iniciar qualquer trabalho neste projeto, ler este arquivo.
- Se este arquivo nao existir em uma nova copia do projeto, recriar esta estrutura.
- Ao finalizar qualquer tarefa, atualizar este arquivo com decisoes, mudancas, pendencias, comandos relevantes e proximos passos.
- Manter os registros breves, objetivos e uteis para continuidade.
- Repositorio oficial local: `C:\Users\felipe.k\OneDrive\Documentos\14. Sistemas Kupka\App Uber`.
- Qualquer copia fora do OneDrive e apenas area temporaria.
- Antes de mexer em regra de negocio, fluxo, dados ou integracao, revisar as premissas deste arquivo.
- Se algum dia forem criados `REGRAS_NEGOCIO.md`, `DESIGN_SYSTEM.md` ou `ROADMAP.md`, consultar esses arquivos conforme o tipo de mudanca.
- Se a mudanca for visual, UX, layout, mobile, tema, cards ou botoes, revisar tambem a secao de UX/design deste arquivo.
- Se tocar pendencias conhecidas, consultar a secao de pendencias e perguntar se pendencias relacionadas devem entrar junto ou se o foco e apenas o pedido atual.
- Trabalhar de forma incremental, sem recriar estrutura nem trocar stack sem pedido explicito.
- Nao reverter alteracoes nao feitas por mim sem autorizacao clara.
- Criar backup no OneDrive antes de mudancas relevantes.
- Validar o que for possivel antes de finalizar, especialmente sintaxe JavaScript quando mexer em `app.js`.
- Revisar diff antes de finalizar.
- Atualizar documentacao quando a mudanca registrar regra, fluxo, decisao tecnica ou historico relevante.
- Fazer commit ao final de alteracao solicitada quando houver mudanca em arquivo.
- Fazer push ao final da acao quando houver mudanca de codigo, pois a validacao do usuario acontece em producao.

## Projeto

- Nome: Controle Uber.
- Repositorio GitHub: `https://github.com/kupka1988/controle-uber.git`.
- Branch principal: `main`.
- Pasta oficial local: `C:\Users\felipe.k\OneDrive\Documentos\14. Sistemas Kupka\App Uber`.
- Pasta temporaria inicial da sessao Codex: `C:\Users\felipe.k\Documents\New project`.

## Fluxo combinado

- Antes de alterar arquivos do OneDrive, criar backup em `C:\Users\felipe.k\OneDrive\Documentos\14. Sistemas Kupka\App Uber\backups`.
- Aproveitar do Rota Financeira apenas as premissas de trabalho transferiveis: backup, alteracao cuidadosa, validacao, revisao de diff, documentacao, commit e push quando fizer sentido.
- Nao misturar conceitos de produto do Rota Financeira neste app.
- Para email de confirmacao, usar o mesmo modelo do Rota Financeira, trocando o assunto para iniciar com `Controle Uber`.

## Arquitetura atual

- App estatico em HTML, CSS e JavaScript puro.
- Nao migrar para React, Angular, Flutter ou outra stack sem pedido explicito.
- Arquivos principais:
  - `index.html`: estrutura da pagina e imports.
  - `styles.css`: estilos e responsividade mobile.
  - `app.js`: logica do app, dashboard, historico, import/export JSON, localStorage e Firebase.
  - `.firebaserc`: projeto Firebase padrao `controle-uber-9af6b`.
  - `.gitignore`: ignora `backups/` e `controle-uber.json`.
  - `firebase.json`: referencia local para regras do Firestore.
  - `firestore.rules`: regras seguras preparadas para Firestore.
- Foco principal de UX: mobile.
- Produto pessoal para controle operacional e financeiro de corridas/uso Uber conforme a logica ja existente no app.
- Nao importar conceitos de dividas, parcelas, rota de quitacao ou prioridades financeiras do Rota Financeira.
- Integracao atual: Firebase Firestore via scripts compat `firebase-app-compat.js` e `firebase-firestore-compat.js`.
- Documento usado no Firestore: `controleUber/estadoPrincipal`.

## Premissas de UX/design

- Manter layout compacto, escaneavel e operacional.
- Tema claro e o padrao.
- Mobile, especialmente iPhone, deve ser cuidado continuamente.
- Nao criar botao sem implementacao.
- Nao usar `alert()` ou `confirm()`; preferir modal/toast proprios quando necessario.
- Nao criar cards novos sem necessidade.
- Evitar excesso de texto explicativo dentro da interface.
- Preservar contexto do usuario em edicoes, importacoes, exclusoes e sincronizacoes.

## Premissas de dados e seguranca

- Nao limpar, sobrescrever ou recriar dados do Firebase.
- Nao alterar Firebase alem do necessario para o pedido.
- Alteracoes em dados devem ser conservadoras e rastreaveis.
- Antes de excluir algo, garantir consistencia dos dados vinculados.

## Mudancas recentes

- Em 2026-05-23, separada a natureza das metas entre `Custo mensal` e `Sobra desejada`: a sobra pode compor Sobrevivencia/Estabilidade/Conforto sem ser tratada como custo, aparece na composicao como `Desejado/A formar`, e a Sobra Projetada passa a usar apenas custos base.
- Backup criado antes da separacao conceitual de custo/sobra nas metas: `20260523-123755`.
- Em 2026-05-23, feito pente fino da troca Combustao/Eletrico: corrigida a atualizacao imediata do historico ao alternar tipo de veiculo sem salvar e preservada a capitalizacao correta de `kWh` no cabecalho/mobile do historico.
- Backup criado antes do pente fino de nomenclatura energia/combustivel: `20260523-122819`.
- Em 2026-05-22, adicionada configuracao de tipo de veiculo (`Combustao` ou `Eletrico`) para trocar nomenclaturas de gasolina/litros/combustivel por recarga/kWh/energia sem duplicar a logica de lancamentos.
- Backup criado antes da configuracao de tipo de veiculo: `20260522-151920`.
- Em 2026-05-22, reorganizada a Operacao do Carro em tres grupos de duas metricas: Desempenho, Eficiencia e Combustivel, melhorando a leitura mobile.
- Backup criado antes da reorganizacao dos grupos da operacao: `20260522-151920`.
- Em 2026-05-22, refinada a aba Inicio com cores premium por tipo no Resumo Financeiro, reorganizada Operacao do Carro por KM, eficiencia e combustivel, e alinhado o Historico para visual claro premium.
- Backup criado antes do refinamento visual de Inicio/Historico: `20260522-145217`.
- Em 2026-05-22, ajustada a responsividade da composicao das metas no mobile para manter Definido/Saldo lado a lado e trocado o destaque dark do Resultado do Mes por um destaque claro alinhado a identidade visual.
- Backup criado antes do ajuste visual da composicao/resumo: `20260522-143657`.
- Em 2026-05-22, adicionada edicao de metas cadastradas, movida a composicao das metas para a Dashboard antes de Semanas do mes, removido o bloco de metas da aba Inicio e refinado o destaque do Resultado do Mes.
- Backup criado antes da mudanca de edicao/composicao de metas: `20260522-140435`.
- Em 2026-05-22, a configuracao de metas deixou de usar campos fixos e passou a aceitar metas cadastraveis ilimitadas com objetivo Sobrevivencia, Estabilidade ou Conforto; a dashboard passou a calcular totais acumulados por objetivo e migrar automaticamente metas antigas.
- Backup criado antes da mudanca para metas cadastraveis: `20260522-121312`.
- Em 2026-05-22, corrigida a cor do valor no card de proxima meta para manter `R$ ...` e `/dia` em laranja, sem herdar o cinza global dos spans.
- Backup criado antes da correcao da cor do valor/dia: `20260522-120618`.
- Em 2026-05-22, corrigido apenas o `/dia` do card de proxima meta: mantido na mesma linha do valor, em minusculo, com fonte menor e sem herdar caixa alta.
- Backup criado antes da correcao do `/dia`: `20260522-120223`.
- Em 2026-05-22, ajustado o visual acordado da Dashboard: topo claro premium com fundo aurora, card de valor/dia retomado em laranja com `/dia` menor ao lado do valor e velocimetro substituido por regua horizontal proporcional com marcador de projecao.
- Backup criado antes da troca do velocimetro por regua: `20260522-115342`.
- Em 2026-05-22, aplicadas correcoes finais da Dashboard: topo migrado para visual claro premium, texto voltou para `Sobra Projetada`, velocimetro recebeu escala explicita `0 / Sobrevivencia / Estabilidade / Conforto`, ponteiro recalibrado por escala real de metas e ajustes finos em `/dia` e textos da Semana Atual.
- Backup criado antes das correcoes finais da Dashboard: `20260522-114017`.
- Em 2026-05-22, refinada a Dashboard sem reconstruir estrutura: ponteiro do ritmo mais fino/longo e calibrado visualmente, cards das metas com cores suaves por objetivo, blocos inferiores com icones outline, bloco Ritmo com melhor hierarquia e Semana Atual com executado semanal como foco principal.
- Backup criado antes do refinamento visual da Dashboard: `20260522-105420`.
- Em 2026-05-22, reforcada a regra operacional: alteracao de codigo deve terminar com validacao, commit e push para permitir validacao em producao.
- Em 2026-05-22, ajustada a Dashboard com foco mobile: bloco `Ritmo do Mes`, ponteiro real baseado na projecao, metas Sobrevivencia/Estabilidade/Conforto, separacao de Executado/Projecao e semana atual pela proxima meta ativa.
- Backup criado antes da alteracao da Dashboard: `20260522-102833`.
- Em 2026-05-22, incorporadas ao contexto do Controle Uber as premissas de trabalho reaproveitaveis do Rota Financeira, separando regras transferiveis de conceitos especificos daquele produto.
- Corrigida a pasta oficial local para o OneDrive e corrigido o caminho de backups.
- Backup criado antes da alteracao documental: `20260522-084404`.
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
- Em 2026-05-18, `firestore.rules` atualizado com UID autorizado `vGKk21sl83bn4jEV3xltI4vD8ha2`.
- Commit `2fe7414`: `Configura UID autorizado no Firestore`, enviado para `origin/main`.
- Backup criado antes da alteracao das regras: `20260518-174428`.

## Pendencias importantes

- As regras de `firestore.rules` ainda nao foram publicadas no Firebase.
- Deploy testado com `firebase deploy --only firestore:rules --project controle-uber-9af6b`, bloqueado por falta de autenticacao: executar `firebase login`.
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
