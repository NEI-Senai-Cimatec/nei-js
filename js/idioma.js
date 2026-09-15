// idioma.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Alternancia de idioma, textos da interface e persistencia da escolha.
// Extraido de index.html (bloco original: linhas 521-708).

(function () {
  window.textosInterface = {
    pt: {
      entrar: "Entrar",
      sair: "Sair",
      saindo: "Saindo...",
      acessarEstudo: "Acessar estudo",
      loginNecessario: "Login necessário",
      abrindo: "Abrindo...",
      acessoIndisponivel: "Acesso indisponível",
      criarConta: "Criar conta",
      criandoConta: "Criando conta...",
      solicitarEstudo: "Solicitar estudo",
      entreEmContato: "Entre em contato"
    },

    en: {
      entrar: "Sign in",
      sair: "Sign out",
      saindo: "Signing out...",
      acessarEstudo: "Access study",
      loginNecessario: "Sign-in required",
      abrindo: "Opening...",
      acessoIndisponivel: "Access unavailable",
      criarConta: "Create account",
      criandoConta: "Creating account...",
      solicitarEstudo: "Request a study",
      entreEmContato: "Contact us"
    },

    es: {
      entrar: "Iniciar sesión",
      sair: "Cerrar sesión",
      saindo: "Cerrando sesión...",
      acessarEstudo: "Acceder al estudio",
      loginNecessario: "Inicio de sesión requerido",
      abrindo: "Abriendo...",
      acessoIndisponivel: "Acceso no disponible",
      criarConta: "Crear cuenta",
      criandoConta: "Creando cuenta...",
      solicitarEstudo: "Solicitar un estudio",
      entreEmContato: "Contáctenos"
    }
  };

  const botoesIdioma =
    document.querySelectorAll(".idioma-opcao");

  const idiomasPermitidos = [
    "pt",
    "en",
    "es"
  ];

  function normalizarIdioma(idioma) {
    if (!idiomasPermitidos.includes(idioma)) {
      return "pt";
    }

    return idioma;
  }

  function obterIdiomaAtual() {
    return normalizarIdioma(
      localStorage.getItem("idioma-nei")
    );
  }

  window.obterIdiomaAtual = obterIdiomaAtual;

  window.obterTextosInterface = function () {
    const idioma = obterIdiomaAtual();

    return window.textosInterface[idioma] ||
      window.textosInterface.pt;
  };

  function atualizarBotoesIdioma(idioma) {
    botoesIdioma.forEach(function (botao) {
      const estaAtivo =
        botao.dataset.idioma === idioma;

      botao.classList.toggle(
        "ativo",
        estaAtivo
      );

      botao.setAttribute(
        "aria-pressed",
        estaAtivo ? "true" : "false"
      );
    });
  }

  function definirCookieTraducao(idioma) {
    const valor = "/pt/" + idioma;

    document.cookie =
      "googtrans=" +
      valor +
      "; path=/; SameSite=Lax";
  }

  function removerCookieTraducao() {
    document.cookie =
      "googtrans=; path=/;" +
      " expires=Thu, 01 Jan 1970 00:00:00 GMT;" +
      " SameSite=Lax";
  }

  function alterarIdioma(idioma) {
    const idiomaEscolhido =
      normalizarIdioma(idioma);

    localStorage.setItem(
      "idioma-nei",
      idiomaEscolhido
    );

    atualizarBotoesIdioma(
      idiomaEscolhido
    );

    if (idiomaEscolhido === "pt") {
      removerCookieTraducao();
      window.location.reload();
      return;
    }

    definirCookieTraducao(
      idiomaEscolhido
    );

    const seletorGoogle =
      document.querySelector(".goog-te-combo");

    if (seletorGoogle) {

      seletorGoogle.value =
        idiomaEscolhido;

      seletorGoogle.dispatchEvent(
        new Event("change", {
          bubbles: true
        })
      );

      setTimeout(function () {
        window.location.reload();
      }, 1500);

      return;
    }

    /*
    * Caso o Google ainda não tenha carregado,
    * recarrega a página usando o cookie salvo.
    */
    window.location.reload();
  }

  botoesIdioma.forEach(function (botao) {
    botao.addEventListener(
      "click",
      function () {
        alterarIdioma(
          botao.dataset.idioma
        );
      }
    );
  });

  const idiomaSalvo =
    obterIdiomaAtual();

  atualizarBotoesIdioma(
    idiomaSalvo
  );

  document.documentElement.lang =
    idiomaSalvo === "en"
      ? "en-US"
      : idiomaSalvo === "es"
        ? "es"
        : "pt-BR";
})();
