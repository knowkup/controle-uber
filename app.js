const firebaseConfig = {
  apiKey: "AIzaSyAUzriWAPOLNVwaGkT02FlIuxgjzIv3COw",
  authDomain: "controle-uber-9af6b.firebaseapp.com",
  projectId: "controle-uber-9af6b",
  storageBucket: "controle-uber-9af6b.firebasestorage.app",
  messagingSenderId: "847499399736",
  appId: "1:847499399736:web:f75460529adf76e4f74ccd"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const estadoRef = db.collection("controleUber").doc("estadoPrincipal");

let tipo = "ganho";
let dados = [];
let fechamentos = {};
let config = {
  saldoInicial: 0,
  metaGasolina: 0,
  metaSeguro: 0,
  metaCustosGerais: 0,
  metaParcela: 0,
  diasPlanejados: 0,
  metaConsistente: 0
};

const STORAGE_KEY = "controleUberFelipe";
const CONFIG_KEY = "controleUberFelipeConfig";
const HISTORICO_KEY = "controleUberFelipeFechamentos";
let firebaseCarregado = false;
let salvandoFirebase = false;
let bloqueiaRestauracaoLocal = false;

document.getElementById("importarArquivo").addEventListener("change", importarJSON);
document.getElementById("data").addEventListener("change", atualizarDataPorExtenso);
document.getElementById("abaInicio").addEventListener("click", () => trocarAba("inicio"));
document.getElementById("abaDashboard").addEventListener("click", () => trocarAba("dashboard"));
document.getElementById("abaHistorico").addEventListener("click", () => trocarAba("historico"));
document.getElementById("abaFechamentos").addEventListener("click", () => trocarAba("fechamentos"));
document.getElementById("abaConfig").addEventListener("click", () => trocarAba("config"));
document.getElementById("btnGanho").addEventListener("click", () => selecionar("ganho"));
document.getElementById("btnGasolina").addEventListener("click", () => selecionar("gasolina"));
document.getElementById("btnDespesas").addEventListener("click", () => selecionar("despesas"));
document.getElementById("btnKM").addEventListener("click", () => selecionar("km"));
document.getElementById("btnAdicionar").addEventListener("click", adicionar);
document.querySelectorAll('[data-action="salvar-config"]').forEach(botao => {
  botao.addEventListener("click", salvarConfiguracoes);
});
document.getElementById("btnExportar").addEventListener("click", exportarJSON);
document.getElementById("btnImportar").addEventListener("click", () => document.getElementById("importarArquivo").click());
document.getElementById("btnLimpar").addEventListener("click", limparDados);
["valor", "saldoInicial", "metaConsistente", "metaGasolina", "metaSeguro", "metaCustosGerais", "metaParcela"].forEach(id => {
  document.getElementById(id).addEventListener("blur", event => formatarCampoMoeda(event.target));
});

function trocarAba(aba) {
  telaInicio.classList.add("hidden");
  telaDashboard.classList.add("hidden");
  telaHistorico.classList.add("hidden");
  telaFechamentos.classList.add("hidden");
  telaConfig.classList.add("hidden");

  abaInicio.classList.remove("ativo");
  abaDashboard.classList.remove("ativo");
  abaHistorico.classList.remove("ativo");
  abaFechamentos.classList.remove("ativo");
  abaConfig.classList.remove("ativo");

  if (aba === "inicio") {
    telaInicio.classList.remove("hidden");
    abaInicio.classList.add("ativo");
  }


  if (aba === "dashboard") {
    telaDashboard.classList.remove("hidden");
    abaDashboard.classList.add("ativo");
  }

  if (aba === "historico") {
    telaHistorico.classList.remove("hidden");
    abaHistorico.classList.add("ativo");
  }

  if (aba === "fechamentos") {
    telaFechamentos.classList.remove("hidden");
    abaFechamentos.classList.add("ativo");
  }

  if (aba === "config") {
    telaConfig.classList.remove("hidden");
    abaConfig.classList.add("ativo");
  }
}

function selecionar(novoTipo) {
  tipo = novoTipo;

  ["btnGanho", "btnGasolina", "btnDespesas", "btnKM"].forEach(id => {
    document.getElementById(id).classList.remove("ativo");
  });

  campoDescricao.classList.add("hidden");
  campoValor.classList.remove("hidden");
  campoLitros.classList.add("hidden");

  if (tipo === "ganho") {
    btnGanho.classList.add("ativo");
    labelValor.innerText = "Valor ganho";
    valor.placeholder = "Ex: R$ 150,00";
  }

  if (tipo === "gasolina") {
    btnGasolina.classList.add("ativo");
    labelValor.innerText = "Valor da gasolina";
    valor.placeholder = "Ex: R$ 250,00";
    campoLitros.classList.remove("hidden");
  }

  if (tipo === "despesas") {
    btnDespesas.classList.add("ativo");
    labelValor.innerText = "Valor da despesa";
    valor.placeholder = "Ex: R$ 80,00";
    campoDescricao.classList.remove("hidden");
  }

  if (tipo === "km") {
    btnKM.classList.add("ativo");
    campoValor.classList.add("hidden");
  }
}

async function adicionar() {
  const data = document.getElementById("data").value;
  const valorCampo = document.getElementById("valor").value;
  const litrosCampo = document.getElementById("litros").value;
  const kmCampo = document.getElementById("km").value;

  if (!data) return alert("Informe a data");

  let descricao = "";
  let valorLancamento = parseMoeda(valorCampo);
  let litros = parseDecimalBR(litrosCampo) || null;
  let km = parseDecimalBR(kmCampo) || null;

  if (tipo === "ganho") {
    if (!valorCampo) return alert("Informe o valor ganho");
    descricao = "Ganhos Uber";
    valorLancamento = Math.abs(valorLancamento);
  }

  if (tipo === "gasolina") {
    if (!valorCampo) return alert("Informe o valor da gasolina");
    if (!litrosCampo) return alert("Informe os litros abastecidos");
    descricao = "Gasolina";
    valorLancamento = Math.abs(valorLancamento) * -1;
  }

  if (tipo === "despesas") {
    if (!valorCampo) return alert("Informe o valor da despesa");
    descricao = document.getElementById("descricao").value;
    valorLancamento = Math.abs(valorLancamento) * -1;
  }

  if (tipo === "km") {
    if (!kmCampo) return alert("Informe o KM atual");
    descricao = "Atualização de KM";
    valorLancamento = 0;
    litros = null;
  }

  dados.push({
    id: gerarId(),
    data,
    tipo,
    descricao,
    valor: valorLancamento,
    litros,
    km
  });

  limparFormulario();
  executarManutencaoMensal(false);
  render();
  await salvarEstado();
}

async function salvarConfiguracoes() {
  config.saldoInicial = parseMoeda(saldoInicial.value);
  config.metaGasolina = parseMoeda(metaGasolina.value);
  config.metaSeguro = parseMoeda(metaSeguro.value);
  config.metaCustosGerais = parseMoeda(metaCustosGerais.value);
  config.metaParcela = parseMoeda(metaParcela.value);
  config.diasPlanejados = parseInt(diasPlanejados.value) || 0;
  config.metaConsistente = parseMoeda(metaConsistente.value);

  preencherCamposConfig();
  render();
  await salvarEstado();
}

function limparFormulario() {
  valor.value = "";
  litros.value = "";
  km.value = "";
}

function textoSeguro(valor) {
  return String(valor ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function numeroPercentualSeguro(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return 0;
  return Math.min(Math.max(numero, 0), 100);
}

function render() {
  tabela.innerHTML = "";

  let entradas = 0;
  let saidas = 0;
  let litrosTotal = 0;
  let kms = [];

  let gastoGasolina = 0;
  let gastoSeguro = 0;
  let gastoCustosGerais = 0;
  let gastoParcela = 0;

  const diasComGanhos = new Set();

  const dadosOrdenados = [...dados].sort((a, b) => {
    const dataA = a.data || "";
    const dataB = b.data || "";
    if (dataA !== dataB) return dataB.localeCompare(dataA);
    return String(b.id || "").localeCompare(String(a.id || ""));
  });
  const mesAtualKey = mesKeyDeData(new Date());

  dadosOrdenados.forEach((d, index) => {
    // A lista pode exibir mês atual + anterior, mas os KPIs e o Dashboard são sempre do mês atual.
    if (obterMesKey(d.data) === mesAtualKey) {
      if (d.valor > 0) {
        entradas += d.valor;
        if (d.descricao === "Ganhos Uber") diasComGanhos.add(d.data);
      }

      if (d.valor < 0) saidas += d.valor;
      if (d.litros) litrosTotal += d.litros;
      if (d.km) kms.push(d.km);

      if (d.descricao === "Gasolina") gastoGasolina += Math.abs(d.valor);
      if (d.descricao === "Seguro") gastoSeguro += Math.abs(d.valor);
      if (d.descricao === "Parcela") gastoParcela += Math.abs(d.valor);

      if (
        d.valor < 0 &&
        d.descricao !== "Gasolina" &&
        d.descricao !== "Seguro" &&
        d.descricao !== "Parcela"
      ) {
        gastoCustosGerais += Math.abs(d.valor);
      }
    }

    const tr = document.createElement("tr");
    const botaoExcluir = document.createElement("button");
    botaoExcluir.className = "btn-excluir";
    botaoExcluir.type = "button";
    botaoExcluir.innerText = "Excluir";
    botaoExcluir.addEventListener("click", () => excluirPorId(d.id));

    tr.innerHTML = `
      <td data-label="Data">${formatarData(d.data)}</td>
      <td data-label="Descrição"><span class="launch-row"><span class="launch-icon ${classeIconeLancamento(d)}">${svgIconeLancamento(d)}</span><span>${textoSeguro(d.descricao)}</span></span></td>
      <td data-label="Valor" class="${d.valor > 0 ? "positivo" : d.valor < 0 ? "negativo" : ""}">
        ${d.valor === 0 ? "-" : moeda(d.valor)}
      </td>
      <td data-label="Litros">${d.litros ? numero(d.litros) : "-"}</td>
      <td data-label="KM">${d.km || "-"}</td>
      <td data-label="Ação"></td>
    `;
    tr.querySelector('td[data-label="Ação"]').appendChild(botaoExcluir);

    tabela.appendChild(tr);
  });

  let kmRodado = 0;
  if (kms.length > 1) kmRodado = Math.max(...kms) - Math.min(...kms);

  const resultadoMes = config.saldoInicial + entradas + saidas;
  const lucroOperacional = entradas + saidas;

  const receitaPorKm = kmRodado > 0 ? entradas / kmRodado : 0;
  const custoPorKm = kmRodado > 0 ? gastoGasolina / kmRodado : 0;
  const lucroPorKm = kmRodado > 0 ? lucroOperacional / kmRodado : 0;

  const custosSemParcela = config.metaGasolina + config.metaSeguro + config.metaCustosGerais;
  const custosTotais = custosSemParcela + config.metaParcela;

  const diasTrabalhadosValor = diasComGanhos.size;
  const diasRestantes = Math.max(config.diasPlanejados - diasTrabalhadosValor, 0);

  const mediaDiaValor = diasTrabalhadosValor > 0 ? entradas / diasTrabalhadosValor : 0;
  const metaMinima = config.diasPlanejados > 0 ? custosSemParcela / config.diasPlanejados : 0;
  const metaIdeal = config.diasPlanejados > 0 ? custosTotais / config.diasPlanejados : 0;
  const metaAjustadaValor = diasRestantes > 0 ? Math.max((custosSemParcela - entradas) / diasRestantes, 0) : 0;

  saldoInicialResumo.innerText = moeda(config.saldoInicial);
  if (document.getElementById("diasPlanejadosResumo")) diasPlanejadosResumo.innerText = config.diasPlanejados || 0;
  entradasEl().innerText = moeda(entradas);
  saidasEl().innerText = moeda(saidas);
  resultado.innerText = moeda(resultadoMes);

  kmRodadoEl().innerText = kmRodado.toLocaleString("pt-BR");
  litrosTotalEl().innerText = numero(litrosTotal);
  gastoGasolinaEl().innerText = moeda(gastoGasolina);
  receitaPorKmEl().innerText = moeda(receitaPorKm);
  custoPorKmEl().innerText = moeda(custoPorKm);
  lucroPorKmEl().innerText = moeda(lucroPorKm);

  metaGasolinaDefinida.innerText = moeda(config.metaGasolina);
  metaSeguroDefinida.innerText = moeda(config.metaSeguro);
  metaCustosGeraisDefinida.innerText = moeda(config.metaCustosGerais);
  metaParcelaDefinida.innerText = moeda(config.metaParcela);

  saldoMetaGasolina.innerText = moeda(config.metaGasolina - gastoGasolina);
  saldoMetaSeguro.innerText = moeda(config.metaSeguro - gastoSeguro);
  saldoMetaCustosGerais.innerText = moeda(config.metaCustosGerais - gastoCustosGerais);
  saldoMetaParcela.innerText = moeda(config.metaParcela - gastoParcela);

  if (document.getElementById("diasTrabalhados")) diasTrabalhados.innerText = diasTrabalhadosValor;
  if (document.getElementById("mediaDia")) mediaDia.innerText = moeda(mediaDiaValor);
  if (document.getElementById("metaDiariaMinima")) metaDiariaMinima.innerText = moeda(metaMinima);
  if (document.getElementById("metaDiariaIdeal")) metaDiariaIdeal.innerText = moeda(metaIdeal);
  if (document.getElementById("metaAjustada")) metaAjustada.innerText = moeda(metaAjustadaValor);

  atualizarDashboard({
    entradas,
    saidas,
    custosSemParcela,
    custosTotais,
    diasTrabalhadosValor,
    diasRestantes,
    mediaDiaValor,
    metaAjustadaValor
  });

  renderizarHistoricoMensal({ entradas, saidas, kmRodado, litrosTotal, gastoGasolina, lucroOperacional, custosSemParcela, custosTotais });
}

function entradasEl() { return document.getElementById("entradas"); }
function saidasEl() { return document.getElementById("saidas"); }
function kmRodadoEl() { return document.getElementById("kmRodado"); }
function litrosTotalEl() { return document.getElementById("litrosTotal"); }
function gastoGasolinaEl() { return document.getElementById("gastoGasolina"); }
function receitaPorKmEl() { return document.getElementById("receitaPorKm"); }
function custoPorKmEl() { return document.getElementById("custoPorKm"); }
function lucroPorKmEl() { return document.getElementById("lucroPorKm"); }



function obterMesKey(dataISO) {
  if (!dataISO || typeof dataISO !== "string" || dataISO.length < 7) return "";
  return dataISO.slice(0, 7);
}

function mesKeyDeData(dataObj) {
  const ano = dataObj.getFullYear();
  const mes = String(dataObj.getMonth() + 1).padStart(2, "0");
  return `${ano}-${mes}`;
}

function deslocarMesKey(mesKey, delta) {
  const [ano, mes] = mesKey.split("-").map(Number);
  const data = new Date(ano, mes - 1 + delta, 1);
  return mesKeyDeData(data);
}

function compararMesKey(a, b) {
  if (!a && !b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  return a.localeCompare(b);
}

function nomeMesAno(mesKey) {
  if (!mesKey) return "Mês";
  const [ano, mes] = mesKey.split("-").map(Number);
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${meses[(mes || 1) - 1]} de ${ano}`;
}

function nomeMesAnoLongo(mesKey) {
  if (!mesKey) return "Mês";
  const [ano, mes] = mesKey.split("-").map(Number);
  const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return `${meses[(mes || 1) - 1]} de ${ano}`;
}

function calcularResumoDoMes(mesKey, listaDados, configBase = config, status = "Fechado") {
  const dadosMes = (Array.isArray(listaDados) ? listaDados : []).filter(d => obterMesKey(d.data) === mesKey);
  let entradas = 0;
  let saidas = 0;
  let litrosTotal = 0;
  let kms = [];
  let gastoGasolina = 0;
  let diasComGanhos = new Set();

  dadosMes.forEach(d => {
    const valor = Number(d.valor) || 0;
    if (valor > 0) {
      entradas += valor;
      if (d.descricao === "Ganhos Uber") diasComGanhos.add(d.data);
    }
    if (valor < 0) saidas += valor;
    if (d.litros) litrosTotal += Number(d.litros) || 0;
    if (d.km) kms.push(Number(d.km) || 0);
    if (d.descricao === "Gasolina") gastoGasolina += Math.abs(valor);
  });

  const kmRodado = kms.length > 1 ? Math.max(...kms) - Math.min(...kms) : 0;
  const lucroOperacional = entradas + saidas;
  const resultado = (Number(configBase.saldoInicial) || 0) + lucroOperacional;
  const lucroPorKm = kmRodado > 0 ? lucroOperacional / kmRodado : 0;

  const metaMinima = (Number(configBase.metaGasolina) || 0) + (Number(configBase.metaSeguro) || 0) + (Number(configBase.metaCustosGerais) || 0);
  const metaConsistenteValor = metaMinima + (Number(configBase.metaConsistente) || 0);
  const metaIdeal = metaMinima + (Number(configBase.metaParcela) || 0);

  let faixaMeta = "Abaixo da mínima";
  if (metaIdeal > 0 && entradas >= metaIdeal) faixaMeta = "Ideal";
  else if (metaConsistenteValor > 0 && entradas >= metaConsistenteValor) faixaMeta = "Consistente";
  else if (metaMinima > 0 && entradas >= metaMinima) faixaMeta = "Mínima";

  return {
    mesKey,
    mesLabel: nomeMesAnoLongo(mesKey),
    status,
    entradas,
    saidas,
    resultado,
    kmRodado,
    litrosTotal,
    gastoGasolina,
    lucroPorKm,
    diasTrabalhados: diasComGanhos.size,
    metaAtingida: faixaMeta,
    config: { ...configBase },
    fechadoEm: status === "Fechado" ? new Date().toISOString() : null
  };
}

function executarManutencaoMensal(forcar = false) {
  const mesAtual = mesKeyDeData(new Date());
  const mesAnterior = deslocarMesKey(mesAtual, -1);
  let alterou = false;

  const mesesNosLancamentos = [...new Set(dados.map(d => obterMesKey(d.data)).filter(Boolean))];

  mesesNosLancamentos.forEach(mesKey => {
    // Todo mês anterior ao mês atual recebe/atualiza um consolidado.
    // Ele pode continuar aparecendo em Lançamentos por mais um mês.
    if (compararMesKey(mesKey, mesAtual) < 0) {
      const resumo = calcularResumoDoMes(mesKey, dados, config, "Fechado");
      const anterior = JSON.stringify(fechamentos[mesKey] || {});
      const novo = JSON.stringify(resumo);
      if (anterior !== novo) {
        fechamentos[mesKey] = resumo;
        alterou = true;
      }
    }
  });

  const tamanhoAntes = dados.length;
  dados = dados.filter(d => {
    const mes = obterMesKey(d.data);
    if (!mes) return true;
    // Mantém na aba Lançamentos apenas mês atual + mês anterior.
    return compararMesKey(mes, mesAnterior) >= 0;
  });

  if (dados.length !== tamanhoAntes) alterou = true;

  if (forcar && alterou) salvarBackupLocal();
  return alterou;
}

function renderizarHistoricoMensal(ctx = {}) {
  const container = document.getElementById("historicoMesesLista");
  if (!container) return;

  const mesAtual = mesKeyDeData(new Date());
  const meses = new Set(Object.keys(fechamentos || {}));
  meses.add(mesAtual);

  // Se houver lançamentos recentes ainda visíveis, exibe também o consolidado calculado.
  dados.forEach(d => {
    const mes = obterMesKey(d.data);
    if (mes) meses.add(mes);
  });

  const lista = [...meses].filter(Boolean).sort((a, b) => b.localeCompare(a));

  if (lista.length === 0) {
    container.innerHTML = `<div class="history-empty">Sem dados mensais para exibir ainda.</div>`;
    atualizarResumoHistorico([]);
    return;
  }

  const resumos = lista.map(mesKey => {
    const status = mesKey === mesAtual ? "Em andamento" : "Fechado";
    const resumo = mesKey === mesAtual
      ? calcularResumoDoMes(mesKey, dados, config, status)
      : (fechamentos[mesKey] || calcularResumoDoMes(mesKey, dados, config, status));
    return { mesKey, status, resumo };
  });

  atualizarResumoHistorico(resumos.map(item => item.resumo));
  container.innerHTML = "";

  resumos.forEach(({ mesKey, status, resumo }) => {
    const statusClasse = status === "Em andamento" ? "andamento" : "fechado";
    const metaClasse = classeMetaHistorico(resumo.metaAtingida);
    const metaMinima = (Number(resumo.config?.metaGasolina) || 0) + (Number(resumo.config?.metaSeguro) || 0) + (Number(resumo.config?.metaCustosGerais) || 0);
    const metaConsistente = metaMinima + (Number(resumo.config?.metaConsistente) || 0);
    const metaIdeal = metaMinima + (Number(resumo.config?.metaParcela) || 0);
    const metaReferencia = Math.max(metaIdeal, metaConsistente, metaMinima, resumo.entradas || 0, 1);
    const progresso = numeroPercentualSeguro(((resumo.entradas || 0) / metaReferencia) * 100);
    const diasTexto = (resumo.diasTrabalhados || 0) === 1 ? "1 dia trabalhado" : `${resumo.diasTrabalhados || 0} dias trabalhados`;
    const saidasAbs = Math.abs(Number(resumo.saidas) || 0);
    const statusLabel = resumo.metaAtingida || "Sem meta";
    const statusTexto = statusLabel === "Abaixo da mínima" ? "Abaixo da mínima" : `Faixa ${statusLabel.toLowerCase()}`;

    const card = document.createElement("div");
    card.className = `month-card-premium ${statusClasse} ${metaClasse}`;
    card.innerHTML = `
      <div class="month-card-head">
        <div class="month-title-wrap">
          <div class="month-icon">${iconeCalendario()}</div>
          <div>
            <div class="month-title">${textoSeguro(resumo.mesLabel || nomeMesAnoLongo(mesKey))}</div>
            <div class="month-sub">${textoSeguro(diasTexto)} · ${textoSeguro(statusTexto)}</div>
          </div>
        </div>
        <div class="month-badges">
          <span class="month-badge ${statusClasse}">${textoSeguro(status)}</span>
          <span class="month-badge ${metaClasse}">${textoSeguro(statusLabel)}</span>
        </div>
      </div>

      <div class="month-body">
        <div class="month-result-panel">
          <div class="month-result-label">Resultado do mês</div>
          <div class="month-result-value ${resumo.resultado >= 0 ? "positivo" : "negativo"}">${moeda(resumo.resultado)}</div>
          <div class="month-result-note">${moeda(resumo.entradas)} em ganhos · ${moeda(saidasAbs)} em saídas</div>

          <div class="month-progress-block">
            <div class="month-progress-top">
              <span>Progresso até a maior meta</span>
              <span>${Math.round(progresso)}%</span>
            </div>
            <div class="month-progress-track"><div class="month-progress-fill" style="width:${progresso}%"></div></div>
          </div>
        </div>

        <div class="month-kpi-grid">
          <div class="month-kpi"><span>Entradas</span><strong class="positivo">${moeda(resumo.entradas)}</strong><small>Ganhos Uber</small></div>
          <div class="month-kpi"><span>Saídas</span><strong class="negativo">${moeda(saidasAbs)}</strong><small>Custos lançados</small></div>
          <div class="month-kpi"><span>KM rodado</span><strong>${Math.round(resumo.kmRodado || 0).toLocaleString("pt-BR")}</strong><small>${numero(resumo.litrosTotal || 0)} litros</small></div>
          <div class="month-kpi"><span>Lucro/KM</span><strong>${moeda(resumo.lucroPorKm)}</strong><small>Resultado operacional por km</small></div>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function classeMetaHistorico(meta) {
  if (meta === "Ideal") return "meta-ideal";
  if (meta === "Consistente") return "meta-consistente";
  if (meta === "Mínima") return "meta-minima";
  return "meta-baixa";
}

function atualizarResumoHistorico(resumos) {
  const melhorEl = document.getElementById("historicoMelhorMes");
  const acumuladoEl = document.getElementById("historicoAcumulado");
  const totalEl = document.getElementById("historicoTotalMeses");
  if (!melhorEl || !acumuladoEl || !totalEl) return;

  if (!resumos || resumos.length === 0) {
    melhorEl.innerText = "—";
    acumuladoEl.innerText = moeda(0);
    totalEl.innerText = "0";
    return;
  }

  const acumulado = resumos.reduce((soma, r) => soma + (Number(r.resultado) || 0), 0);
  const melhor = [...resumos].sort((a, b) => (Number(b.resultado) || 0) - (Number(a.resultado) || 0))[0];

  melhorEl.innerText = melhor ? nomeMesAno(melhor.mesKey || "") : "—";
  acumuladoEl.innerText = moeda(acumulado);
  totalEl.innerText = String(resumos.length);
}

function iconeCalendario() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 2v4"/><path d="M16 2v4"/><rect x="3" y="4" width="18" height="18" rx="4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/><path d="M8 18h.01"/><path d="M12 18h.01"/></svg>`;
}

function metaProjetadaStatus(projecao, sobrevivencia, estabilidade, conforto) {
  if (conforto > 0 && projecao >= conforto) return "Você alcançou a meta de conforto do mês.";
  if (estabilidade > 0 && projecao >= estabilidade) return "Você alcançou estabilidade, em busca do conforto.";
  if (sobrevivencia > 0 && projecao >= sobrevivencia) return "Você sobreviveu, em busca da estabilidade.";
  return "Você está em busca da sobrevivência.";
}

function proximaMetaAtiva(valor, sobrevivencia, estabilidade, conforto) {
  if (sobrevivencia > 0 && valor < sobrevivencia) return { nome: "Sobrevivência", acao: "Para sobreviver", valor: sobrevivencia };
  if (estabilidade > 0 && valor < estabilidade) return { nome: "Estabilidade", acao: "Para alcançar estabilidade", valor: estabilidade };
  if (conforto > 0 && valor < conforto) return { nome: "Conforto", acao: "Para alcançar conforto", valor: conforto };
  return null;
}

function posicaoRitmo(projecao, sobrevivencia, estabilidade, conforto) {
  if (conforto > 0 && projecao >= conforto) return 100;
  if (estabilidade > 0 && projecao >= estabilidade && conforto > estabilidade) {
    return 70 + ((projecao - estabilidade) / (conforto - estabilidade)) * 30;
  }
  if (sobrevivencia > 0 && projecao >= sobrevivencia && estabilidade > sobrevivencia) {
    return 34 + ((projecao - sobrevivencia) / (estabilidade - sobrevivencia)) * 36;
  }
  if (sobrevivencia > 0) return (projecao / sobrevivencia) * 34;
  return 0;
}

function metaIcone(nome) {
  const icons = {
    Minima: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 12l2 2 4-4"/><circle cx="12" cy="12" r="9"/></svg>',
    Consistente: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    Ideal: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3v18"/><path d="M6 4h11l-2 4 2 4H6"/></svg>'
  };
  return icons[nome] || icons.Minima;
}

function atualizarDashboard(ctx) {
  if (!document.getElementById("dashboardProjecao")) return;

  const entradas = ctx.entradas || 0;
  const saidas = ctx.saidas || 0;
  const custosSemParcela = ctx.custosSemParcela || 0;
  const custosTotais = ctx.custosTotais || 0;
  const diasTrabalhadosValor = ctx.diasTrabalhadosValor || 0;
  const diasRestantes = ctx.diasRestantes || 0;
  const mediaDiaValor = ctx.mediaDiaValor || 0;

  // config.metaConsistente agora representa a sobra desejada acima da meta mínima.
  const sobraDesejadaConsistente = Number(config.metaConsistente) || 0;
  const metaConsistenteValor = custosSemParcela + sobraDesejadaConsistente;

  const projecaoMes = mediaDiaValor * (Number(config.diasPlanejados) || 0);
  const custosAtuais = Math.abs(saidas);
  const sobraProjetada = projecaoMes - custosSemParcela;
  
  dashboardProjecao.innerText = moeda(projecaoMes);
  if (document.getElementById("dashboardAtualMes")) dashboardAtualMes.innerText = moeda(entradas);
  if (document.getElementById("dashboardSobraProjetada")) dashboardSobraProjetada.innerText = moeda(sobraProjetada);
  if (document.getElementById("dashboardSobraBase")) {
    dashboardSobraBase.innerText = custosAtuais > custosSemParcela
         ? `Custos já lançados: ${moeda(custosAtuais)}`
         : `Base sobrevivência: ${moeda(custosSemParcela)}`;
  }
  const sobraBox = document.querySelector(".dashboard-sobra-box");
  if (sobraBox) {
    sobraBox.classList.toggle("positiva", sobraProjetada >= 0);
    sobraBox.classList.toggle("negativa", sobraProjetada < 0);
  }
  dashboardProjecaoSub.innerText = diasTrabalhadosValor > 0
    ? `Baseada em ${diasTrabalhadosValor} dia(s) trabalhado(s), média de ${moeda(mediaDiaValor)}`
    : "Comece registrando seus ganhos para gerar projeção";

  const statusTexto = diasTrabalhadosValor > 0
    ? metaProjetadaStatus(projecaoMes, custosSemParcela, metaConsistenteValor, custosTotais)
    : "Aguardando lançamentos";
  dashboardStatus.innerText = statusTexto;

  const posicao = Math.max(0, Math.min(posicaoRitmo(projecaoMes, custosSemParcela, metaConsistenteValor, custosTotais), 100));
  if (document.getElementById("ritmoPonteiro")) {
    const angulo = -90 + (posicao * 1.8);
    ritmoPonteiro.style.setProperty("--pointer-angle", `${angulo}deg`);
  }
  faixaTexto.innerText = diasTrabalhadosValor > 0
    ? `Projeção: ${moeda(projecaoMes)}. ${statusTexto}`
    : "Registre ganhos para calcular o ritmo do mês.";

  faixaMinima.innerText = `Sobrevivência ${moeda(custosSemParcela)}`;
  faixaConsistente.innerText = `Estabilidade ${moeda(metaConsistenteValor)}`;
  faixaIdeal.innerText = `Conforto ${moeda(custosTotais)}`;

  atualizarMetaCard("Minima", "Sobrevivência", custosSemParcela, entradas, projecaoMes);
  atualizarMetaCard("Consistente", "Estabilidade", metaConsistenteValor, entradas, projecaoMes);
  atualizarMetaCard("Ideal", "Conforto", custosTotais, entradas, projecaoMes);

  dashMediaDia.innerText = moeda(mediaDiaValor);
  dashMediaSub.innerText = diasTrabalhadosValor > 0 ? `${diasTrabalhadosValor} dia(s) trabalhado(s)` : "sem ganhos registrados";
  const proximaMeta = proximaMetaAtiva(entradas, custosSemParcela, metaConsistenteValor, custosTotais);
  const metaAjustadaCard = dashMetaAjustada.closest(".kpi-card");
  if (proximaMeta) {
    const valorDiaNecessario = diasRestantes > 0 ? Math.max((proximaMeta.valor - entradas) / diasRestantes, 0) : 0;
    metaAjustadaCard.style.display = "";
    dashProximaMetaLabel.innerText = proximaMeta.acao;
    dashMetaAjustada.innerText = `${moeda(valorDiaNecessario)}/dia`;
    dashMetaAjustada.parentElement.querySelector("p").innerText = `${proximaMeta.nome} · ${diasRestantes} dia(s) restantes`;
  } else {
    metaAjustadaCard.style.display = "none";
  }

  const semanas = calcularSemanasDoMes();
  const metaSemanalBase = proximaMeta || { nome: "Conforto", valor: custosTotais };
  const metaSemanal = metaSemanalBase.valor > 0 ? metaSemanalBase.valor / Math.max(semanas.length, 1) : 0;
  const semanaAtual = semanas.find(s => s.isAtual) || semanas[0] || { valor: 0 };
  const ganhoSemanaAtual = semanaAtual.valor || 0;
  const percSemana = metaSemanal > 0 ? Math.min((ganhoSemanaAtual / metaSemanal) * 100, 999) : 0;

  if (document.getElementById("dashSemanaExecutadoValor")) dashSemanaExecutadoValor.innerText = moeda(ganhoSemanaAtual);
  if (document.getElementById("dashMetaSemana")) dashMetaSemana.innerText = `Meta semanal: ${moeda(metaSemanal)}`;
  dashSemanaStatus.innerText = `${Math.round(percSemana)}%`;
  if (document.getElementById("dashSemanaLabel")) dashSemanaLabel.innerText = `${Math.round(percSemana)}% da meta semanal`;

  if (metaSemanal > 0) {
    const faltaSemana = Math.max(metaSemanal - ganhoSemanaAtual, 0);
    dashSemanaFalta.innerText = faltaSemana > 0 ? `Faltam ${moeda(faltaSemana)} nesta semana` : "Meta semanal atingida";
  } else {
    dashSemanaFalta.innerText = "Configure as metas";
  }

  const metaSemanalSemanasDoMes = metaConsistenteValor > 0 ? metaConsistenteValor / Math.max(semanas.length, 1) : 0;
  renderizarSemanas(semanas, metaSemanalSemanasDoMes);
}

function atualizarMetaCard(nome, rotulo, meta, atual, projetado) {
  const card = document.getElementById(`cardMeta${nome}`);
  const pctEl = document.getElementById(`dashPct${nome}`);
  const barEl = document.getElementById(`dashBar${nome}`);
  const progressoEl = document.getElementById(`dashProgresso${nome}`);
  const acaoEl = document.getElementById(`dashAcao${nome}`);

  if (!card || !pctEl || !barEl || !progressoEl || !acaoEl) return;

  card.classList.remove("ok", "alerta", "longe");

  if (!meta || meta <= 0) {
    pctEl.innerText = "—";
    barEl.style.width = "0%";
    progressoEl.innerHTML = `<div class="meta-line"><span>Executado</span><strong>${moeda(atual)}</strong></div><div class="meta-line"><span>Projeção</span><strong>${moeda(projetado || 0)}</strong></div>`;
    acaoEl.innerHTML = `<div class="meta-action-panel"><span class="meta-action-icon">${metaIcone(nome)}</span><span><strong>Meta não configurada</strong><small>Configure esta meta para acompanhar o ritmo.</small></span></div>`;
    card.classList.add("alerta");
    return;
  }

  const percentualExecutado = (atual / meta) * 100;
  const percentualProjetado = (projetado / meta) * 100;
  const percentualVisual = Math.min(Math.max(percentualExecutado, 0), 100);
  const faltaAtual = Math.max(meta - atual, 0);
  const acima = Math.max(atual - meta, 0);

  pctEl.innerText = `${Math.round(percentualExecutado)}%`;
  barEl.style.width = `${percentualVisual}%`;
  progressoEl.innerHTML = `
    <div class="meta-line"><span>Meta</span><strong>${moeda(meta)}</strong></div>
    <div class="meta-line"><span>Executado</span><strong>${moeda(atual)} · ${Math.round(percentualExecutado)}%</strong></div>
    <div class="meta-line"><span>Projeção</span><strong>${moeda(projetado || 0)} · ${Math.round(percentualProjetado)}%</strong></div>
  `;

  if (faltaAtual <= 0) {
    acaoEl.innerHTML = `<div class="meta-action-panel"><span class="meta-action-icon">${metaIcone(nome)}</span><span><strong>${rotulo} alcançada</strong><small>+${moeda(acima)} acima da meta</small></span></div>`;
    card.classList.add("ok");
  } else {
    acaoEl.innerHTML = `<div class="meta-action-panel"><span class="meta-action-icon">${metaIcone(nome)}</span><span><strong>${moeda(faltaAtual)} restantes</strong><small>${rotulo} em andamento</small></span></div>`;
    card.classList.add(percentualExecutado >= 70 ? "alerta" : "longe");
  }
}

function inicioDaSemanaSegunda(dataObj) {
  const d = new Date(dataObj.getFullYear(), dataObj.getMonth(), dataObj.getDate());
  const diaSemana = d.getDay(); // 0 domingo, 1 segunda...
  const diff = diaSemana === 0 ? -6 : 1 - diaSemana;
  d.setDate(d.getDate() + diff);
  return d;
}

function fimDaSemanaDomingo(dataObj) {
  const inicio = inicioDaSemanaSegunda(dataObj);
  const fim = new Date(inicio);
  fim.setDate(fim.getDate() + 6);
  return fim;
}

function formatarPeriodoSemana(inicio, fim) {
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const mesmoMes = inicio.getMonth() === fim.getMonth();
  if (mesmoMes) return `${inicio.getDate()}–${fim.getDate()} ${meses[fim.getMonth()]}`;
  return `${inicio.getDate()} ${meses[inicio.getMonth()]}–${fim.getDate()} ${meses[fim.getMonth()]}`;
}

function chaveSemana(dataObj) {
  const inicio = inicioDaSemanaSegunda(dataObj);
  return inicio.toISOString().slice(0, 10);
}

function calcularSemanasDoMes() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const primeiroDiaMes = new Date(ano, mes, 1);
  const ultimoDiaMes = new Date(ano, mes + 1, 0);
  const primeiraSegundaDoCiclo = inicioDaSemanaSegunda(primeiroDiaMes);
  const semanas = [];

  let cursor = new Date(primeiraSegundaDoCiclo);
  let numeroSemana = 1;

  while (cursor <= ultimoDiaMes) {
    const inicioCalendario = new Date(cursor);
    const fimCalendario = fimDaSemanaDomingo(inicioCalendario);

    // Recorte visual dentro do mês atual: nunca mostra dias do mês anterior/posterior.
    const inicioRecortado = inicioCalendario < primeiroDiaMes ? new Date(primeiroDiaMes) : new Date(inicioCalendario);
    const fimRecortado = fimCalendario > ultimoDiaMes ? new Date(ultimoDiaMes) : new Date(fimCalendario);

    semanas.push({
      key: chaveSemana(inicioCalendario),
      inicio: inicioRecortado,
      fim: fimRecortado,
      label: `S${numeroSemana}: ${formatarPeriodoSemana(inicioRecortado, fimRecortado)}`,
      valor: 0,
      isAtual: chaveSemana(inicioCalendario) === chaveSemana(hoje)
    });

    cursor.setDate(cursor.getDate() + 7);
    numeroSemana++;
  }

  dados.forEach(d => {
    if (d.descricao !== "Ganhos Uber" || !d.data) return;
    const partes = d.data.split("-");
    if (partes.length !== 3) return;
    const dataObj = new Date(Number(partes[0]), Number(partes[1]) - 1, Number(partes[2]));
    if (dataObj.getFullYear() !== ano || dataObj.getMonth() !== mes) return;
    const key = chaveSemana(dataObj);
    const semana = semanas.find(s => s.key === key);
    if (semana) semana.valor += Number(d.valor) || 0;
  });

  return semanas;
}

function renderizarSemanas(semanas, metaSemanal) {
  if (!dashSemanasLista) return;

  dashSemanasLista.innerHTML = "";
  semanas.forEach((semana, idx) => {
    const valor = semana.valor || 0;
    const pct = metaSemanal > 0 ? Math.min((valor / metaSemanal) * 100, 100) : 0;
    const linha = document.createElement("div");
    linha.className = "semana-linha";
    linha.innerHTML = `
      <span>${semana.label}</span>
      <div class="semana-barra"><div style="width:${pct}%"></div></div>
      <span class="semana-valor">${valor > 0 ? moeda(valor) : "—"}</span>
    `;
    dashSemanasLista.appendChild(linha);
  });
}



function classeIconeLancamento(item) {
  if (item.tipo === "ganho" || item.descricao === "Ganhos Uber") return "ganho-icon";
  if (item.tipo === "gasolina" || item.descricao === "Gasolina") return "gasolina-icon";
  if (item.tipo === "km" || item.descricao === "Atualização de KM") return "km-icon";
  return "despesa-icon";
}

function svgIconeLancamento(item) {
  if (item.tipo === "ganho" || item.descricao === "Ganhos Uber") {
    return '<svg class="icon" viewBox="0 0 24 24"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  }
  if (item.tipo === "gasolina" || item.descricao === "Gasolina") {
    return '<svg class="icon" viewBox="0 0 24 24"><path d="M4 20V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v14"/><path d="M4 10h11"/><path d="M15 7h2l3 3v7a2 2 0 0 1-2 2h-1"/></svg>';
  }
  if (item.tipo === "km" || item.descricao === "Atualização de KM") {
    return '<svg class="icon" viewBox="0 0 24 24"><path d="M5 16h14"/><path d="M7 16l1.2-5.2A3 3 0 0 1 11.1 8h1.8a3 3 0 0 1 2.9 2.8L17 16"/><path d="M7 16v2"/><path d="M17 16v2"/></svg>';
  }
  return '<svg class="icon" viewBox="0 0 24 24"><path d="M4 7h16"/><path d="M5 7l1.2 13h11.6L19 7"/><path d="M9 7V4h6v3"/></svg>';
}

function gerarId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function limitarTexto(valor, tamanho = 80) {
  return String(valor ?? "").trim().slice(0, tamanho);
}

function normalizarTipo(valor) {
  const tipoNormalizado = limitarTexto(valor, 20);
  return ["ganho", "gasolina", "despesas", "km", "credito", "debito"].includes(tipoNormalizado)
    ? tipoNormalizado
    : "";
}

function normalizarDataISO(valor) {
  const dataNormalizada = limitarTexto(valor, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dataNormalizada) ? dataNormalizada : "";
}

function normalizarDados() {
  dados = (Array.isArray(dados) ? dados : []).map(item => ({
    id: item.id ? String(item.id) : gerarId(),
    data: normalizarDataISO(item.data),
    tipo: normalizarTipo(item.tipo),
    descricao: limitarTexto(item.descricao),
    valor: Number(item.valor) || 0,
    litros: item.litros !== undefined && item.litros !== null && item.litros !== "" ? Number(item.litros) : null,
    km: item.km !== undefined && item.km !== null && item.km !== "" ? Number(item.km) : null
  }));
}

async function excluirPorId(id) {
  if (!confirm("Excluir este lançamento?")) return;

  const antes = dados.length;
  dados = dados.filter(item => String(item.id) !== String(id));

  if (dados.length === antes) {
    alert("Não encontrei este lançamento para excluir. Atualize a página e tente novamente.");
    return;
  }

  render();
  await salvarEstado();
}

function moeda(valor) {
  return (Number(valor) || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function numero(valor) {
  return (Number(valor) || 0).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function parseMoeda(valor) {
  if (!valor) return 0;

  let limpo = valor
    .toString()
    .replace("R$", "")
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  return parseFloat(limpo) || 0;
}

function parseDecimalBR(valor) {
  if (!valor) return 0;

  const texto = valor
    .toString()
    .replace(/\./g, "")
    .replace(",", ".")
    .trim();

  return parseFloat(texto) || 0;
}

function formatarCampoMoeda(campo) {
  const valor = parseMoeda(campo.value);
  campo.value = valor ? moeda(valor) : "";
}

function formatarData(dataISO) {
  if (!dataISO) return "-";
  const partes = dataISO.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function formatarDataLonga(dataISO) {
  if (!dataISO) return "";
  const partes = dataISO.split("-").map(Number);
  if (partes.length !== 3 || partes.some(Number.isNaN)) return "";

  const dataObj = new Date(partes[0], partes[1] - 1, partes[2]);
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  return `${dataObj.getDate()} de ${meses[dataObj.getMonth()]} de ${dataObj.getFullYear()}`;
}

function atualizarDataPorExtenso() {
  const el = document.getElementById("dataPorExtenso");
  if (!el) return;
  el.innerText = formatarDataLonga(data.value);
}

function definirDataHoje() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  data.value = `${ano}-${mes}-${dia}`;
  atualizarDataPorExtenso();
}

function preencherCamposConfig() {
  saldoInicial.value = config.saldoInicial ? moeda(config.saldoInicial) : "";
  metaGasolina.value = config.metaGasolina ? moeda(config.metaGasolina) : "";
  metaSeguro.value = config.metaSeguro ? moeda(config.metaSeguro) : "";
  metaCustosGerais.value = config.metaCustosGerais ? moeda(config.metaCustosGerais) : "";
  metaParcela.value = config.metaParcela ? moeda(config.metaParcela) : "";
  diasPlanejados.value = config.diasPlanejados || "";
  metaConsistente.value = config.metaConsistente ? moeda(config.metaConsistente) : "";
}

function salvarBackupLocal() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  localStorage.setItem(HISTORICO_KEY, JSON.stringify(fechamentos));
}

function carregarBackupLocal() {
  const salvo = localStorage.getItem(STORAGE_KEY);
  const configSalva = localStorage.getItem(CONFIG_KEY);
  const fechamentosSalvos = localStorage.getItem(HISTORICO_KEY);
  let dadosLocais = [];
  let configLocal = { ...config };
  let fechamentosLocais = {};

  if (salvo) {
    try { dadosLocais = JSON.parse(salvo) || []; } catch { dadosLocais = []; }
  }

  if (configSalva) {
    try { configLocal = { ...configLocal, ...JSON.parse(configSalva) }; } catch {}
  }

  if (fechamentosSalvos) {
    try { fechamentosLocais = JSON.parse(fechamentosSalvos) || {}; } catch { fechamentosLocais = {}; }
  }

  return { dadosLocais, configLocal, fechamentosLocais };
}

async function salvarEstado() {
  salvarBackupLocal();
  setStatusSync("Salvando...", "salvando");

  if (!firebaseCarregado) {
    setStatusSync("Backup local salvo", "salvando");
    return;
  }

  salvandoFirebase = true;
  try {
    await estadoRef.set({
      config,
      dados,
      fechamentos,
      atualizadoEm: new Date().toISOString()
    });
    setStatusSync("Sincronizado", "ok");
  } catch (erro) {
    console.error("Erro ao salvar no Firebase:", erro);
    setStatusSync("Falha ao sincronizar", "erro");
    alert("Não consegui salvar na nuvem. Os dados ficaram salvos neste navegador.");
  } finally {
    salvandoFirebase = false;
  }
}

function iniciarSincronizacaoFirebase() {
  const { dadosLocais, configLocal, fechamentosLocais } = carregarBackupLocal();

  estadoRef.onSnapshot(async (snapshot) => {
    firebaseCarregado = true;

    if (!snapshot.exists) {
      dados = dadosLocais;
      normalizarDados();
      config = { ...config, ...configLocal };
      fechamentos = { ...fechamentos, ...fechamentosLocais };
      executarManutencaoMensal(false);
      preencherCamposConfig();
      render();

      if (!bloqueiaRestauracaoLocal && (dados.length > 0 || Object.values(config).some(v => Number(v) > 0))) {
        await salvarEstado();
      }
      return;
    }

    const estado = snapshot.data() || {};
    const dadosFirebase = Array.isArray(estado.dados) ? estado.dados : [];
    const configFirebase = estado.config || {};
    const fechamentosFirebase = estado.fechamentos || {};
    const foiResetado = !!estado.resetadoEm;

    // Primeira migração: se a nuvem estiver vazia e existir backup local,
    // restaura apenas quando o estado NÃO veio de uma limpeza intencional.
    if (!bloqueiaRestauracaoLocal && !foiResetado && dadosFirebase.length === 0 && dadosLocais.length > 0) {
      dados = dadosLocais;
      normalizarDados();
      config = { ...config, ...configLocal };
      fechamentos = { ...fechamentos, ...fechamentosLocais };
      executarManutencaoMensal(false);
      preencherCamposConfig();
      render();
      await salvarEstado();
      return;
    }

    dados = dadosFirebase;
    normalizarDados();
    config = { ...config, ...configFirebase };
    fechamentos = { ...fechamentos, ...fechamentosFirebase };

    const houveManutencao = executarManutencaoMensal(false);
    salvarBackupLocal();
    preencherCamposConfig();
    render();
    setStatusSync("Sincronizado", "ok");

    if (houveManutencao && !salvandoFirebase) {
      await salvarEstado();
    }
  }, (erro) => {
    console.error("Erro ao carregar Firebase:", erro);
    const backup = carregarBackupLocal();
    dados = backup.dadosLocais;
    normalizarDados();
    config = { ...config, ...backup.configLocal };
    fechamentos = { ...fechamentos, ...backup.fechamentosLocais };
    preencherCamposConfig();
    render();
    setStatusSync("Usando backup local", "erro");
    alert("Não consegui carregar a nuvem. Usei o backup deste navegador.");
  });
}

function exportarJSON() {
  const pacote = {
    config,
    dados,
    fechamentos
  };

  const conteudo = JSON.stringify(pacote, null, 2);
  const blob = new Blob([conteudo], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = "controle-uber.json";
  link.click();

  URL.revokeObjectURL(url);
}

function importarJSON(event) {
  const arquivo = event.target.files[0];
  if (!arquivo) return;

  const leitor = new FileReader();

  leitor.onload = async function(e) {
    try {
      const importado = JSON.parse(e.target.result);

      if (Array.isArray(importado)) {
        dados = importado;
        normalizarDados();
      } else if (importado.dados && Array.isArray(importado.dados)) {
        dados = importado.dados;
        normalizarDados();
        if (importado.config) config = { ...config, ...importado.config };
        if (importado.fechamentos) fechamentos = { ...fechamentos, ...importado.fechamentos };
        if (importado.saldoInicial !== undefined) config.saldoInicial = parseFloat(importado.saldoInicial) || 0;
      } else {
        return alert("Arquivo inválido");
      }

      executarManutencaoMensal(false);
      preencherCamposConfig();
      render();
      await salvarEstado();

      event.target.value = "";
      alert("Dados importados com sucesso");
    } catch {
      alert("Erro ao importar arquivo");
    }
  };

  leitor.readAsText(arquivo);
}

async function limparDados() {
  if (!confirm("Vai apagar TUDO da nuvem e deste navegador. Continuar?")) return;

  bloqueiaRestauracaoLocal = true;

  dados = [];
  config = {
    saldoInicial: 0,
    metaGasolina: 0,
    metaSeguro: 0,
    metaCustosGerais: 0,
    metaParcela: 0,
    diasPlanejados: 0,
    metaConsistente: 0
  };
  fechamentos = {};

  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(CONFIG_KEY);
  localStorage.removeItem(HISTORICO_KEY);

  preencherCamposConfig();
  render();

  try {
    await estadoRef.set({
      config,
      dados: [],
      fechamentos: {},
      atualizadoEm: new Date().toISOString(),
      resetadoEm: new Date().toISOString()
    });

    alert("Tudo apagado com sucesso.");
  } catch (erro) {
    console.error("Erro ao limpar Firebase:", erro);
    alert("Não consegui apagar na nuvem. Tente novamente.");
  } finally {
    bloqueiaRestauracaoLocal = false;
  }
}


function atualizarCabecalho() {
  const meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const agora = new Date();
  const texto = `${meses[agora.getMonth()]} de ${agora.getFullYear()}`;
  const el = document.getElementById("mesAtualTexto");
  if (el) el.innerText = texto.charAt(0).toUpperCase() + texto.slice(1);
}

function setStatusSync(texto, modo = "ok") {
  const el = document.getElementById("statusSync");
  const dot = document.querySelector(".status-dot");
  const pill = document.querySelector(".status-pill");
  if (!el || !dot || !pill) return;
  el.innerText = texto;
  if (modo === "erro") {
    dot.style.background = "#ef4444";
    pill.style.color = "#991b1b";
    pill.style.borderColor = "#fecaca";
  } else if (modo === "salvando") {
    dot.style.background = "#f59e0b";
    pill.style.color = "#92400e";
    pill.style.borderColor = "#fed7aa";
  } else {
    dot.style.background = "#22c55e";
    pill.style.color = "#166534";
    pill.style.borderColor = "#bbf7d0";
  }
}

atualizarCabecalho();
definirDataHoje();
selecionar("ganho");
render();
iniciarSincronizacaoFirebase();
