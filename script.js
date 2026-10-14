/* =========================================================
   BOLETIM DIGITAL — 8º ANO
   ========================================================= */

/* -------- CONFIGURAÇÃO FIXA DO ALUNO -------- */
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 12,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* -------- DADOS BRUTOS LOCAIS --------
   tri1 = 1º trimestre
   tri2 = 2º trimestre
   tri3 = 3º trimestre
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
  { disciplina: "Práticas Experimentais",       tri1: 55, tri2: 71,  tri3: null, faltas: [4, 1, 0] }
];

/* Frequência fictícia apenas para demonstração. */
const FREQUENCIA_DEMONSTRATIVA = 92;

/* Var de sessão em memória para o PIN */
let pinSessao = "";
let disciplinasAtuais = [];

/* -------- FUNÇÃO: normalizarNota -------- */
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  if (typeof valor === "string") {
    valor = valor.replace(",", ".").trim();
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

/* -------- DADOS INICIAIS NORMALIZADOS -------- */
function carregarDadosIniciaisLocais() {
  return dadosBrutos.map((item) => {
    const tri1 = normalizarNota(item.tri1);
    const tri2 = normalizarNota(item.tri2);
    const tri3 = normalizarNota(item.tri3);

    return {
      disciplina: item.disciplina,
      tri1,
      tri2,
      tri3,
      faltas: Array.isArray(item.faltas) ? [...item.faltas] : [0, 0, 0]
    };
  });
}

/* -------- PROCESSAR DISCIPLINAS -------- */
function processarDisciplinas(lista) {
  return lista.map((item) => {
    const tri1 = normalizarNota(item.tri1);
    const tri2 = normalizarNota(item.tri2);
    const tri3 = normalizarNota(item.tri3);

    const media = calcularMedia([tri1, tri2, tri3]);
    const faltasValidas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const totalFaltas = faltasValidas.reduce((acc, f) => acc + (Number(f) || 0), 0);
    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina,
      tri1,
      tri2,
      tri3,
      faltas: faltasValidas,
      media,
      totalFaltas,
      situacao
    };
  });
}

