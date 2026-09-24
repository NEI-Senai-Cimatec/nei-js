// equipe.js
// Modal de apresentação e biografia dos membros da equipe do NEI

(function () {
  const DADOS_EQUIPE = {
    andre: {
      nome: "André Oliveira",
      cargo: "Superintendente Executivo de Planejamento e Novos Negócios do SENAI CIMATEC",
      papel: "Liderança Institucional",
      foto: "https://nei-senai-cimatec.github.io/nei-js/img/team/andre.jpeg",
      bio: [
        "André Oliveira é superintendente executivo de Planejamento e Novos Negócios do SENAI CIMATEC, atuando nas áreas de energia, inovação, sustentabilidade, gestão de negócios e educação. Doutor em Modelagem Computacional para Tecnologia Industrial pelo SENAI CIMATEC, mestre em Energia pela Universidade Federal do Ceará (UFC), possui MBA Executivo pela Fundação Dom Cabral e é graduado em Engenharia Mecânica pela Universidade Federal da Bahia (UFBA).",
        "Desde 2016, lidera o desenvolvimento de parcerias estratégicas, o planejamento e a implantação de novos campi, além da criação do Instituto de Economia Industrial do SENAI CIMATEC. Também supervisiona projetos de Pesquisa, Desenvolvimento e Inovação (P&D&I) e de Educação Profissional, contribuindo para a expansão e o fortalecimento do ecossistema de inovação da instituição."
      ],
      lattes: null
    },
    mabel: {
      nome: "Mabel Mota",
      cargo: "Coordenadora do Núcleo de Economia Industrial",
      papel: "Coordenação",
      foto: "https://nei-senai-cimatec.github.io/nei-js/img/team/mabel.jpg",
      bio: [
        "Doutora e graduada em Economia pela Universidade Federal da Bahia (UFBA, 2014; 2022) e Mestra em Economia Aplicada pela Universidade Federal de São Carlos (UFSCar, 2017).",
        "Atua nas áreas de Economia Industrial, Inovação e Políticas Públicas, com experiência em órgãos do Governo da Bahia, incluindo a Superintendência de Estudos Econômicos e Sociais da Bahia (SEI), a Secretaria de Desenvolvimento Urbano (SEDUR) e a Secretaria do Trabalho, Emprego, Renda e Esporte (SETRE). Atualmente, é Coordenadora do Núcleo de Economia Industrial do SENAI CIMATEC e Bolsista Doutor do Instituto de Pesquisa Econômica Aplicada (IPEA)."
      ],
      lattes: "http://lattes.cnpq.br/9328556139281194"
    },
    yuri: {
      nome: "Yuri Dantas",
      cargo: "Economista e Analista de Dados",
      papel: "Analista de Dados",
      foto: "https://nei-senai-cimatec.github.io/nei-js/img/team/yuri.jpeg",
      bio: [
        "Mestre e graduado em Ciências Econômicas pela Universidade Federal da Bahia (2022; 2018). Atua na área de Economia, com ênfase em Economia Industrial e Política Industrial, Políticas Públicas, Desenvolvimento Econômico e Economia Regional e Transição Energética.",
        "Possui experiência na construção, tratamento e análise de bases de dados e indicadores econômicos e sociais aplicados à estrutura produtiva e ao planejamento regional, com uso de Python. Atuou no acompanhamento de projetos sociais como Analista de Projetos do Estado da Bahia, no Fundo Estadual de Combate e Erradicação da Pobreza (FUNCEP), com foco em execução física-orçamentária e indicadores de pobreza e geração de renda. Também atuou em projetos de política industrial e desenvolvimento produtivo no Estado da Bahia financiados pelo Programa das Nações Unidas para o Desenvolvimento (PNUD). Atualmente é Economista do Núcleo de Economia Industrial do SENAI CIMATEC."
      ],
      lattes: "http://lattes.cnpq.br/0210327430133340"
    },
    raphael: {
      nome: "Raphael Oliveira",
      cargo: "Pesquisador em Economia Aplicada",
      papel: "Pesquisador Bolsista",
      foto: "https://nei-senai-cimatec.github.io/nei-js/img/team/raphael.jpg",
      bio: [
        "Profissional da área de Economia, com ênfase em Política Pública, Desenvolvimento Regional e Economia Industrial. Doutorando em Economia pela Universidade Federal da Bahia, Mestre em Economia Aplicada pela Universidade Federal de São Carlos (2017) e graduado em Ciências Econômicas pela Universidade Federal Fluminense (2014).",
        "Experiência como pesquisador no Programa de Pesquisa para o Desenvolvimento Nacional (PNPD) da Diretoria de Estudos e Políticas Regionais, Urbanas e Ambientais (Dirur) do Instituto de Pesquisa Econômica Aplicada (Ipea). Atual Especialista do Observatório da Federação das Indústrias do Estado do Espírito Santo (FINDES), Consultor do Ministério da Integração e Desenvolvimento Regional (MIDR) e Professor Orientador de Cursos de Pós-Graduação MBA da Escola Superior de Agricultura Luiz de Queiroz da Universidade de São Paulo (USP-Esalq)."
      ],
      lattes: "http://lattes.cnpq.br/1607374084886589"
    },
    felipe: {
      nome: "Felipe Figueiroa",
      cargo: "Engenheiro de Automação e Cientista de Dados",
      papel: "Pesquisador Bolsista",
      foto: "https://nei-senai-cimatec.github.io/nei-js/img/team/felipe.jpeg",
      bio: [
        "Graduado em Engenharia de Controle e Automação e pós-graduado em Data Science & Analytics pelo SENAI CIMATEC.",
        "Atua no Núcleo de Economia Industrial com foco em integração e engenharia de dados, desenvolvimento de soluções em Internet das Coisas (IoT) e implementação de dashboards analíticos voltados ao suporte à tomada de decisão estratégica e transformação digital de processos produtivos."
      ],
      lattes: "http://lattes.cnpq.br/0381558295826420"
    }
  };

  const modal = document.getElementById("modal-equipe");
  const modalFoto = document.getElementById("modal-equipe-foto");
  const modalPapel = document.getElementById("modal-equipe-papel");
  const modalNome = document.getElementById("modal-equipe-nome");
  const modalCargo = document.getElementById("modal-equipe-cargo");
  const modalBio = document.getElementById("modal-equipe-bio");
  const modalLinks = document.getElementById("modal-equipe-links");
  const btnFechar = document.getElementById("btn-fechar-equipe");

  function abrirModal(id) {
    const dados = DADOS_EQUIPE[id];
    if (!dados || !modal) return;

    modalFoto.src = dados.foto;
    modalFoto.alt = dados.nome;
    modalPapel.textContent = dados.papel;
    modalNome.textContent = dados.nome;
    modalCargo.textContent = dados.cargo;

    modalBio.innerHTML = "";
    dados.bio.forEach(function (paragrafo) {
      const p = document.createElement("p");
      p.textContent = paragrafo;
      modalBio.appendChild(p);
    });

    modalLinks.innerHTML = "";
    if (dados.lattes) {
      const lattesLink = document.createElement("a");
      lattesLink.className = "modal-equipe-lattes";
      lattesLink.href = dados.lattes;
      lattesLink.target = "_blank";
      lattesLink.rel = "noopener noreferrer";
      lattesLink.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
          <polyline points="15 3 21 3 21 9"></polyline>
          <line x1="10" y1="14" x2="21" y2="3"></line>
        </svg>
        Currículo Lattes
      `;
      modalLinks.appendChild(lattesLink);
    }

    modal.classList.add("aberto");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("travado");
  }

  function fecharModal() {
    if (!modal) return;
    modal.classList.remove("aberto");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("travado");
  }

  document.querySelectorAll("[data-membro]").forEach(function (card) {
    const id = card.getAttribute("data-membro");
    card.addEventListener("click", function () {
      abrirModal(id);
    });

    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        abrirModal(id);
      }
    });
  });

  if (btnFechar) {
    btnFechar.addEventListener("click", fecharModal);
  }

  if (modal) {
    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        fecharModal();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal && modal.classList.contains("aberto")) {
      fecharModal();
    }
  });
})();
