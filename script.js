/* =========================================================
   BOLETIM DIGITAL — 8º ANO — TURMA 8A — CHAMADA 12
   ========================================================= */

/* -------- CONFIGURAÇÃO FIXA DO ALUNO -------- */
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 12,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* -------- PIN EM MEMÓRIA (nunca persistido) -------- */
let pinSessao = null;

/* -------- ESTADO ATUAL -------- */
let disciplinasProcessadas = [];
let modoEdicao = false;

/* -------- DADOS BRUTOS LOCAIS (fallback) --------
   tri1 = 1º trimestre
   tri2 = 2º trimestre
   tri3 = 3º trimestre (ainda não lançado => null)
   faltas = [1º tri, 2º tri, 3º tri] */
const dadosBrutos = [
  { disciplina: "Língua Portuguesa",           tri1: 78, tri2: 15,  tri3: null, faltas: [5, 7, 0] },
  { disciplina: "Matemática",                  tri1: 75, tri2: 51,  tri3: null, faltas: [6, 8, 0] },
  { disciplina: "Ciências",                    tri1: 75, tri2: 25,  tri3: null, faltas: [2, 5, 0] },
  { disciplina: "História",                    tri1: 75, tri2: 98,  tri3: null, faltas: [9, 1, 0] },
  { disciplina: "Geografia",                   tri1: 75, tri2: 68,  tri3: null, faltas: [8, 3, 0] },
  { disciplina: "Língua Inglesa",              tri1: 75, tri2: 75,  tri3: null, faltas: [4, 8, 0] },
  { disciplina: "Arte",                        tri1: 75, tri2: 84,  tri3: null, faltas: [65, 50, 0] },
  { disciplina: "Educação Física",             tri1: 75, tri2: 98,  tri3: null, faltas: [8, 65, 0] },
  { disciplina: "Educação Digital",            tri1: 75, tri2: 100, tri3: null, faltas: [45, 8, 0] },
  { disciplina: "Educação Financeira",         tri1: 75, tri2: 59,  tri3: null, faltas: [5, 5, 0] },
  { disciplina: "Estudo Orientado",            tri1: 75, tri2: 65,  tri3: null, faltas: [2, 6, 0] },
  { disciplina: "Redação e Leitura",           tri1: 75, tri2: 77,  tri3: null, faltas: [3, 2, 0] },
  { disciplina: "Pensamento Lógico",           tri1: 75, tri2: 72,  tri3: null, faltas: [0, 3, 0] },
  { disciplina: "Literatura Arte e Movimento", tri1: 78, tri2: 88,  tri3: null, faltas: [1, 2, 0] },
  { disciplina: "Práticas Experimentais",      tri1: 55, tri2: 71,  tri3: null, faltas: [4, 1, 0] }
];

/* Frequência fictícia apenas para demonstração. */
const FREQUENCIA_DEMONSTRATIVA = 92;

/* -------- FUNÇÃO: normalizarNota -------- */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "string") {
    valor = valor.replace(",", ".").trim();
    if (valor === "") return null;
  }

  const numero = Number(valor);

  if (isNaN(numero)) {
    return null;
  }

  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  return null;
}

/* -------- FUNÇÃO: normalizarFaltas -------- */
function normalizarFaltas(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return 0;
  }
  const numero = parseInt(valor, 10);
  if (isNaN(numero) || numero < 0) {
    return 0;
  }
  return numero;
}

/* -------- FUNÇÃO: calcularMedia -------- */
function calcularMedia(notas) {
  const validas = notas.filter((n) => n !== null);

  if (validas.length === 0) {
    return null;
  }

  const soma = validas.reduce((acc, n) => acc + n, 0);
  return soma / validas.length;
}

/* -------- FUNÇÃO: definirSituacao -------- */
function definirSituacao(media) {
  if (media === null) {
    return { texto: "Nota ainda não disponível", classe: "situacao-neutra" };
  }
  if (media >= 6) {
    return { texto: "Bom desempenho", classe: "situacao-bom" };
  }
  return { texto: "Atenção", classe: "situacao-atencao" };
}

/* -------- FUNÇÃO: formatarNota -------- */
function formatarNota(nota) {
  if (nota === null) return "—";
  return nota.toFixed(1).replace(".", ",");
}

