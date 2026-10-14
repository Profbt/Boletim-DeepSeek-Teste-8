/* =========================================================
   BOLETIM DIGITAL — 8º ANO
   ========================================================= */

/* -------- DADOS BRUTOS --------
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

/* Frequência fictícia apenas para demonstração.
   No futuro esse valor será calculado de outra forma. */
const FREQUENCIA_DEMONSTRATIVA = 92;

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

/* -------- PROCESSAR DISCIPLINAS -------- */
const disciplinasProcessadas = dadosBrutos.map((item) => {
  const tri1 = normalizarNota(item.tri1);
  const tri2 = normalizarNota(item.tri2);
  const tri3 = normalizarNota(item.tri3);

  const media = calcularMedia([tri1, tri2, tri3]);
  const totalFaltas = item.faltas.reduce((acc, f) => acc + f, 0);
  const situacao = definirSituacao(media);

  return {
    disciplina: item.disciplina,
    tri1,
    tri2,
    tri3,
    media,
    totalFaltas,
    situacao
  };
});

/* -------- MONTAR A TABELA -------- */
function montarTabela() {
  const corpo = document.getElementById("corpoTabela");

  disciplinasProcessadas.forEach((d) => {
    const linha = document.createElement("tr");

    linha.innerHTML = `
      <td>${d.disciplina}</td>
      <td>${formatarNota(d.tri1)}</td>
      <td>${formatarNota(d.tri2)}</td>
      <td>${formatarNota(d.tri3)}</td>
      <td><strong>${formatarNota(d.media)}</strong></td>
      <td>${d.totalFaltas}</td>
      <td><span class="situacao ${d.situacao.classe}">${d.situacao.texto}</span></td>
    `;

    corpo.appendChild(linha);
  });
}

/* -------- MONTAR OS CARDS DE RESUMO -------- */
function montarCards() {
  const container = document.getElementById("cardsResumo");

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

    div.innerHTML = `
      <p class="card-titulo">${c.titulo}</p>
      <p class="card-valor">${c.valor}</p>
      <p class="card-descricao">${c.descricao}</p>
    `;

    container.appendChild(div);
  });
}

/* -------- INICIAR TUDO -------- */
montarCards();
montarTabela();