/* -------- MONTAR A TABELA -------- */
function montarTabela(disciplinasProc) {
  const corpo = document.getElementById("corpoTabela");
  if (!corpo) return;
  corpo.innerHTML = "";

  disciplinasProc.forEach((d) => {
    const linha = document.createElement("tr");

    const tdDisc = document.createElement("td");
    tdDisc.textContent = d.disciplina;
    linha.appendChild(tdDisc);

    const td1 = document.createElement("td");
    td1.textContent = formatarNota(d.tri1);
    linha.appendChild(td1);

    const td2 = document.createElement("td");
    td2.textContent = formatarNota(d.tri2);
    linha.appendChild(td2);

    const td3 = document.createElement("td");
    td3.textContent = formatarNota(d.tri3);
    linha.appendChild(td3);

    const tdMedia = document.createElement("td");
    const strMedia = document.createElement("strong");
    strMedia.textContent = formatarNota(d.media);
    tdMedia.appendChild(strMedia);
    linha.appendChild(tdMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = d.totalFaltas;
    linha.appendChild(tdFaltas);

    const tdSit = document.createElement("td");
    const spanSit = document.createElement("span");
    spanSit.className = `situacao ${d.situacao.classe}`;
    spanSit.textContent = d.situacao.texto;
    tdSit.appendChild(spanSit);
    linha.appendChild(tdSit);

    corpo.appendChild(linha);
  });
}

/* -------- MONTAR OS CARDS DE RESUMO -------- */
function montarCards(disciplinasProc) {
  const container = document.getElementById("cardsResumo");
  if (!container) return;
  container.innerHTML = "";

  const mediasValidas = disciplinasProc
    .map((d) => d.media)
    .filter((m) => m !== null);

  const mediaGeral =
    mediasValidas.length > 0
      ? mediasValidas.reduce((acc, m) => acc + m, 0) / mediasValidas.length
      : null;

  const totalFaltas = disciplinasProc.reduce(
    (acc, d) => acc + d.totalFaltas,
    0
  );

  const bomDesempenho = disciplinasProc.filter(
    (d) => d.situacao.texto === "Bom desempenho"
  ).length;

  const atencao = disciplinasProc.filter(
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

/* -------- ATUALIZAR TELA -------- */
function atualizarTela() {
  const proc = processarDisciplinas(disciplinasAtuais);
  montarCards(proc);
  montarTabela(proc);
}

/* -------- AUTENTICAÇÃO E CONEXÃO -------- */
async function realizarLogin() {
  const inputPin = document.getElementById("campoPin");
  const msgLogin = document.getElementById("msgLogin");
  
  if (!inputPin || !msgLogin) return;

  const pinDigitado = inputPin.value.trim();

  if (!pinDigitado) {
    msgLogin.textContent = "Por favor, digite o PIN.";
    msgLogin.className = "msg-status erro";
    return;
  }

  msgLogin.textContent = "Conectando...";
  msgLogin.className = "msg-status info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 401) {
      msgLogin.textContent = "Turma, chamada ou PIN inválidos.";
      msgLogin.className = "msg-status erro";
      return;
    }

    if (resposta.status === 429) {
      msgLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      msgLogin.className = "msg-status erro";
      return;
    }

    if (!resposta.ok) {
      msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      msgLogin.className = "msg-status erro";
      return;
    }

    const resultado = await resposta.json();

    pinSessao = pinDigitado;
    inputPin.value = "";

    if (resultado && resultado.dados && Array.isArray(resultado.dados.disciplinas) && resultado.dados.disciplinas.length > 0) {
      disciplinasAtuais = resultado.dados.disciplinas;
    } else {
      disciplinasAtuais = carregarDadosIniciaisLocais();
    }

    const areaLogin = document.getElementById("areaLogin");
    const areaBoletim = document.getElementById("areaBoletim");

    if (areaLogin) areaLogin.style.display = "none";
    if (areaBoletim) areaBoletim.style.display = "block";

    atualizarTela();

  } catch (erro) {
    msgLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    msgLogin.className = "msg-status erro";
  }
}

/* -------- TABELA DE EDIÇÃO -------- */
function montarTabelaEdicao() {
  const corpoEdicao = document.getElementById("corpoEdicao");
  if (!corpoEdicao) return;
  corpoEdicao.innerHTML = "";

  disciplinasAtuais.forEach((d, idx) => {
    const linha = document.createElement("tr");

    const tdNome = document.createElement("td");
    tdNome.textContent = d.disciplina;
    linha.appendChild(tdNome);

    const f1 = Array.isArray(d.faltas) ? d.faltas[0] : 0;
    const f2 = Array.isArray(d.faltas) ? d.faltas[1] : 0;
    const f3 = Array.isArray(d.faltas) ? d.faltas[2] : 0;

    linha.innerHTML += `
      <td><input type="text" class="campo-edicao campo-nota" data-idx="${idx}" data-field="tri1" value="${d.tri1 !== null && d.tri1 !== undefined ? String(d.tri1).replace('.', ',') : ''}" /></td>
      <td><input type="text" class="campo-edicao campo-nota" data-idx="${idx}" data-field="tri2" value="${d.tri2 !== null && d.tri2 !== undefined ? String(d.tri2).replace('.', ',') : ''}" /></td>
      <td><input type="text" class="campo-edicao campo-nota" data-idx="${idx}" data-field="tri3" value="${d.tri3 !== null && d.tri3 !== undefined ? String(d.tri3).replace('.', ',') : ''}" /></td>
      <td><input type="text" class="campo-edicao campo-falta" data-idx="${idx}" data-field="f1" value="${f1 !== null && f1 !== undefined ? f1 : 0}" /></td>
      <td><input type="text" class="campo-edicao campo-falta" data-idx="${idx}" data-field="f2" value="${f2 !== null && f2 !== undefined ? f2 : 0}" /></td>
      <td><input type="text" class="campo-edicao campo-falta" data-idx="${idx}" data-field="f3" value="${f3 !== null && f3 !== undefined ? f3 : 0}" /></td>
    `;

    corpoEdicao.appendChild(linha);
  });
}

function validarNotaInput(valStr) {
  if (valStr.trim() === "") return { valido: true, valor: null };
  const strLimpa = valStr.trim().replace(",", ".");
  const num = Number(strLimpa);
  if (isNaN(num) || num < 0 || num > 10) {
    return { valido: false };
  }
  return { valido: true, valor: num };
}

function validarFaltaInput(valStr) {
  if (valStr.trim() === "") return { valido: false };
  const strLimpa = valStr.trim();
  if (!/^\d+$/.test(strLimpa)) {
    return { valido: false };
  }
  const num = Number(strLimpa);
  if (num < 0) return { valido: false };
  return { valido: true, valor: num };
}

async function salvarEdicao() {
  const msgEdicao = document.getElementById("msgEdicao");
  if (!msgEdicao) return;
  msgEdicao.textContent = "";
  msgEdicao.className = "msg-status";

  const inputs = document.querySelectorAll(".campo-edicao");
  let temErro = false;

  inputs.forEach((input) => input.classList.remove("campo-invalido"));

  const novasDisciplinas = JSON.parse(JSON.stringify(disciplinasAtuais));

  inputs.forEach((input) => {
    const idx = Number(input.getAttribute("data-idx"));
    const field = input.getAttribute("data-field");
    const val = input.value;

    if (field.startsWith("tri")) {
      const res = validarNotaInput(val);
      if (!res.valido) {
        input.classList.add("campo-invalido");
        temErro = true;
      } else {
        novasDisciplinas[idx][field] = res.valor;
      }
    } else if (field.startsWith("f")) {
      const res = validarFaltaInput(val);
      if (!res.valido) {
        input.classList.add("campo-invalido");
        temErro = true;
      } else {
        const pos = field === "f1" ? 0 : field === "f2" ? 1 : 2;
        if (!Array.isArray(novasDisciplinas[idx].faltas)) {
          novasDisciplinas[idx].faltas = [0, 0, 0];
        }
        novasDisciplinas[idx].faltas[pos] = res.valor;
      }
    }
  });

  if (temErro) {
    msgEdicao.textContent = "Existem campos com valores inválidos. Notas devem ser de 0 a 10 e faltas números inteiros ≥ 0.";
    msgEdicao.className = "msg-status erro";
    return;
  }

  msgEdicao.textContent = "Salvando...";
  msgEdicao.className = "msg-status info";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      msgEdicao.textContent = "Erro ao salvar alterações no servidor. Tente novamente.";
      msgEdicao.className = "msg-status erro";
      return;
    }

    disciplinasAtuais = novasDisciplinas;
    atualizarTela();

    msgEdicao.textContent = "Dados salvos com sucesso.";
    msgEdicao.className = "msg-status sucesso";

    setTimeout(() => {
      const areaEdicao = document.getElementById("areaEdicao");
      if (areaEdicao) areaEdicao.style.display = "none";
      msgEdicao.textContent = "";
    }, 1200);

  } catch (e) {
    msgEdicao.textContent = "Não foi possível conectar ao servidor para salvar.";
    msgEdicao.className = "msg-status erro";
  }
}