/* -------- PROCESSAR DISCIPLINAS -------- */
function processarDisciplinas(lista) {
  return lista.map((item) => {
    const tri1 = normalizarNota(item.tri1);
    const tri2 = normalizarNota(item.tri2);
    const tri3 = normalizarNota(item.tri3);

    const faltas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const f1 = normalizarFaltas(faltas[0]);
    const f2 = normalizarFaltas(faltas[1]);
    const f3 = normalizarFaltas(faltas[2]);

    const media = calcularMedia([tri1, tri2, tri3]);
    const totalFaltas = f1 + f2 + f3;
    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina,
      tri1,
      tri2,
      tri3,
      faltas: [f1, f2, f3],
      media,
      totalFaltas,
      situacao
    };
  });
}

/* -------- LIMPAR TELA -------- */
function limparTela() {
  const corpo = document.getElementById("corpoTabela");
  const cards = document.getElementById("cardsResumo");
  if (corpo) corpo.innerHTML = "";
  if (cards) cards.innerHTML = "";
}

/* -------- MONTAR A TABELA -------- */
function montarTabela() {
  const corpo = document.getElementById("corpoTabela");
  if (!corpo) return;
  corpo.innerHTML = "";

  disciplinasProcessadas.forEach((d, index) => {
    const linha = document.createElement("tr");

    const tdDisc = document.createElement("td");
    tdDisc.textContent = d.disciplina;
    linha.appendChild(tdDisc);

    const colunas = ["tri1", "tri2", "tri3"];
    colunas.forEach((chave) => {
      const td = document.createElement("td");
      if (modoEdicao) {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "campo-edicao";
        input.dataset.index = index;
        input.dataset.campo = chave;
        input.value = d[chave] === null ? "" : formatarNota(d[chave]);
        input.inputMode = "decimal";
        td.appendChild(input);
      } else {
        td.textContent = formatarNota(d[chave]);
      }
      linha.appendChild(td);
    });

    const tdMedia = document.createElement("td");
    const strong = document.createElement("strong");
    strong.textContent = formatarNota(d.media);
    tdMedia.appendChild(strong);
    linha.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    if (modoEdicao) {
      const wrap = document.createElement("span");
      ["f0", "f1", "f2"].forEach((chave, i) => {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "campo-edicao campo-falta";
        input.dataset.index = index;
        input.dataset.campo = chave;
        input.value = d.faltas[i];
        input.inputMode = "numeric";
        wrap.appendChild(input);
        if (i < 2) wrap.appendChild(document.createTextNode(" / "));
      });
      tdFaltas.appendChild(wrap);
    } else {
      tdFaltas.textContent = d.totalFaltas;
    }
    linha.appendChild(tdFaltas);

    const tdSit = document.createElement("td");
    const span = document.createElement("span");
    span.className = "situacao " + d.situacao.classe;
    span.textContent = d.situacao.texto;
    tdSit.appendChild(span);
    linha.appendChild(tdSit);

    corpo.appendChild(linha);
  });
}

/* -------- MONTAR OS CARDS DE RESUMO -------- */
function montarCards() {
  const container = document.getElementById("cardsResumo");
  if (!container) return;
  container.innerHTML = "";

  const mediasValidas = disciplinasProcessadas
    .map((d) => d.media)
    .filter((m) => m !== null);

  const mediaGeral =
    mediasValidas.length > 0
      ? mediasValidas.reduce((acc, m) => acc + m, 0) / mediasValidas.length
      : null;

  const totalFaltas = disciplinasProcessadas.reduce(
    (acc, d) => acc + d.totalFaltas,
    0
  );

  const bomDesempenho = disciplinasProcessadas.filter(
    (d) => d.situacao.texto === "Bom desempenho"
  ).length;

  const atencao = disciplinasProcessadas.filter(
    (d) => d.situacao.texto === "Atenção"
  ).length;

  const cards = [
    {
      titulo: "Média geral",
      valor: mediaGeral !== null ? formatarNota(mediaGeral) : "—",
      descricao: "Média das disciplinas com nota lançada",
      verde: true
    },
    {
      titulo: "Total de faltas",
      valor: totalFaltas,
      descricao: "Soma das faltas nos três trimestres",
      verde: false
    },
    {
      titulo: "Bom desempenho",
      valor: bomDesempenho,
      descricao: "Disciplinas com média ≥ 6,0",
      verde: true
    },
    {
      titulo: "Precisam de atenção",
      valor: atencao,
      descricao: "Disciplinas com média < 6,0",
      verde: false
    },
    {
      titulo: "Frequência",
      valor: FREQUENCIA_DEMONSTRATIVA + "%",
      descricao: "Frequência adequada (demonstrativa)",
      verde: true
    }
  ];

  cards.forEach((c) => {
    const div = document.createElement("div");
    div.className = "card" + (c.verde ? " card-verde" : "");

    const pTitulo = document.createElement("p");
    pTitulo.className = "card-titulo";
    pTitulo.textContent = c.titulo;

    const pValor = document.createElement("p");
    pValor.className = "card-valor";
    pValor.textContent = c.valor;

    const pDesc = document.createElement("p");
    pDesc.className = "card-descricao";
    pDesc.textContent = c.descricao;

    div.appendChild(pTitulo);
    div.appendChild(pValor);
    div.appendChild(pDesc);
    container.appendChild(div);
  });
}

