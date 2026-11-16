// traducao.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Motor de tradução automática do DOM (PT -> EN / ES) com banco de siglas protegidas,
// dicionário de correções pontuais, cache local e observação de conteúdo dinâmico (MutationObserver).

(function () {
  // 1. BANCO DE PALAVRAS E SIGLAS QUE NÃO DEVEM SER TRADUZIDAS
  // Adicione aqui siglas, nomes de instituições ou termos que devem permanecer idênticos em qualquer idioma.
  window.TERMOS_NAO_TRADUZIR = [
    "SENAI CIMATEC",
    "NEI",
    "FIEB",
    "ABEIN",
    "IBGE",
    "ENCE",
    "CNPq",
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
    "Benchmarking",
    "Supabase"
  ];

  // 2. BANCO DE CORREÇÕES PONTUAIS DE TRADUÇÃO
  // Caso o tradutor automático traduza algum termo específico de forma indesejada,
  // adicione apenas esse termo aqui com a tradução exata desejada para inglês (en) e espanhol (es).
  window.CORRECOES_TRADUCAO = {
    "Núcleo de Economia Industrial": {
      en: "Industrial Economics Center",
      es: "Núcleo de Economía Industrial"
    },
    "Currículo Lattes": {
      en: "Lattes CV",
      es: "Currículum Lattes"
    },
    "Lattes": {
      en: "Lattes",
      es: "Lattes"
    },
    "Nota técnica": {
      en: "Technical Note",
      es: "Nota Técnica"
    },
    "Notas técnicas": {
      en: "Technical Notes",
      es: "Notas Técnicas"
    },
    "Nota técnicas": {
      en: "Technical Notes",
      es: "Notas Técnicas"
    },
    "Estudos setoriais": {
      en: "Sectoral Studies",
      es: "Estudios Sectoriales"
    },
    "Estudo Setorial": {
      en: "Sectoral Study",
      es: "Estudio Sectorial"
    },
    "Pesquisador bolsista": {
      en: "Research Fellow",
      es: "Investigador Becario"
    },
    "Pesquisador Bolsista": {
      en: "Research Fellow",
      es: "Investigador Becario"
    }
  };

  const PREFIXO_CACHE = "nei_trad_v2_";
  const ATRIBUTOS_TRADUZIVEIS = ["placeholder", "title", "aria-label"];
  const TAGS_IGNORADAS = {
    SCRIPT: true,
    STYLE: true,
    NOSCRIPT: true,
    TEXTAREA: true,
    CODE: true,
    PRE: true,
    SVG: true
  };

  const cachesMemoria = {
    en: carregarCache("en"),
    es: carregarCache("es")
  };

  function carregarCache(idioma) {
    try {
      const bruto = localStorage.getItem(PREFIXO_CACHE + idioma);
      return bruto ? JSON.parse(bruto) : {};
    } catch (_) {
      return {};
    }
  }

  function salvarCache(idioma) {
    try {
      localStorage.setItem(
        PREFIXO_CACHE + idioma,
        JSON.stringify(cachesMemoria[idioma] || {})
      );
    } catch (_) {
      // ignora se o localStorage atingir o limite
    }
  }

  function escaparRegex(texto) {
    return texto.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function criarRegexGlossario() {
    const correcoes = window.CORRECOES_TRADUCAO
      ? Object.keys(window.CORRECOES_TRADUCAO)
      : [];
    const protegidos = Array.isArray(window.TERMOS_NAO_TRADUZIR)
      ? window.TERMOS_NAO_TRADUZIR
      : [];

    const todos = Array.from(new Set(correcoes.concat(protegidos))).filter(
      Boolean
    );

    if (todos.length === 0) {
      return null;
    }

    todos.sort(function (a, b) {
      return b.length - a.length;
    });

    return new RegExp(
      "(?<![\\p{L}\\p{N}_])(" +
        todos.map(escaparRegex).join("|") +
        ")(?![\\p{L}\\p{N}_])",
      "gu"
    );
  }

  function prepararTextoParaTraducao(textoLimpo, idioma, regexGlossario) {
    const correcoes = window.CORRECOES_TRADUCAO || {};
    if (correcoes[textoLimpo] && correcoes[textoLimpo][idioma]) {
      return {
        pronto: true,
        resultado: correcoes[textoLimpo][idioma]
      };
    }

    const substituicoes = [];
    let textoMascarado = textoLimpo;

    if (regexGlossario) {
      regexGlossario.lastIndex = 0;
      textoMascarado = textoLimpo.replace(regexGlossario, function (termo) {
        const idx = substituicoes.length;
        if (correcoes[termo] && correcoes[termo][idioma]) {
          substituicoes.push(correcoes[termo][idioma]);
        } else {
          substituicoes.push(termo);
        }
        return "{{" + idx + "}}";
      });
    }

    const semMarcadores = textoMascarado
      .replace(/\{\{\d+\}\}/g, "")
      .replace(/[^\p{L}]+/gu, "");

    if (semMarcadores.length === 0) {
      return {
        pronto: true,
        resultado: restaurarMarcadores(textoMascarado, substituicoes)
      };
    }

    return {
      pronto: false,
      textoMascarado: textoMascarado,
      substituicoes: substituicoes
    };
  }

  function restaurarMarcadores(textoTraduzido, substituicoes) {
    return String(textoTraduzido || "").replace(
      /\{\{\s*(\d+)\s*\}\}/g,
      function (completo, indiceStr) {
        const idx = Number(indiceStr);
        return idx < substituicoes.length ? substituicoes[idx] : completo;
      }
    );
  }

  async function solicitarTraducaoLote(textosMascarados, idiomaDestino) {
    if (!textosMascarados || textosMascarados.length === 0) {
      return [];
    }

    const bloco = textosMascarados.join("\n");
    const url =
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=" +
      encodeURIComponent(idiomaDestino) +
      "&dt=t&q=" +
      encodeURIComponent(bloco);

    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error("Falha na requisição de tradução: " + resposta.status);
    }

    const dados = await resposta.json();
    const textoUnido = Array.isArray(dados && dados[0])
      ? dados[0]
          .map(function (parte) {
            return (parte && parte[0]) || "";
          })
          .join("")
      : "";

    const linhas = textoUnido.split("\n");
    if (linhas.length === textosMascarados.length) {
      return linhas.map(function (l) {
        return l.trim();
      });
    }

    // Fallback individual caso alguma frase tenha quebrado linha de forma diferente
    const resultadosIndividuais = [];
    for (let i = 0; i < textosMascarados.length; i += 1) {
      try {
        const urlInd =
          "https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=" +
          encodeURIComponent(idiomaDestino) +
          "&dt=t&q=" +
          encodeURIComponent(textosMascarados[i]);
        const resInd = await fetch(urlInd);
        const dadosInd = await resInd.json();
        const tradInd = Array.isArray(dadosInd && dadosInd[0])
          ? dadosInd[0]
              .map(function (p) {
                return (p && p[0]) || "";
              })
              .join("")
          : textosMascarados[i];
        resultadosIndividuais.push(tradInd.trim());
      } catch (_) {
        resultadosIndividuais.push(textosMascarados[i]);
      }
    }
    return resultadosIndividuais;
  }

  async function traduzirListaTextos(textosUnicosPt, idioma) {
    if (!cachesMemoria[idioma]) {
      cachesMemoria[idioma] = carregarCache(idioma);
    }
    const cache = cachesMemoria[idioma];
    const regexGlossario = criarRegexGlossario();

    const pendentes = [];
    textosUnicosPt.forEach(function (textoPt) {
      if (cache[textoPt]) {
        return;
      }

      const prep = prepararTextoParaTraducao(textoPt, idioma, regexGlossario);
      if (prep.pronto) {
        cache[textoPt] = prep.resultado;
      } else {
        pendentes.push({
          textoPt: textoPt,
          textoMascarado: prep.textoMascarado,
          substituicoes: prep.substituicoes
        });
      }
    });

    if (pendentes.length === 0) {
      return cache;
    }

    // Divide em lotes de até 1800 caracteres para respostas rápidas e seguras
    const lotes = [];
    let loteAtual = [];
    let tamanhoAtual = 0;

    pendentes.forEach(function (item) {
      const tam = item.textoMascarado.length + 1;
      if (loteAtual.length > 0 && tamanhoAtual + tam > 1800) {
        lotes.push(loteAtual);
        loteAtual = [];
        tamanhoAtual = 0;
      }
      loteAtual.push(item);
      tamanhoAtual += tam;
    });

    if (loteAtual.length > 0) {
      lotes.push(loteAtual);
    }

    for (let i = 0; i < lotes.length; i += 1) {
      const lote = lotes[i];
      try {
        const mascarados = lote.map(function (item) {
          return item.textoMascarado;
        });
        const traduzidos = await solicitarTraducaoLote(mascarados, idioma);
        lote.forEach(function (item, idx) {
          const bruto = traduzidos[idx] || item.textoMascarado;
          cache[item.textoPt] = restaurarMarcadores(bruto, item.substituicoes);
        });
      } catch (erro) {
        console.error("Erro ao traduzir lote:", erro);
      }
    }

    salvarCache(idioma);
    return cache;
  }

  function elementoIgnorado(el) {
    let atual = el;
    while (atual && atual.nodeType === 1) {
      if (TAGS_IGNORADAS[atual.tagName]) {
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

  function extrairEspacosLaterais(texto) {
    const matchInicio = texto.match(/^\s*/);
    const matchFim = texto.match(/\s*$/);
    const inicio = matchInicio && matchInicio[0].length > 0 ? " " : "";
    const fim =
      matchFim && matchFim[0].length > 0 && texto.trim().length > 0 ? " " : "";
    return {
      inicio: inicio,
      nucleo: texto.replace(/\s+/g, " ").trim(),
      fim: fim
    };
  }

  function coletarAlvos(raiz) {
    const container = raiz || document.body;
    if (!container) {
      return { nosTexto: [], atributos: [] };
    }

    const nosTexto = [];
    const atributos = [];

    const walker = document.createTreeWalker(
      container,
      NodeFilter.SHOW_TEXT,
      null
    );

    let no = walker.nextNode();
    while (no) {
      const pai = no.parentElement;
      if (pai && !elementoIgnorado(pai)) {
        const valorAtual = no.nodeValue || "";
        if (
          typeof no._textoOriginalPt !== "string" ||
          (typeof no._ultimoTextoAplicado === "string" &&
            valorAtual !== no._ultimoTextoAplicado)
        ) {
          no._textoOriginalPt = valorAtual;
        }

        const partes = extrairEspacosLaterais(no._textoOriginalPt);
        if (
          partes.nucleo.length > 0 &&
          /\p{L}/u.test(partes.nucleo) &&
          !partes.nucleo.includes("@") &&
          !/^https?:\/\//i.test(partes.nucleo)
        ) {
          nosTexto.push({
            no: no,
            partes: partes
          });
        }
      }
      no = walker.nextNode();
    }

    const elementos = container.querySelectorAll
      ? Array.from(
          container.querySelectorAll("[placeholder], [title], [aria-label]")
        )
      : [];

    if (
      container.nodeType === 1 &&
      (container.hasAttribute("placeholder") ||
        container.hasAttribute("title") ||
        container.hasAttribute("aria-label"))
    ) {
      elementos.unshift(container);
    }

    elementos.forEach(function (el) {
      if (elementoIgnorado(el)) {
        return;
      }

      ATRIBUTOS_TRADUZIVEIS.forEach(function (attr) {
        if (!el.hasAttribute(attr)) {
          return;
        }
        const valorAtual = el.getAttribute(attr) || "";
        if (!el._atributosOriginaisPt) {
          el._atributosOriginaisPt = {};
        }
        if (!el._ultimosAtributosAplicados) {
          el._ultimosAtributosAplicados = {};
        }

        if (
          typeof el._atributosOriginaisPt[attr] !== "string" ||
          (typeof el._ultimosAtributosAplicados[attr] === "string" &&
            valorAtual !== el._ultimosAtributosAplicados[attr])
        ) {
          el._atributosOriginaisPt[attr] = valorAtual;
        }

        const original = (el._atributosOriginaisPt[attr] || "")
          .replace(/\s+/g, " ")
          .trim();

        if (
          original.length > 0 &&
          /\p{L}/u.test(original) &&
          !original.includes("@")
        ) {
          atributos.push({
            el: el,
            attr: attr,
            original: original
          });
        }
      });
    });

    return { nosTexto: nosTexto, atributos: atributos };
  }

  let aplicacaoEmAndamento = false;

  async function traduzirElemento(raiz, idiomaForcado) {
    const idioma =
      idiomaForcado ||
      (typeof window.obterIdiomaAtual === "function"
        ? window.obterIdiomaAtual()
        : localStorage.getItem("idioma-nei") || "pt");

    const alvos = coletarAlvos(raiz || document.body);

    if (idioma === "pt") {
      aplicacaoEmAndamento = true;
      alvos.nosTexto.forEach(function (item) {
        if (typeof item.no._textoOriginalPt === "string") {
          item.no._ultimoTextoAplicado = item.no._textoOriginalPt;
          item.no.nodeValue = item.no._textoOriginalPt;
        }
      });

      alvos.atributos.forEach(function (item) {
        const orig =
          item.el._atributosOriginaisPt &&
          item.el._atributosOriginaisPt[item.attr];
        if (typeof orig === "string") {
          item.el._ultimosAtributosAplicados[item.attr] = orig;
          item.el.setAttribute(item.attr, orig);
        }
      });
      aplicacaoEmAndamento = false;

      if (typeof window.reindexarBuscaProdutos === "function") {
        window.reindexarBuscaProdutos();
      }
      return;
    }

    const textosUnicosSet = new Set();
    alvos.nosTexto.forEach(function (item) {
      textosUnicosSet.add(item.partes.nucleo);
    });
    alvos.atributos.forEach(function (item) {
      textosUnicosSet.add(item.original);
    });

    const listaUnica = Array.from(textosUnicosSet);
    if (listaUnica.length === 0) {
      return;
    }

    const cache = await traduzirListaTextos(listaUnica, idioma);

    // Confere se o usuário não trocou o idioma enquanto aguardava a requisição
    const idiomaAtualAgora =
      typeof window.obterIdiomaAtual === "function"
        ? window.obterIdiomaAtual()
        : localStorage.getItem("idioma-nei") || "pt";

    if (idiomaAtualAgora !== idioma) {
      return;
    }

    aplicacaoEmAndamento = true;
    alvos.nosTexto.forEach(function (item) {
      const traduzido = cache[item.partes.nucleo];
      if (traduzido) {
        const final = item.partes.inicio + traduzido + item.partes.fim;
        item.no._ultimoTextoAplicado = final;
        item.no.nodeValue = final;
      }
    });

    alvos.atributos.forEach(function (item) {
      const traduzido = cache[item.original];
      if (traduzido) {
        item.el._ultimosAtributosAplicados[item.attr] = traduzido;
        item.el.setAttribute(item.attr, traduzido);
      }
    });
    aplicacaoEmAndamento = false;

    if (typeof window.reindexarBuscaProdutos === "function") {
      window.reindexarBuscaProdutos();
    }
  }

  let timerObservador = null;
  const nosPendentesObservador = new Set();

  function iniciarObservadorDOM() {
    if (!("MutationObserver" in window) || !document.body) {
      return;
    }

    const observador = new MutationObserver(function (mutacoes) {
      if (aplicacaoEmAndamento) {
        return;
      }

      const idioma =
        typeof window.obterIdiomaAtual === "function"
          ? window.obterIdiomaAtual()
          : localStorage.getItem("idioma-nei") || "pt";

      if (idioma === "pt") {
        return;
      }

      mutacoes.forEach(function (m) {
        if (m.type === "childList") {
          m.addedNodes.forEach(function (n) {
            if (n.nodeType === 1) {
              nosPendentesObservador.add(n);
            } else if (n.nodeType === 3 && n.parentElement) {
              nosPendentesObservador.add(n.parentElement);
            }
          });
        } else if (m.type === "characterData" && m.target.parentElement) {
          if (m.target.nodeValue !== m.target._ultimoTextoAplicado) {
            nosPendentesObservador.add(m.target.parentElement);
          }
        }
      });

      if (nosPendentesObservador.size > 0) {
        clearTimeout(timerObservador);
        timerObservador = setTimeout(function () {
          const alvos = Array.from(nosPendentesObservador);
          nosPendentesObservador.clear();
          alvos.forEach(function (el) {
            if (document.body.contains(el)) {
              traduzirElemento(el, idioma);
            }
          });
        }, 80);
      }
    });

    observador.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  window.aplicarTraducaoAutomatica = function (idioma) {
    return traduzirElemento(document.body, idioma);
  };
  window.traduzirElemento = traduzirElemento;

  iniciarObservadorDOM();

  const idiomaInicial =
    typeof window.obterIdiomaAtual === "function"
      ? window.obterIdiomaAtual()
      : localStorage.getItem("idioma-nei") || "pt";

  if (idiomaInicial !== "pt") {
    traduzirElemento(document.body, idiomaInicial);
  }
})();