/* -------- INICIALIZAÇÃO DE EVENTOS -------- */
function inicializarEventos() {
  const btnEntrar = document.getElementById("btnEntrar");
  const campoPin = document.getElementById("campoPin");
  const btnEditar = document.getElementById("btnEditar");
  const btnCancelar = document.getElementById("btnCancelar");
  const btnSalvar = document.getElementById("btnSalvar");

  if (btnEntrar) {
    btnEntrar.addEventListener("click", realizarLogin);
  }

  if (campoPin) {
    campoPin.addEventListener("keypress", (e) => {
      if (e.key === "Enter") realizarLogin();
    });
  }

  if (btnEditar) {
    btnEditar.addEventListener("click", () => {
      montarTabelaEdicao();
      const areaEdicao = document.getElementById("areaEdicao");
      const msgEdicao = document.getElementById("msgEdicao");
      if (areaEdicao) areaEdicao.style.display = "block";
      if (msgEdicao) msgEdicao.textContent = "";
    });
  }

  if (btnCancelar) {
    btnCancelar.addEventListener("click", () => {
      const areaEdicao = document.getElementById("areaEdicao");
      if (areaEdicao) areaEdicao.style.display = "none";
    });
  }

  if (btnSalvar) {
    btnSalvar.addEventListener("click", salvarEdicao);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", inicializarEventos);
} else {
  inicializarEventos();
}