/* =========================================================
   GRÁFICOS — CAMADA SOMENTE DE LEITURA
   Lê disciplinasProcessadas, nunca escreve nela.
   ========================================================= */

/* -------- Instâncias dos gráficos -------- */
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

/* -------- Referência interna (nunca exibida na página) -------- */
const REFERENCIA_INTERNA_FALTAS = 350;

/* -------- Cores (identidade do projeto) -------- */
const COR_GRAFICO_LARANJA = "#ff7a18";
const COR_GRAFICO_LARANJA_ESCURO = "#e0650a";
const COR_GRAFICO_VERDE = "#22a06b";
const COR_GRAFICO_PERIGO = "#c0392b";
const COR_GRAFICO_TEXTO = "#555555";
const COR_GRAFICO_GRADE = "#e3e6eb";

/* -------- Gráfico 1: Média por disciplina -------- */
function atualizarGraficoMedias() {
  const canvas = document.getElementById("graficoMediasDisciplinas");
  if (!canvas) return;

  if (graficoMedias) {
    graficoMedias.destroy();
    graficoMedias = null;
  }

  const rotulos = disciplinasProcessadas.map((d) => d.disciplina);
  const medias = disciplinasProcessadas.map((d) => d.media);
  const cores = medias.map((m) =>
    m !== null && m < 6 ? COR_GRAFICO_LARANJA : COR_GRAFICO_VERDE
  );

  graficoMedias = new Chart(canvas, {
    type: "bar",
    data: {
      labels: rotulos,
      datasets: [
        {
          label: "Média",
          data: medias,
          backgroundColor: cores,
          borderRadius: 4
        }
      ]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          min: 0,
          max: 10,
          ticks: { color: COR_GRAFICO_TEXTO },
          grid: { color: COR_GRAFICO_GRADE }
        },
        y: {
          ticks: {
            color: COR_GRAFICO_TEXTO,
            autoSkip: false,
            font: { size: 10 }
          },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (contexto) {
              const valor = contexto.parsed.x;
              if (valor === null || valor === undefined) {
                return contexto.label + ": sem nota";
              }
              return contexto.label + ": " + formatarNota(valor);
            }
          }
        }
      }
    }
  });
}

/* -------- Gráfico 2: Evolução da média geral -------- */
function atualizarGraficoEvolucao() {
  const canvas = document.getElementById("graficoEvolucaoTrimestres");
  if (!canvas) return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
    graficoEvolucao = null;
  }

  const mediaTri1 = calcularMedia(disciplinasProcessadas.map((d) => d.tri1));
  const mediaTri2 = calcularMedia(disciplinasProcessadas.map((d) => d.tri2));
  const mediaTri3 = calcularMedia(disciplinasProcessadas.map((d) => d.tri3));

  graficoEvolucao = new Chart(canvas, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Média geral",
          data: [mediaTri1, mediaTri2, mediaTri3],
          borderColor: COR_GRAFICO_LARANJA,
          backgroundColor: COR_GRAFICO_LARANJA,
          pointBackgroundColor: COR_GRAFICO_LARANJA_ESCURO,
          pointRadius: 5,
          tension: 0.25,
          spanGaps: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 10,
          ticks: { color: COR_GRAFICO_TEXTO },
          grid: { color: COR_GRAFICO_GRADE }
        },
        x: {
          ticks: { color: COR_GRAFICO_TEXTO },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (contexto) {
              const valor = contexto.parsed.y;
              if (valor === null || valor === undefined) {
                return contexto.label + ": sem nota";
              }
              return contexto.label + ": " + formatarNota(valor);
            }
          }
        }
      }
    }
  });
}

