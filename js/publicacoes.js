// publicacoes.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Carrega White Papers, Estudos Cientificos e Estudos Tecnicos do Supabase,
// padroniza etiquetas e titulos, e gerencia a janela de detalhes de cada entrega.

function esc(valor) {
  return String(valor === null || valor === undefined ? "" : valor)
    .replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[c];
    });
}

// Mapa de padronização das etiquetas de tipo de produto (unifica acentuação, caixa e underscores).
const MAPA_TIPOS_PADRONIZADOS = {
  "nota tecnica": "Nota técnica",
  "nota técnica": "Nota técnica",
  "notas tecnicas": "Nota técnica",
  "notas técnicas": "Nota técnica",
  "estudo cientifico": "Estudo científico",
  "estudo_cientifico": "Estudo científico",
  "estudo científico": "Estudo científico",
  "estudos cientificos": "Estudo científico",
  "estudos científicos": "Estudo científico",
  "planos estrategicos": "Planos estratégicos",
  "planos estratégicos": "Planos estratégicos",
  "plano estrategico": "Planos estratégicos",
  "plano estratégico": "Planos estratégicos",
  "prospeccao tecnologica": "Prospecção tecnológica",
  "prospecção tecnológica": "Prospecção tecnológica",
  "estudos setoriais": "Estudos setoriais",
  "estudo setorial": "Estudos setoriais",
  "benchmarking": "Benchmarking",
  "white paper": "White Paper",
  "white_paper": "White Paper",
  "white papers": "White Paper",
  "painel": "Painel",
  "paineis": "Painel",
  "painéis": "Painel",
  "boletim": "Boletim técnico",
  "boletim tecnico": "Boletim técnico",
  "boletim técnico": "Boletim técnico",
  "macrotrend": "Macrotrend",
  "macrotrends": "Macrotrend"
};

function padronizarTipoProduto(tipoBruto) {
  if (!tipoBruto) return "Estudo";
  const chave = String(tipoBruto).trim().toLowerCase().replace(/\s+/g, " ");
  if (MAPA_TIPOS_PADRONIZADOS[chave]) {
    return MAPA_TIPOS_PADRONIZADOS[chave];
  }
  return String(tipoBruto).trim();
}

// Correções pontuais de títulos que ainda não foram ajustados no banco.
const CORRECOES_TITULO_PUBLICACAO = {
  "O potencial do Nordeste como produtos de hidrogênio verde":
    "O potencial do Nordeste como produtor de hidrogênio verde",
  "Cap 2: Perfil e dinâmica das desigualdades regionais do Brasil em territórios industriais relevantes":
    "Cap. 2 — Perfil e dinâmica das desigualdades regionais do Brasil em territórios industriais relevantes [Desenvolvimento Regional no Brasil, Vol. 2 — Ipea]",
  "Cap 3: Desconcentração Territorial e Reestruturação Regressiva da Indústria no Brasil: Padrões e Ritmos":
    "Cap. 3 — Desconcentração Territorial e Reestruturação Regressiva da Indústria no Brasil: Padrões e Ritmos [Brasil, Brasis — Ipea]",
  "Cap 4: Transformações recentes da indústria no Sudeste: evidências da dinâmica produtiva e territorial entre 1996 e 2015":
    "Cap. 4 — Transformações recentes da indústria no Sudeste: evidências da dinâmica produtiva e territorial entre 1996 e 2015 [Brasil, Brasis — Ipea]",
  "Cap 7: O território das atividades industriais no Brasil: a força das economias de aglomeração e urbanização":
    "Cap. 7 — O território das atividades industriais no Brasil: a força das economias de aglomeração e urbanização [Brasil, Brasis — Ipea]",
  "Cap 8: Aglomerações industriais relevantes e potenciais: novas dinâmicas territoriais brasileiras":
    "Cap. 8 — Aglomerações industriais relevantes e potenciais: novas dinâmicas territoriais brasileiras [Brasil, Brasis — Ipea]"
};

