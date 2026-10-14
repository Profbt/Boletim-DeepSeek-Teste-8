/* =========================================================
   BOLETIM DIGITAL — 8º ANO
   Turma: 8A | Chamada: 12
   ========================================================= */

/* -------- CONFIGURAÇÃO FIXA DO ALUNO -------- */
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 12,
  apiUrl: "https://boletim-api.profbt.com.br"
};

/* -------- DADOS BRUTOS (fictícios — usados quando a API não tem dados) --------
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

/* -------- ESTADO DA SESSÃO (somente em memória) -------- */
let pinSessao = null;          // PIN digitado, mantido apenas enquanto a página estiver aberta
let dadosAtuais = null;        // { disciplinas: [ {disciplina, tri1, tri2, tri3, faltas:[...] } ] }
let modoEdicao = false;

/* =========================================================
   FUNÇÕES AUTORAIS PRESERVADAS
   ========================================================= */

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

/* =========================================================
   PROCESSAMENTO DOS DADOS
   ========================================================= */

/* Recebe um array no formato {disciplina, tri1, tri2, tri3, faltas:[...]}
   e devolve o array já processado (notas normalizadas, média, faltas totais, situação). */
function processarDisciplinas(lista) {
  return lista.map((item) => {
    const tri1 = normalizarNota(item.tri1);
    const tri2 = normalizarNota(item.tri2);
    const tri3 = normalizarNota(item.tri3);

    const faltas = Array.isArray(item.faltas) ? item.faltas : [0, 0, 0];
    const totalFaltas = faltas.reduce((acc, f) => acc + (Number(f) || 0), 0);

    const media = calcularMedia([tri1, tri2, tri3]);
    const situacao = definirSituacao(media);

    return {
      disciplina: item.disciplina,
      tri1,
      tri2,
      tri3,
      faltas: faltas.map((f) => Number(f) || 0),
      media,
      totalFaltas,
      situacao
    };
  });
}

/* =========================================================
   MONTAGEM DA INTERFACE
   ========================================================= */

