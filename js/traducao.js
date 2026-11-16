// traducao.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Banco de termos protegidos contra traducao e inicializacao do widget Google Translate.

// Banco de palavras, siglas e nomes próprios que NÃO devem ser traduzidos pelo Google Tradutor.
// Adicione novos termos ou siglas a esta lista conforme necessário.
window.TERMOS_NAO_TRADUZIR = [
  "SENAI CIMATEC",
  "NEI",
  "FIEB",
  "ABEIN",
  "IBGE",
  "ENCE",
  "CNPq",
  "Lattes",
  "IPEA",
  "UFBA",
  "UFSCar",
  "UFF",
  "USP/ESALQ",
  "USP",
  "ESALQ",
  "MIDR",
  "PNUD",
  "SEI",
  "SEDUR",
  "SETRE",
  "PD&I",
  "P&D&I",
  "CT&I",
  "White Papers",
  "White Paper",
  "White paper",
  "Benchmarking"
];

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function criarExpressaoTermos() {
  const lista = Array.isArray(window.TERMOS_NAO_TRADUZIR)
    ? window.TERMOS_NAO_TRADUZIR.filter(Boolean)
    : [];

  if (lista.length === 0) {
    return null;
  }

  // Ordena do maior para o menor para proteger expressões compostas antes de termos isolados.
  const ordenados = lista
    .slice()
    .sort(function (a, b) {
      return b.length - a.length;
    })
    .map(escaparRegex);

  return new RegExp(
    "(?<![\\p{L}\\p{N}_])(" + ordenados.join("|") + ")(?![\\p{L}\\p{N}_])",
    "gu"
  );
}

function noJaProtegidoOuIgnorado(no) {
  let atual = no.parentElement;
  while (atual) {
    const tag = atual.tagName;
    if (
      tag === "SCRIPT" ||
      tag === "STYLE" ||
      tag === "NOSCRIPT" ||
      tag === "TEXTAREA" ||
      tag === "CODE" ||
      tag === "PRE"
    ) {
      return true;
    }
    if (
      atual.getAttribute("translate") === "no" ||
      atual.classList.contains("notranslate")
    ) {
      return true;
    }
    atual = atual.parentElement;
  }
  return false;
}

function protegerTermosContraTraducao(raiz) {
  const container = raiz || document.body;
  if (!container || typeof document.createTreeWalker !== "function") {
    return;
  }

  const regex = criarExpressaoTermos();
  if (!regex) {
    return;
  }

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT,
    null
  );

  const nosParaProcessar = [];
  let noAtual = walker.nextNode();
  while (noAtual) {
    if (
      noAtual.nodeValue &&
      noAtual.nodeValue.trim().length > 0 &&
      !noJaProtegidoOuIgnorado(noAtual)
    ) {
      regex.lastIndex = 0;
      if (regex.test(noAtual.nodeValue)) {
        nosParaProcessar.push(noAtual);
      }
    }
    noAtual = walker.nextNode();
  }

  nosParaProcessar.forEach(function (noTexto) {
    const texto = noTexto.nodeValue;
    regex.lastIndex = 0;

    const fragmento = document.createDocumentFragment();
    let ultimoIndice = 0;
    let match;

    while ((match = regex.exec(texto)) !== null) {
      if (match.index > ultimoIndice) {
        fragmento.appendChild(
          document.createTextNode(texto.slice(ultimoIndice, match.index))
        );
      }

      const span = document.createElement("span");
      span.setAttribute("translate", "no");
      span.className = "notranslate";
      span.textContent = match[0];
      fragmento.appendChild(span);

      ultimoIndice = regex.lastIndex;
    }

    if (ultimoIndice < texto.length) {
      fragmento.appendChild(
        document.createTextNode(texto.slice(ultimoIndice))
      );
    }

    if (noTexto.parentNode) {
      noTexto.parentNode.replaceChild(fragmento, noTexto);
    }
  });
}

window.protegerTermosContraTraducao = protegerTermosContraTraducao;
protegerTermosContraTraducao(document.body);

function googleTranslateElementInit() {
  protegerTermosContraTraducao(document.body);

  new google.translate.TranslateElement(
    {
      pageLanguage: "pt",
      includedLanguages: "pt,en,es",
      autoDisplay: false
    },
    "google_translate_element"
  );

  const idiomaSalvo =
    localStorage.getItem("idioma-nei") || "pt";

  if (idiomaSalvo === "pt") {
    return;
  }

  let tentativas = 0;

  const temporizador = setInterval(function () {
    const seletorGoogle =
      document.querySelector(".goog-te-combo");

    tentativas += 1;

    if (seletorGoogle) {
      clearInterval(temporizador);

      if (seletorGoogle.value !== idiomaSalvo) {
        seletorGoogle.value = idiomaSalvo;

        seletorGoogle.dispatchEvent(
          new Event("change", {
            bubbles: true
          })
        );
      }

      return;
    }

    if (tentativas >= 20) {
      clearInterval(temporizador);

      console.error(
        "O seletor do Google Translate não foi carregado."
      );
    }
  }, 250);
}

// Só baixa o widget do Google Translate se o idioma salvo não for português.
if ((localStorage.getItem("idioma-nei") || "pt") !== "pt") {
  const elementoTradutor = document.createElement("script");
  elementoTradutor.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(elementoTradutor);
}