const CORRECOES_TITULO_POR_ID = {
  29: "Cap. 2 — Perfil e dinâmica das desigualdades regionais do Brasil em territórios industriais relevantes [Desenvolvimento Regional no Brasil, Vol. 2 — Ipea]",
  33: "Cap. 3 — Desconcentração Territorial e Reestruturação Regressiva da Indústria no Brasil: Padrões e Ritmos [Brasil, Brasis — Ipea]",
  47: "Cap. 4 — Transformações recentes da indústria no Sudeste: evidências da dinâmica produtiva e territorial entre 1996 e 2015 [Brasil, Brasis — Ipea]",
  36: "Cap. 7 — O território das atividades industriais no Brasil: a força das economias de aglomeração e urbanização [Brasil, Brasis — Ipea]",
  40: "Cap. 8 — Aglomerações industriais relevantes e potenciais: novas dinâmicas territoriais brasileiras [Brasil, Brasis — Ipea]",
  41: "O potencial do Nordeste como produtor de hidrogênio verde"
};

function padronizarTituloPublicacao(tituloBruto, id) {
  if (id && CORRECOES_TITULO_POR_ID[id]) {
    return CORRECOES_TITULO_POR_ID[id];
  }
  const titulo = String(tituloBruto || "").trim();
  if (CORRECOES_TITULO_PUBLICACAO[titulo]) {
    return CORRECOES_TITULO_PUBLICACAO[titulo];
  }
  return titulo;
}

// Resumos aprimorados (2 a 3 linhas focadas na entrega, metodologia e valor estratégico),
// baseados na leitura integral dos documentos e aplicados automaticamente caso o banco ainda retorne a versão curta.
const RESUMOS_MELHORADOS_PUBLICACOES = {
  12: "Mapeamento patentométrico e análise de redes de cooperação de 195 famílias de patentes globais em comunicação quântica (1998–2025), evidenciando a aceleração tecnológica pós-2019 liderada por China, EUA e Europa em distribuição quântica de chaves (QKD) e sistemas fotônicos.",
  17: "Proposta de arcabouço técnico-econômico em português para gestão do ciclo de vida e reúso (segunda vida) de módulos fotovoltaicos residenciais no Brasil, integrando curvas de degradação física, perfis de consumo elétrico por faixa de renda e viabilidade econômica para evitar o descarte precoce.",
  18: "Diagnóstico estratégico da economia náutica na Baía de Todos os Santos e na Bahia, avaliando infraestrutura de marinas e estaleiros, cadeia de serviços especializados, comércio exterior de embarcações e diretrizes para atração de investimentos e fortalecimento do cluster marítimo.",
  27: "Decomposição shift-share da produtividade do trabalho na indústria de transformação do Sul e Sudeste brasileiro (1996–2016) segundo a taxonomia da OCDE, mensurando o peso da eficiência intrassetorial, da mudança estrutural estática e da especialização dinâmica entre os estados.",
  28: "Análise comparativa entre a Economia Ambiental Neoclássica e a Economia Ecológica sobre os limites biofísicos do crescimento econômico, discutindo a Curva Ambiental de Kuznets, restrições termodinâmicas e o papel das inovações tecnológicas na transição para a sustentabilidade."
};

const RESUMOS_MELHORADOS_TECNICOS = {
  1: "Estudo estratégico sobre os mercados, tecnologias e cadeias produtivas da Economia do Mar, mapeando oportunidades em construção e reparo naval, energias renováveis offshore, logística portuária, biotecnologia marinha e desenvolvimento costeiro na Bahia e no Brasil.",
  2: "Benchmarking estratégico do ecossistema do Porto Digital (Recife/PE), analisando modelo de governança, políticas de atração de capital humano, incentivos fiscais e mecanismos de inovação aberta para orientar o posicionamento competitivo do SENAI CIMATEC Digital.",
  4: "Análise comparativa de modelos estaduais e municipais de licenciamento ambiental simplificado e por adesão e compromisso (LAC), identificando boas práticas regulatórias, digitalização de fluxos e ganhos de agilidade com segurança jurídica para investimentos industriais.",
  5: "Benchmarking nacional e internacional de polos aeroespaciais consolidados e emergentes, examinando infraestrutura tecnológica, políticas de compras governamentais, formação de mão de obra especializada e fatores críticos de competitividade para adensamento da cadeia na Bahia.",
  6: "Estudo de caso aprofundado do polo aeroespacial de Gavião Peixoto (SP), avaliando a infraestrutura de ensaios em voo, a articulação entre empresa âncora, fornecedores e centros de P&D, e as lições estratégicas para implantação de parques aeroespaciais na Bahia.",
  7: "Avaliação estratégica das tendências globais e nacionais de infraestrutura de Data Centers, analisando requisitos de disponibilidade energética renovável, conectividade por cabos submarinos, incentivos tributários e o potencial competitivo da Bahia para atração de investimentos hyperscale.",
  8: "Diagnóstico técnico e mercadológico da indústria óptica e de fabricação de armações e óculos no Brasil, destacando o potencial da manufatura aditiva (impressão 3D) para customização em escala, redução de custos de ferramental e ganho de competitividade de pequenos e médios produtores.",
  9: "Diagnóstico econômico-setorial da fabricação de artigos de metal para uso doméstico e pessoal, analisando estrutura produtiva nacional e regional, geração de emprego e renda, comércio exterior, linhas de financiamento e oportunidades de modernização industrial.",
  11: "Estudo prospectivo sobre arquiteturas de Data Lakes e Data Spaces industriais, avaliando padrões internacionais de governança, soberania e compartilhamento seguro de dados em ecossistemas produtivos para impulsionar serviços digitais de alto valor agregado.",
  21: "Painel estratégico de inteligência industrial que cruza a capacidade produtiva instalada na Bahia com o perfil de compras governamentais, identificando setores prioritários para adensamento de cadeias locais e uso estratégico do poder de compra do Estado.",
  23: "Painel executivo de prospecção territorial que mapeia, em um raio de 500 km a partir de Camaçari (BA), estabelecimentos industriais ativos com potencial de fornecimento, beneficiamento ou consumo de alumina para apoiar estratégias de economia circular e simbiose industrial."
};