/* -------- MONTAR A TABELA -------- */
function montarTabela() {
  const corpo = document.getElementById("corpoTabela");
  corpo.innerHTML = "";

  const processadas = processarDisciplinas(dadosAtuais.disciplinas);

  processadas.forEach((d) => {
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
  container.innerHTML = "";

  const processadas = processarDisciplinas(dadosAtuais.disciplinas);

  const mediasValidas = processadas
    .map((d) => d.media)
    .filter((m) => m !== null);

  const mediaGeral =
    mediasValidas.length > 0
      ? mediasValidas.reduce((acc, m) => acc + m, 0) / mediasValidas.length
      : null;

  const totalFaltas = processadas.reduce((acc, d) => acc + d.totalFaltas, 0);

  const bomDesempenho = processadas.filter(
    (d) => d.situacao.texto === "Bom desempenho"
  ).length;

  const atencao = processadas.filter(
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

/* -------- ATUALIZA CARDS + TABELA -------- */
function atualizarInterface() {
  montarCards();
  montarTabela();
}

/* =========================================================
   TELA DE ACESSO (PIN)
   ========================================================= */

const telaAcesso = document.getElementById("telaAcesso");
const conteudoBoletim = document.getElementById("conteudoBoletim");
const campoPin = document.getElementById("campoPin");
const botaoEntrar = document.getElementById("botaoEntrar");
const mensagemAcesso = document.getElementById("mensagemAcesso");

function mostrarMensagemAcesso(texto, tipo) {
  mensagemAcesso.textContent = texto;
  mensagemAcesso.className = "mensagem-acesso" + (tipo ? " " + tipo : "");
}

/* Abre o boletim no servidor usando turma, chamada e PIN */
async function abrirBoletim() {
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    mostrarMensagemAcesso("Digite o PIN para entrar.");
    return;
  }

  botaoEntrar.disabled = true;
  mostrarMensagemAcesso("Conectando...", "info");

  let resposta;
  try {
    resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/abrir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });
  } catch (erro) {
    botaoEntrar.disabled = false;
    mostrarMensagemAcesso("Não foi possível conectar ao servidor. Tente novamente.");
    return;
  }

  if (resposta.status === 401) {
    botaoEntrar.disabled = false;
    mostrarMensagemAcesso("Turma, chamada ou PIN inválidos.");
    return;
  }

  if (resposta.status === 429) {
    botaoEntrar.disabled = false;
    mostrarMensagemAcesso("Muitas tentativas. Aguarde um minuto e tente novamente.");
    return;
  }

  if (!resposta.ok) {
    botaoEntrar.disabled = false;
    mostrarMensagemAcesso("Não foi possível conectar ao servidor. Tente novamente.");
    return;
  }

  let json;
  try {
    json = await resposta.json();
  } catch (erro) {
    botaoEntrar.disabled = false;
    mostrarMensagemAcesso("Não foi possível conectar ao servidor. Tente novamente.");
    return;
  }

  /* Guarda o PIN apenas em memória */
  pinSessao = pinDigitado;
  campoPin.value = "";

  /* Define os dados a serem usados:
     - DADOS DA API > DADOS FICTÍCIOS DO SCRIPT
     - Se a API não devolver disciplinas, usa os dados fictícios do script.js */
  const dadosApi = json && json.dados ? json.dados : null;

  if (dadosApi && Array.isArray(dadosApi.disciplinas) && dadosApi.disciplinas.length > 0) {
    dadosAtuais = { disciplinas: dadosApi.disciplinas };
  } else {
    dadosAtuais = { disciplinas: JSON.parse(JSON.stringify(dadosBrutos)) };
  }

  /* Entra no boletim */
  telaAcesso.classList.add("oculto");
  conteudoBoletim.classList.remove("oculto");

  atualizarInterface();
}

botaoEntrar.addEventListener("click", abrirBoletim);
campoPin.addEventListener("keydown", (e) => {
  if (e.key === "Enter") abrirBoletim();
});

/* =========================================================
   EDIÇÃO DE NOTAS E FALTAS
   ========================================================= */

const botaoAlterar = document.getElementById("botaoAlterar");
const areaEdicao = document.getElementById("areaEdicao");
const corpoEdicao = document.getElementById("corpoEdicao");
const botaoSalvar = document.getElementById("botaoSalvar");
const botaoCancelar = document.getElementById("botaoCancelar");
const mensagemEdicao = document.getElementById("mensagemEdicao");

function mostrarMensagemEdicao(texto, tipo) {
  mensagemEdicao.textContent = texto;
  mensagemEdicao.className = "mensagem-edicao" + (tipo ? " " + tipo : "");
}

/* Retorna o valor em texto de uma nota para o input */
function notaParaInput(nota) {
  if (nota === null || nota === undefined) return "";
  return String(nota).replace(".", ",");
}

/* Cria os inputs de edição para cada disciplina */
function montarEdicao() {
  corpoEdicao.innerHTML = "";

  dadosAtuais.disciplinas.forEach((d, index) => {
    const linha = document.createElement("tr");

    const tri1 = normalizarNota(d.tri1);
    const tri2 = normalizarNota(d.tri2);
    const tri3 = normalizarNota(d.tri3);
    const faltas = Array.isArray(d.faltas) ? d.faltas : [0, 0, 0];

    linha.innerHTML = `
      <td>${d.disciplina}</td>
      <td><input class="campo-edicao" data-index="${index}" data-campo="tri1" type="text" inputmode="decimal" value="${notaParaInput(tri1)}"></td>
      <td><input class="campo-edicao" data-index="${index}" data-campo="tri2" type="text" inputmode="decimal" value="${notaParaInput(tri2)}"></td>
      <td><input class="campo-edicao" data-index="${index}" data-campo="tri3" type="text" inputmode="decimal" value="${notaParaInput(tri3)}"></td>
      <td><input class="campo-edicao" data-index="${index}" data-campo="falta1" type="text" inputmode="numeric" value="${faltas[0] ?? 0}"></td>
      <td><input class="campo-edicao" data-index="${index}" data-campo="falta2" type="text" inputmode="numeric" value="${faltas[1] ?? 0}"></td>
      <td><input class="campo-edicao" data-index="${index}" data-campo="falta3" type="text" inputmode="numeric" value="${faltas[2] ?? 0}"></td>
    `;

    corpoEdicao.appendChild(linha);
  });
}

/* Abre o modo de edição */
function abrirEdicao() {
  modoEdicao = true;
  montarEdicao();
  areaEdicao.classList.remove("oculto");
  botaoAlterar.disabled = true;
  mostrarMensagemEdicao("");
}

/* Cancela o modo de edição */
function cancelarEdicao() {
  modoEdicao = false;
  areaEdicao.classList.add("oculto");
  botaoAlterar.disabled = false;
  mostrarMensagemEdicao("");
}

botaoAlterar.addEventListener("click", abrirEdicao);
botaoCancelar.addEventListener("click", cancelarEdicao);

/* Lê os inputs e devolve o array de disciplinas com os valores atualizados.
   Retorna null se houver algum valor inválido. */
function lerEdicao() {
  const inputs = corpoEdicao.querySelectorAll(".campo-edicao");
  const atualizadas = dadosAtuais.disciplinas.map((d) => ({
    disciplina: d.disciplina,
    tri1: normalizarNota(d.tri1),
    tri2: normalizarNota(d.tri2),
    tri3: normalizarNota(d.tri3),
    faltas: Array.isArray(d.faltas) ? [...d.faltas] : [0, 0, 0]
  }));

  let invalido = false;

  inputs.forEach((input) => {
    input.classList.remove("invalido");

    const index = Number(input.dataset.index);
    const campo = input.dataset.campo;
    const valorTexto = input.value.trim();

    if (campo === "tri1" || campo === "tri2" || campo === "tri3") {
      /* Nota: vazio => null; senão deve ser número entre 0 e 10 */
      if (valorTexto === "") {
        atualizadas[index][campo] = null;
        return;
      }

      const numero = Number(valorTexto.replace(",", "."));
      if (isNaN(numero) || numero < 0 || numero > 10) {
        input.classList.add("invalido");
        invalido = true;
        return;
      }
      atualizadas[index][campo] = numero;
      return;
    }

    if (campo === "falta1" || campo === "falta2" || campo === "falta3") {
      /* Falta: somente inteiro >= 0 */
      const posicao = campo === "falta1" ? 0 : campo === "falta2" ? 1 : 2;

      if (valorTexto === "") {
        input.classList.add("invalido");
        invalido = true;
        return;
      }

      if (!/^\d+$/.test(valorTexto)) {
        input.classList.add("invalido");
        invalido = true;
        return;
      }

      atualizadas[index].faltas[posicao] = parseInt(valorTexto, 10);
    }
  });

  if (invalido) {
    return null;
  }

  return atualizadas;
}

/* Salva as alterações na API */
async function salvarAlteracoes() {
  const novasDisciplinas = lerEdicao();

  if (novasDisciplinas === null) {
    mostrarMensagemEdicao("Verifique os campos destacados em vermelho.", "erro");
    return;
  }

  botaoSalvar.disabled = true;
  botaoCancelar.disabled = true;
  mostrarMensagemEdicao("Salvando...");

  let resposta;
  try {
    resposta = await fetch(CONFIG_ALUNO.apiUrl + "/api/v1/boletins/salvar", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: { disciplinas: novasDisciplinas }
      })
    });
  } catch (erro) {
    botaoSalvar.disabled = false;
    botaoCancelar.disabled = false;
    mostrarMensagemEdicao("Não foi possível conectar ao servidor. Tente novamente.", "erro");
    return;
  }

  if (resposta.status === 401) {
    botaoSalvar.disabled = false;
    botaoCancelar.disabled = false;
    mostrarMensagemEdicao("Turma, chamada ou PIN inválidos.", "erro");
    return;
  }

  if (resposta.status === 429) {
    botaoSalvar.disabled = false;
    botaoCancelar.disabled = false;
    mostrarMensagemEdicao("Muitas tentativas. Aguarde um minuto e tente novamente.", "erro");
    return;
  }

  if (!resposta.ok) {
    botaoSalvar.disabled = false;
    botaoCancelar.disabled = false;
    mostrarMensagemEdicao("Não foi possível conectar ao servidor. Tente novamente.", "erro");
    return;
  }

  /* Sucesso */
  dadosAtuais.disciplinas = novasDisciplinas;
  atualizarInterface();

  botaoSalvar.disabled = false;
  botaoCancelar.disabled = false;

  mostrarMensagemEdicao("Dados salvos com sucesso.", "sucesso");

  cancelarEdicao();
}

botaoSalvar.addEventListener("click", salvarAlteracoes);
```Agora, no `github.dev`:

1. abra `script.js`;
2. pressione `Ctrl+A`;
3. apague tudo;
4. cole o novo código;
5. pressione `Ctrl+S`.

**Quando terminar, responda somente: PRONTO**