/* -------- Gráfico 3: Faltas por trimestre -------- */
function atualizarGraficoFaltas() {
  const canvas = document.getElementById("graficoFaltasTrimestres");
  if (!canvas) return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
    graficoFaltas = null;
  }

  let faltasTri1 = 0;
  let faltasTri2 = 0;
  let faltasTri3 = 0;

  disciplinasProcessadas.forEach((d) => {
    faltasTri1 += d.faltas[0];
    faltasTri2 += d.faltas[1];
    faltasTri3 += d.faltas[2];
  });

  const totalFaltas = faltasTri1 + faltasTri2 + faltasTri3;
  const emPerigo = totalFaltas >= REFERENCIA_INTERNA_FALTAS;

  /* Indicação visual: apenas a palavra "Perigo" */
  const card = document.getElementById("cardFaltas");
  const estado = document.getElementById("estadoFaltas");
  if (estado) {
    estado.innerHTML = "";
    if (emPerigo) {
      const badge = document.createElement("span");
      badge.className = "badge-perigo";
      badge.textContent = "Perigo";
      estado.appendChild(badge);
    }
  }
  if (card) {
    if (emPerigo) {
      card.classList.add("grafico-perigo");
    } else {
      card.classList.remove("grafico-perigo");
    }
  }

  const corBarras = emPerigo ? COR_GRAFICO_PERIGO : COR_GRAFICO_LARANJA;

  graficoFaltas = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [
        {
          label: "Faltas",
          data: [faltasTri1, faltasTri2, faltasTri3],
          backgroundColor: corBarras,
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: COR_GRAFICO_TEXTO, precision: 0 },
          grid: { color: COR_GRAFICO_GRADE }
        },
        x: {
          ticks: { color: COR_GRAFICO_TEXTO },
          grid: { display: false }
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (contexto) {
              return contexto.label + ": " + contexto.parsed.y + " faltas";
            }
          }
        }
      }
    }
  });
}

/* -------- Atualizar os três gráficos -------- */
function atualizarGraficos() {
  if (typeof Chart === "undefined") return;

  try {
    atualizarGraficoMedias();
    atualizarGraficoEvolucao();
    atualizarGraficoFaltas();
  } catch (e) {
    console.error("Erro ao atualizar os gráficos:", e);
  }
}

/* -------- RECONSTRUIR TELA -------- */
function reconstruirTela() {
  limparTela();
  montarCards();
  montarTabela();
  atualizarGraficos();
}

/* -------- COLETA DE DADOS DA TELA (edição) -------- */
function coletarDadosEditados() {
  const inputs = document.querySelectorAll(".campo-edicao");
  const copia = disciplinasProcessadas.map((d) => ({
    disciplina: d.disciplina,
    tri1: d.tri1,
    tri2: d.tri2,
    tri3: d.tri3,
    faltas: [d.faltas[0], d.faltas[1], d.faltas[2]]
  }));

  inputs.forEach((input) => {
    const index = parseInt(input.dataset.index, 10);
    const campo = input.dataset.campo;
    if (isNaN(index) || !copia[index]) return;

    if (campo === "tri1" || campo === "tri2" || campo === "tri3") {
      copia[index][campo] = normalizarNota(input.value);
    } else if (campo === "f0") {
      copia[index].faltas[0] = normalizarFaltas(input.value);
    } else if (campo === "f1") {
      copia[index].faltas[1] = normalizarFaltas(input.value);
    } else if (campo === "f2") {
      copia[index].faltas[2] = normalizarFaltas(input.value);
    }
  });

  return copia;
}