function obterResumoPadronizadoPublicacao(item) {
  if (item && RESUMOS_MELHORADOS_PUBLICACOES[item.id]) {
    return RESUMOS_MELHORADOS_PUBLICACOES[item.id];
  }
  return String((item && item.resumo) || "").trim();
}

function obterResumoPadronizadoTecnico(estudo) {
  if (estudo && RESUMOS_MELHORADOS_TECNICOS[estudo.id]) {
    return RESUMOS_MELHORADOS_TECNICOS[estudo.id];
  }
  return String((estudo && estudo.resumo) || "").trim();
}

const NOMES_PESQUISADORES_PASTA = {
  andre: "André Oliveira",
  mabel: "Mabel Mota",
  raphael: "Raphael Oliveira",
  yuri: "Yuri Dantas",
  felipe: "Felipe Figueiroa",
  joao: "João",
  milton: "Milton"
};

function extrairAutorPasta(url) {
  if (!url) return "";
  const match = String(url).match(/\/estudos_cientificos\/([^/]+)\//i);
  if (match && match[1]) {
    const pasta = match[1].toLowerCase();
    if (pasta !== "white_papers" && NOMES_PESQUISADORES_PASTA[pasta]) {
      return NOMES_PESQUISADORES_PASTA[pasta];
    }
  }
  return "";
}

const CONTEXTO_LIVROS_CAPITULOS = {
  29: {
    capitulo: "Capítulo 2",
    obra: "Desenvolvimento Regional no Brasil: políticas, estratégias e perspectivas (Vol. 2, Ipea, 2020)"
  },
  33: {
    capitulo: "Capítulo 3",
    obra: "Brasil, Brasis: reconfigurações territoriais da indústria no século XXI (Ipea, 2021)"
  },
  47: {
    capitulo: "Capítulo 4",
    obra: "Brasil, Brasis: reconfigurações territoriais da indústria no século XXI (Ipea, 2021)"
  },
  36: {
    capitulo: "Capítulo 7",
    obra: "Brasil, Brasis: reconfigurações territoriais da indústria no século XXI (Ipea, 2021)"
  },
  40: {
    capitulo: "Capítulo 8",
    obra: "Brasil, Brasis: reconfigurações territoriais da indústria no século XXI (Ipea, 2021)"
  }
};

function extrairContextoCapitulo(titulo, id) {
  if (id && CONTEXTO_LIVROS_CAPITULOS[id]) {
    return CONTEXTO_LIVROS_CAPITULOS[id];
  }
  const match = String(titulo || "").match(/^Cap(?:ítulo|\.?)\s*(\d+)\s*(?:[:—-])/i);
  if (match) {
    const num = match[1];
    if (num === "2") {
      return CONTEXTO_LIVROS_CAPITULOS[29];
    }
    return {
      capitulo: "Capítulo " + num,
      obra: "Brasil, Brasis: reconfigurações territoriais da indústria no século XXI (Ipea, 2021)"
    };
  }
  return null;
}

// Armazena os itens carregados para abrir o modal de detalhes rapidamente.
const REGISTRO_ENTREGAS_NEI = {};

function obterFichaContextualEstudoTecnico(tipoPadronizado, ehSiteExterno, idEstudo) {
  const tipo = String(tipoPadronizado || "").toLowerCase();
  if (tipo === "painel" || ehSiteExterno) {
    const fonteBase =
      idEstudo === 23
        ? "Base da Receita Federal (CNPJ — partição consolidada em 2026-01-11), IBGE e Comex Stat, tratadas pelo NEI | SENAI CIMATEC."
        : "Bases oficiais (IBGE, RAIS/CAGED, Comex Stat, CNPJ/Receita Federal e SEI-BA), consolidadas pelo NEI | SENAI CIMATEC.";
    return [
      {
        pergunta: "O que entrega",
        resposta: "Plataforma interativa com indicadores georreferenciados, filtros setoriais e séries históricas para exploração visual."
      },
      {
        pergunta: "Para quem foi pensado",
        resposta: "Gestores públicos, lideranças industriais e equipes de planejamento estratégico e prospecção territorial."
      },
      {
        pergunta: "Fontes e atualização",
        resposta: fonteBase
      }
    ];
  }
  if (tipo === "boletim técnico") {
    return [
      {
        pergunta: "O que entrega",
        resposta: "Síntese executiva de avanços técnico-científicos, avaliação de maturidade tecnológica (TRL) e oportunidades de aplicação industrial."
      },
      {
        pergunta: "Para quem foi pensado",
        resposta: "Pesquisadores, engenheiros de P&D, gestores de inovação e parceiros tecnológicos do ecossistema SENAI CIMATEC."
      },
      {
        pergunta: "Fontes e atualização",
        resposta: "Publicações científicas indexadas, bases patentárias internacionais e resultados experimentais dos centros tecnológicos do SENAI CIMATEC."
      }
    ];
  }
  if (tipo === "macrotrend") {
    return [
      {
        pergunta: "O que entrega",
        resposta: "Mapeamento de tendências globais, casos de uso em empresas líderes, investimentos e impactos estratégicos no médio e longo prazo."
      },
      {
        pergunta: "Para quem foi pensado",
        resposta: "Diretorias de inovação, novos negócios e formuladores de estratégias tecnológicas setoriais."
      },
      {
        pergunta: "Fontes e atualização",
        resposta: "Relatórios corporativos globais, bases de investimentos, agências reguladoras (ANP, ANEEL, ANATEL) e inteligência competitiva do NEI."
      }
    ];
  }
  return [
    {
      pergunta: "O que entrega",
      resposta: "Análise comparativa nacional e internacional, estrutura de mercado, comércio exterior, ambiente regulatório e oportunidades competitivas."
    },
    {
      pergunta: "Para quem foi pensado",
      resposta: "Tomadores de decisão do Sistema FIEB, SENAI CIMATEC, empresas industriais e formuladores de políticas públicas."
    },
    {
      pergunta: "Fontes e atualização",
      resposta: "Dados secundários oficiais auditáveis, relatórios setoriais internacionais e levantamentos primários conduzidos pelo NEI."
    }
  ];
}

function gerarCitacaoSugerida(registro) {
  const ano = "2026";
  const autor = registro.autor
    ? registro.autor.toUpperCase() + " et al."
    : "NÚCLEO DE ECONOMIA INDUSTRIAL (NEI)";
  return `${autor}. ${registro.titulo}. Salvador: SENAI CIMATEC — Núcleo de Economia Industrial (NEI), ${ano}. Disponível em: ${window.location.origin}${window.location.pathname}.`;
}

function abrirModalDetalheEntrega(chaveRegistro) {
  const registro = REGISTRO_ENTREGAS_NEI[chaveRegistro];
  const modal = document.getElementById("modal-detalhe-estudo");
  if (!registro || !modal) return;

  const imgCapa = document.getElementById("modal-estudo-capa");
  const badgesContainer = document.getElementById("modal-estudo-badges");
  const acoesContainer = document.getElementById("modal-estudo-acoes");
  const categoriaEl = document.getElementById("modal-estudo-categoria");
  const tituloEl = document.getElementById("modal-estudo-titulo");
  const metaEl = document.getElementById("modal-estudo-meta");
  const resumoEl = document.getElementById("modal-estudo-resumo");
  const fichaEl = document.getElementById("modal-estudo-ficha");
  const citacaoWrap = document.getElementById("modal-estudo-citacao-wrap");
  const citacaoTexto = document.getElementById("modal-estudo-citacao-texto");
  const btnCopiarCitacao = document.getElementById("btn-copiar-citacao");

  if (imgCapa) {
    imgCapa.src = registro.capa || "";
    imgCapa.alt = registro.titulo || "";
  }

  if (categoriaEl) {
    categoriaEl.textContent =
      registro.grupo === "tecnico"
        ? "Estudo Técnico · NEI"
        : registro.grupo === "white_paper"
          ? "White Paper · NEI"
          : "Produção Científica & Técnica";
  }

  if (tituloEl) {
    tituloEl.textContent = registro.titulo;
  }

  if (badgesContainer) {
    badgesContainer.innerHTML = `<span class="produto modal-badge-produto">Produto: ${esc(registro.tipoPadronizado)}</span>`;
  }

  if (metaEl) {
    const itensMeta = [];
    if (registro.autor) {
      itensMeta.push(`<span><strong>Pesquisador(a) NEI:</strong> <span translate="no">${esc(registro.autor)}</span></span>`);
    } else {
      itensMeta.push(`<span><strong>Elaboração:</strong> Núcleo de Economia Industrial (NEI | SENAI CIMATEC)</span>`);
    }
    if (registro.contextoCapitulo) {
      itensMeta.push(`<span><strong>Formato:</strong> ${esc(registro.contextoCapitulo.capitulo)} (${esc(registro.contextoCapitulo.obra)})</span>`);
    }
    metaEl.innerHTML = itensMeta.join("");
  }

  if (resumoEl) {
    resumoEl.innerHTML = `<p>${esc(registro.resumo)}</p>`;
  }

  if (fichaEl) {
    if (registro.grupo === "tecnico") {
      const ficha = obterFichaContextualEstudoTecnico(registro.tipoPadronizado, registro.ehSiteExterno, registro.id);
      fichaEl.innerHTML = ficha
        .map(function (item) {
          return `
            <div class="modal-estudo-ficha-item">
              <strong>${esc(item.pergunta)}</strong>
              <p>${esc(item.resposta)}</p>
            </div>
          `;
        })
        .join("");
      fichaEl.hidden = false;
    } else {
      fichaEl.innerHTML = `
        <div class="modal-estudo-ficha-item">
          <strong>Tipo de publicação</strong>
          <p>${esc(registro.tipoPadronizado)} disponibilizado em acesso aberto pelo repositório do NEI | SENAI CIMATEC.</p>
        </div>
      `;
      fichaEl.hidden = false;
    }
  }

  if (citacaoWrap && citacaoTexto) {
    const textoCitacao = gerarCitacaoSugerida(registro);
    citacaoTexto.textContent = textoCitacao;
    citacaoWrap.hidden = false;
    if (btnCopiarCitacao) {
      btnCopiarCitacao.textContent = "Copiar citação";
      btnCopiarCitacao.onclick = function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textoCitacao).then(function () {
            btnCopiarCitacao.textContent = "Copiado!";
            setTimeout(function () {
              btnCopiarCitacao.textContent = "Copiar citação";
            }, 2000);
          });
        }
      };
    }
  }

  if (acoesContainer) {
    acoesContainer.innerHTML = "";
    if (registro.restrito) {
      const btnAcao = document.createElement("button");
      btnAcao.type = "button";
      const temAcesso = typeof usuarioTemAcesso !== "undefined" && Boolean(usuarioTemAcesso);
      const textos = typeof window.obterTextosInterface === "function"
        ? window.obterTextosInterface()
        : { acessarEstudo: "Acessar estudo", entreEmContato: "Solicitar acesso" };

      btnAcao.className = temAcesso ? "link" : "link link-bloqueado";
      btnAcao.style.width = "100%";
      btnAcao.style.justifyContent = "center";
      btnAcao.textContent = temAcesso ? textos.acessarEstudo : textos.entreEmContato;

      btnAcao.addEventListener("click", function () {
        fecharModalDetalheEntrega();
        if (registro.botaoCard) {
          registro.botaoCard.click();
        } else if (typeof window.abrirContatoEstudo === "function") {
          window.abrirContatoEstudo();
        }
      });
      acoesContainer.appendChild(btnAcao);
    } else {
      const linkDoc = document.createElement("a");
      linkDoc.className = "link link-publico";
      linkDoc.style.width = "100%";
      linkDoc.style.justifyContent = "center";
      linkDoc.style.textAlign = "center";
      linkDoc.href = registro.documento_url || "#";
      linkDoc.target = "_blank";
      linkDoc.rel = "noopener noreferrer";
      linkDoc.textContent = "Ler documento completo (PDF)";
      acoesContainer.appendChild(linkDoc);
    }
  }

  if (typeof window.traduzirElemento === "function") {
    window.traduzirElemento(modal);
  }

  modal.classList.add("aberto");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("travado");
}

function fecharModalDetalheEntrega() {
  const modal = document.getElementById("modal-detalhe-estudo");
  if (!modal) return;
  modal.classList.remove("aberto");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("travado");
}

(function configurarEventosModalDetalhe() {
  const modal = document.getElementById("modal-detalhe-estudo");
  const btnFechar = document.getElementById("btn-fechar-detalhe-estudo");

  if (btnFechar) {
    btnFechar.addEventListener("click", fecharModalDetalheEntrega);
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        fecharModalDetalheEntrega();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("aberto")) {
      fecharModalDetalheEntrega();
    }
  });
})();

function vincularCliqueCardDetalhe(card, chaveRegistro) {
  card.addEventListener("click", function (evento) {
    if (evento.target.closest("a.link, button.link")) {
      return;
    }
    abrirModalDetalheEntrega(chaveRegistro);
  });

  card.addEventListener("keydown", function (evento) {
    if (evento.target !== card) return;
    if (evento.key === "Enter" || evento.key === " ") {
      evento.preventDefault();
      abrirModalDetalheEntrega(chaveRegistro);
    }
  });
}

// Uma única consulta atende White Papers e Estudos Científicos.
async function carregarPublicacoes() {
  const alvos = {
    white_paper: document.getElementById("white-papers-dinamicos"),
    estudo_cientifico: document.getElementById("cientificos-dinamicos")
  };

  if (!alvos.white_paper && !alvos.estudo_cientifico) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("publicacoes_publicas")
    .select("id, titulo, resumo, tipo, capa_url, documento_url, categoria, ordem")
    .in("categoria", ["white_paper", "estudo_cientifico"])
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao carregar publicações:", error);
    return;
  }

  Object.keys(alvos).forEach(function (chave) {
    if (alvos[chave]) {
      alvos[chave].innerHTML = "";
    }
  });

  if (!data || data.length === 0) {
    return;
  }

  // Deduplicação automática: se dois registros tiverem o mesmo título ou mesmo documento_url na mesma categoria,
  // mantém o que possui resumo mais completo (ex.: ID 26 sobre ID 15).
  const mapaUnicos = new Map();
  data.forEach(function (item) {
    const tituloNormalizado = padronizarTituloPublicacao(item.titulo, item.id).toLowerCase();
    const chaveUnica = `${item.categoria}::${tituloNormalizado}`;
    const existente = mapaUnicos.get(chaveUnica);
    if (!existente || String(item.resumo || "").length > String(existente.resumo || "").length) {
      mapaUnicos.set(chaveUnica, item);
    }
  });

  Array.from(mapaUnicos.values()).forEach(function (item) {
    const container = alvos[item.categoria];
    if (!container) {
      return;
    }

    const tituloPadronizado = padronizarTituloPublicacao(item.titulo, item.id);
    const tipoPadronizado = padronizarTipoProduto(item.tipo);
    const resumoPadronizado = obterResumoPadronizadoPublicacao(item);
    const autor = extrairAutorPasta(item.documento_url);
    const contextoCapitulo = extrairContextoCapitulo(tituloPadronizado, item.id);
    const chaveRegistro = `pub_${item.id}`;

    const card = document.createElement("article");
    card.className = "card card-interativo";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalhes de ${tituloPadronizado}`);
    card.dataset.tipoProduto = tipoPadronizado;

    card.innerHTML = `
      <div class="capa doc">
        <img src="${esc(item.capa_url)}"
             alt="${esc(tituloPadronizado)}"
             loading="lazy">
      </div>

      <div class="corpo">
        <div class="card-etiquetas">
          <span class="produto">Produto: ${esc(tipoPadronizado)}</span>
        </div>
        <h3>${esc(tituloPadronizado)}</h3>
        <p class="card-resumo">${esc(resumoPadronizado)}</p>
        <div class="card-rodape-acoes">
          <a class="link link-publico"
             href="${esc(item.documento_url)}"
             target="_blank"
             rel="noopener">Acessar estudo</a>
        </div>
      </div>
    `;

    REGISTRO_ENTREGAS_NEI[chaveRegistro] = {
      id: item.id,
      grupo: item.categoria,
      titulo: tituloPadronizado,
      resumo: resumoPadronizado,
      tipoPadronizado: tipoPadronizado,
      capa: item.capa_url,
      documento_url: item.documento_url,
      autor: autor,
      contextoCapitulo: contextoCapitulo,
      restrito: false
    };

    vincularCliqueCardDetalhe(card, chaveRegistro);
    container.appendChild(card);
  });
}

async function carregarEstudosTecnicos() {
  const container = document.getElementById("tecnicos-dinamicos");

  if (!container) {
    return;
  }

  const { data, error } = await supabaseClient
    .from("estudos_tecnicos")
    .select("id, titulo, resumo, tipo, caminho_arquivo, caminho_capa, ordem")
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (error) {
    console.error("Erro ao carregar Estudos Técnicos:", error);
    return;
  }

  container.innerHTML = "";

  if (!data || data.length === 0) {
    return;
  }

  data.forEach(function (estudo) {
    const arquivo = estudo.caminho_arquivo?.toLowerCase();
    const ehSiteExterno = Boolean(arquivo && !arquivo.endsWith(".pdf"));
    const tituloPadronizado = padronizarTituloPublicacao(estudo.titulo);
    const tipoPadronizado = padronizarTipoProduto(estudo.tipo);
    const resumoPadronizado = obterResumoPadronizadoTecnico(estudo);
    const chaveRegistro = `tec_${estudo.id}`;

    const card = document.createElement("article");
    card.className = "card card-interativo";
    card.tabIndex = 0;
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", `Ver detalhes de ${tituloPadronizado}`);
    card.dataset.tipoProduto = tipoPadronizado;

    card.innerHTML = `
      <div class="capa doc">
        <img src="${esc(estudo.caminho_capa)}"
             alt="${esc(tituloPadronizado)}"
             loading="lazy">
      </div>

      <div class="corpo">
        <div class="card-etiquetas">
          <span class="produto">Produto: ${esc(tipoPadronizado)}</span>
        </div>
        <h3>${esc(tituloPadronizado)}</h3>
        <p class="card-resumo">${esc(resumoPadronizado)}</p>
        <div class="card-rodape-acoes">
          <a class="link link-protegido link-bloqueado ${ehSiteExterno ? "link-site-externo" : "link-pdf-protegido"}"
             href="#"
             ${ehSiteExterno ? `data-site="${esc(estudo.caminho_arquivo)}"` : `data-arquivo="${esc(estudo.caminho_arquivo)}"`}>
             Solicitar acesso
          </a>
        </div>
      </div>
    `;

    const botaoCard = card.querySelector("a.link-protegido");

    REGISTRO_ENTREGAS_NEI[chaveRegistro] = {
      id: estudo.id,
      grupo: "tecnico",
      titulo: tituloPadronizado,
      resumo: resumoPadronizado,
      tipoPadronizado: tipoPadronizado,
      capa: estudo.caminho_capa,
      caminho_arquivo: estudo.caminho_arquivo,
      ehSiteExterno: ehSiteExterno,
      restrito: true,
      botaoCard: botaoCard
    };

    vincularCliqueCardDetalhe(card, chaveRegistro);
    container.appendChild(card);
  });
}

// Ordem importa: os cards precisam existir antes de vincular, autenticar e indexar.
(async function inicializarPublicacoes() {
  await Promise.all([
    carregarPublicacoes(),
    carregarEstudosTecnicos()
  ]);

  if (typeof window.traduzirElemento === "function") {
    window.traduzirElemento(document.getElementById("produtos"));
  }

  if (typeof window.vincularLinksProdutos === "function") {
    window.vincularLinksProdutos();
  }

  if (typeof window.reaplicarEstadoAutenticacao === "function") {
    await window.reaplicarEstadoAutenticacao();
  }

  if (typeof window.reindexarBuscaProdutos === "function") {
    window.reindexarBuscaProdutos();
  }

  if (typeof window.atualizarNavProdutos === "function") {
    window.atualizarNavProdutos();
  }
})();