/* -------- MENSAGENS DE ERRO -------- */
function mensagemPorStatus(status) {
  if (status === 401) return "Turma, chamada ou PIN inválidos.";
  if (status === 429) return "Muitas tentativas. Aguarde um minuto e tente novamente.";
  return "Não foi possível conectar ao servidor. Tente novamente.";
}

/* -------- ABRIR BOLETIM (POST) -------- */
async function abrirBoletim(pin) {
  const url = CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir";

  let resposta;
  try {
    resposta = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pin
      })
    });
  } catch (e) {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }

  if (!resposta.ok) {
    throw new Error(mensagemPorStatus(resposta.status));
  }

  let json;
  try {
    json = await resposta.json();
  } catch (e) {
    json = {};
  }

  // Regra: se "dados" for null, usa dados locais. Caso contrário, usa exatamente o que veio.
  let lista;
  if (json && json.dados && Array.isArray(json.dados.disciplinas)) {
    lista = json.dados.disciplinas;
  } else {
    lista = dadosBrutos;
  }

  return lista;
}

/* -------- SALVAR BOLETIM (PUT) -------- */
async function salvarBoletim() {
  if (!pinSessao) return;

  const status = document.getElementById("statusSalvar");
  if (status) status.textContent = "Salvando...";

  const dadosEditados = coletarDadosEditados();

  const url = CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar";

  let resposta;
  try {
    resposta = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: { disciplinas: dadosEditados }
      })
    });
  } catch (e) {
    if (status) status.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    return;
  }

  if (!resposta.ok) {
    if (status) status.textContent = mensagemPorStatus(resposta.status);
    return;
  }

  // Sucesso: atualiza estado local e sai do modo edição
  disciplinasProcessadas = processarDisciplinas(dadosEditados);
  modoEdicao = false;
  alternarBotoesEdicao();
  reconstruirTela();

  if (status) status.textContent = "Dados salvos com sucesso.";
}

/* -------- ALTERNAR MODO EDIÇÃO -------- */
function alternarBotoesEdicao() {
  const btnAlterar = document.getElementById("botaoAlterar");
  const btnSalvar = document.getElementById("botaoSalvar");
  const btnCancelar = document.getElementById("botaoCancelar");
  const status = document.getElementById("statusSalvar");

  if (modoEdicao) {
    btnAlterar.classList.add("oculto");
    btnSalvar.classList.remove("oculto");
    btnCancelar.classList.remove("oculto");
  } else {
    btnAlterar.classList.remove("oculto");
    btnSalvar.classList.add("oculto");
    btnCancelar.classList.add("oculto");
    if (status) status.textContent = "";
  }
}

/* -------- INICIALIZAÇÃO DA TELA DE ACESSO -------- */
function iniciarAcesso() {
  const campoPin = document.getElementById("campoPin");
  const botaoEntrar = document.getElementById("botaoEntrar");
  const mensagem = document.getElementById("mensagemAcesso");

  async function tentarEntrar() {
    const pin = campoPin.value.trim();
    if (!pin) {
      mensagem.textContent = "Digite seu PIN.";
      return;
    }

    botaoEntrar.disabled = true;
    mensagem.textContent = "Entrando...";

    try {
      const lista = await abrirBoletim(pin);
      pinSessao = pin;
      campoPin.value = "";

      disciplinasProcessadas = processarDisciplinas(lista);
      modoEdicao = false;

      document.getElementById("telaAcesso").classList.add("oculto");
      document.getElementById("appBoletim").classList.remove("oculto");

      alternarBotoesEdicao();
      reconstruirTela();
    } catch (e) {
      mensagem.textContent = e.message;
      botaoEntrar.disabled = false;
    }
  }

  botaoEntrar.addEventListener("click", tentarEntrar);
  campoPin.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") tentarEntrar();
  });

  // Botões de ação
  document.getElementById("botaoAlterar").addEventListener("click", () => {
    modoEdicao = true;
    alternarBotoesEdicao();
    reconstruirTela();
  });

  document.getElementById("botaoCancelar").addEventListener("click", () => {
    modoEdicao = false;
    alternarBotoesEdicao();
    reconstruirTela();
  });

  document.getElementById("botaoSalvar").addEventListener("click", salvarBoletim);
}

/* -------- INICIAR TUDO -------- */
iniciarAcesso();