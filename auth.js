// auth.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Cliente Supabase, login, cadastro, links protegidos e URLs assinadas.
// Extraido de index.html (bloco original: linhas 523-1717).

const SUPABASE_URL = "https://rtesmxnuowguozgnjlrd.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ0ZXNteG51b3dndW96Z25qbHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNTY0MzMsImV4cCI6MjEwMzkzMjQzM30.JCHOOBu4AhYSn2-q7h9UUwHx9XePfoCv8LM7ZjlGR6c";
const supabaseClient = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

const modalLogin = document.getElementById("modalLogin");
const btnLoginNavbar = document.getElementById("btnLoginNavbar");
const btnFecharLogin = document.getElementById("btnFecharLogin");
const formLogin = document.getElementById("formLogin");
const loginEmail = document.getElementById("loginEmail");
const loginSenha = document.getElementById("loginSenha");
const btnEntrar = document.getElementById("btnEntrar");
const mensagemLogin = document.getElementById("mensagemLogin");
function obterLinksProtegidos() {
  return document.querySelectorAll("#conteudoProdutos a.link:not(.link-publico)");
}

function obterLinksSitesExternos() {
  return document.querySelectorAll("#conteudoProdutos a.link-site-externo");
}

function obterLinksPdfProtegidos() {
  return document.querySelectorAll("#conteudoProdutos a.link-pdf-protegido");
}
const tituloLogin = document.querySelector(".login-caixa h2");
const introducaoLogin = document.querySelector(".login-intro");
const abrirCadastro = document.getElementById("abrirCadastro");
const voltarLogin = document.getElementById("voltarLogin");
const formCadastro = document.getElementById("formCadastro");
const nomeCadastro = document.getElementById("nomeCadastro");
const emailCadastro = document.getElementById("emailCadastro");
const senhaCadastro = document.getElementById("senhaCadastro");
const confirmarSenhaCadastro = document.getElementById("confirmarSenhaCadastro");
const btnCadastrar = document.getElementById("btnCadastrar");
const mensagemCadastro = document.getElementById("mensagemCadastro");
const atalhoCadastro = document.getElementById("atalhoCadastro");
const modalContatoEstudo = document.getElementById("modal-contato-estudo");
const secaoPastaRestrita = document.getElementById("pasta-restrita");
const containerArquivosPastaRestrita = document.getElementById("arquivos-pasta-restrita");

let sessaoAtual = null;
let usuarioTemAcesso = false;
let usuarioTemAcessoPasta = false;
let arquivosPastaCarregados = false;

function abrirContatoEstudo() {
  if (!modalContatoEstudo) {
    console.error(
      "O elemento #modal-contato-estudo não foi encontrado."
    );
    return;
  }

  modalContatoEstudo.classList.add("aberto");

  modalContatoEstudo.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add("travado");
}

function obterTextosAtuais() {
  if (
    typeof window.obterTextosInterface ===
    "function"
  ) {
    return window.obterTextosInterface();
  }

  return window.textosInterface.pt;
}

async function verificarAutorizacaoUsuario(session) {
  if (!session || !session.user) {
    return false;
  }

  const { data, error } = await supabaseClient
    .from("usuarios_autorizados")
    .select("ativo")
    .eq("user_id", session.user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao verificar autorização:",
      error
    );

    return false;
  }

  return Boolean(data && data.ativo);
}

async function verificarAutorizacaoPasta(session) {
  if (!session || !session.user) {
    return false;
  }

  const { data, error } = await supabaseClient
    .from("usuarios_pasta_restrita")
    .select("ativo")
    .eq("user_id", session.user.id)
    .eq("ativo", true)
    .maybeSingle();

  if (error) {
    console.error(
      "Erro ao verificar autorização da pasta:",
      error
    );

    return false;
  }

  return Boolean(data && data.ativo === true);
}

async function abrirDocumentoPastaRestrita(
  caminhoArquivo,
  link
) {
  if (!usuarioTemAcessoPasta) {
    return;
  }

  if (!caminhoArquivo) {
    console.error(
      "O caminho do documento não foi informado."
    );
    return;
  }

  const textoAnterior = link.textContent;

  link.textContent = "Abrindo...";
  link.setAttribute("aria-busy", "true");

  const novaJanela = window.open(
    "about:blank",
    "_blank"
  );

  if (!novaJanela) {
    link.textContent = textoAnterior;
    link.removeAttribute("aria-busy");

    alert(
      "O navegador bloqueou a nova guia. " +
      "Permita pop-ups para este site e tente novamente."
    );

    return;
  }

  novaJanela.opener = null;

  try {
    const { data, error } =
      await supabaseClient.storage
        .from("pasta-restrita")
        .createSignedUrl(
          caminhoArquivo,
          300
        );

    if (error) {
      throw error;
    }

    if (!data || !data.signedUrl) {
      throw new Error(
        "A URL temporária não foi gerada."
      );
    }

    novaJanela.location.replace(
      data.signedUrl
    );

    link.textContent = textoAnterior;
  } catch (erro) {
    console.error(
      "Erro ao abrir documento restrito:",
      erro
    );

    novaJanela.close();

    link.textContent =
      "Acesso indisponível";

    setTimeout(function () {
      link.textContent = textoAnterior;
    }, 2500);
  } finally {
    link.removeAttribute("aria-busy");
  }
}

async function carregarArquivosPastaRestrita() {
  if (
    !usuarioTemAcessoPasta ||
    !containerArquivosPastaRestrita
  ) {
    return;
  }

  if (arquivosPastaCarregados) {
    return;
  }

  containerArquivosPastaRestrita.innerHTML =
    '<p class="intro">Carregando documentos...</p>';

  const { data: arquivos, error } =
    await supabaseClient
      .from("arquivos_pasta_restrita")
      .select(
        "id, titulo, resumo, tipo, " +
        "caminho_arquivo, caminho_capa, ordem"
      )
      .eq("ativo", true)
      .order("ordem", {
        ascending: true
      });

  if (error) {
    console.error(
      "Erro ao carregar arquivos restritos:",
      error
    );

    containerArquivosPastaRestrita.innerHTML =
      '<p class="vazio" style="display:block">' +
      "Não foi possível carregar os documentos." +
      "</p>";

    return;
  }

  if (!arquivos || arquivos.length === 0) {
    containerArquivosPastaRestrita.innerHTML =
      '<p class="vazio" style="display:block">' +
      "Nenhum documento disponível." +
      "</p>";

    arquivosPastaCarregados = true;
    return;
  }

  const wrapper =
    document.createElement("div");

  wrapper.className =
    "produtos-wrapper";

  const btnAnterior =
    document.createElement("button");

  btnAnterior.type = "button";
  btnAnterior.className =
    "btn-nav btn-prev";
  btnAnterior.setAttribute(
    "aria-label",
    "Documentos restritos anteriores"
  );
  btnAnterior.setAttribute(
    "title",
    "Anterior"
  );

  btnAnterior.innerHTML =
    '<svg viewBox="0 0 24 24" ' +
    'width="20" height="20" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="15 18 9 12 15 6">' +
    "</polyline></svg>";

  const lista =
    document.createElement("div");

  lista.className = "produtos";
  lista.setAttribute(
    "data-grade",
    ""
  );

  const btnProximo =
    document.createElement("button");

  btnProximo.type = "button";
  btnProximo.className =
    "btn-nav btn-next";
  btnProximo.setAttribute(
    "aria-label",
    "Próximos documentos restritos"
  );
  btnProximo.setAttribute(
    "title",
    "Próximo"
  );

  btnProximo.innerHTML =
    '<svg viewBox="0 0 24 24" ' +
    'width="20" height="20" fill="none" ' +
    'stroke="currentColor" stroke-width="2.5" ' +
    'stroke-linecap="round" ' +
    'stroke-linejoin="round" aria-hidden="true">' +
    '<polyline points="9 18 15 12 9 6">' +
    "</polyline></svg>";

  wrapper.appendChild(btnAnterior);
  wrapper.appendChild(lista);
  wrapper.appendChild(btnProximo);

  for (const arquivo of arquivos) {
    const card =
      document.createElement("article");

    card.className = "card";

    const capa =
      document.createElement("div");

    capa.className = "capa doc";

    if (arquivo.caminho_capa) {
      const { data: dadosCapa, error: erroCapa } =
        await supabaseClient.storage
          .from("pasta-restrita")
          .createSignedUrl(
            arquivo.caminho_capa,
            3600
          );

      if (
        !erroCapa &&
        dadosCapa &&
        dadosCapa.signedUrl
      ) {
        const imagem =
          document.createElement("img");

        imagem.src =
          dadosCapa.signedUrl;

        imagem.alt =
          "Capa do documento " +
          arquivo.titulo;

        imagem.loading = "lazy";

        capa.appendChild(imagem);
      }
    }

    const corpo =
      document.createElement("div");

    corpo.className = "corpo";

    const titulo =
      document.createElement("h3");

    titulo.textContent =
      arquivo.titulo;

    corpo.appendChild(titulo);

    if (arquivo.resumo) {
      const resumo =
        document.createElement("p");

      resumo.textContent =
        arquivo.resumo;

      corpo.appendChild(resumo);
    }

    const tipo =
      document.createElement("p");

    tipo.className = "produto";
    tipo.textContent =
      "Produto: " + arquivo.tipo;

    corpo.appendChild(tipo);

    const link =
      document.createElement("a");

    link.className =
      "link link-documento-restrito";

    link.href = "#";
    link.textContent =
      "Acessar documento";

    link.setAttribute(
      "aria-label",
      "Acessar " + arquivo.titulo
    );

    link.addEventListener(
      "click",
      function (evento) {
        evento.preventDefault();

        abrirDocumentoPastaRestrita(
          arquivo.caminho_arquivo,
          link
        );
      }
    );

    corpo.appendChild(link);
    card.appendChild(capa);
    card.appendChild(corpo);
    lista.appendChild(card);
  }

  containerArquivosPastaRestrita.innerHTML = "";
  containerArquivosPastaRestrita.appendChild(
    wrapper
  );

  function atualizarBotoesPasta() {
    const maxScroll =
      lista.scrollWidth -
      lista.clientWidth;

    btnAnterior.disabled =
      lista.scrollLeft <= 5;

    btnProximo.disabled =
      lista.scrollLeft >=
      maxScroll - 5;
  }

  btnAnterior.addEventListener(
    "click",
    function () {
      const card =
        lista.querySelector(".card");

      const distancia =
        card
          ? card.offsetWidth + 20
          : 320;

      lista.scrollBy({
        left: -distancia,
        behavior: "smooth"
      });
    }
  );

  btnProximo.addEventListener(
    "click",
    function () {
      const card =
        lista.querySelector(".card");

      const distancia =
        card
          ? card.offsetWidth + 20
          : 320;

      lista.scrollBy({
        left: distancia,
        behavior: "smooth"
      });
    }
  );

  lista.addEventListener(
    "scroll",
    atualizarBotoesPasta
  );

  window.addEventListener(
    "resize",
    atualizarBotoesPasta
  );

  atualizarBotoesPasta();
  arquivosPastaCarregados = true;
}

function exibirCadastro() {
  formLogin.hidden = true;
  atalhoCadastro.hidden = true;
  formCadastro.hidden = false;

  tituloLogin.textContent = "Criar conta";

  introducaoLogin.textContent =
    "Cadastre-se para acessar os estudos técnicos do NEI.";

  mensagemLogin.textContent = "";
  mensagemCadastro.textContent = "";
  mensagemCadastro.className = "login-mensagem";

  setTimeout(function () {
    nomeCadastro.focus();
  }, 50);
}

function exibirLogin() {
  formCadastro.hidden = true;
  formLogin.hidden = false;
  atalhoCadastro.hidden = false;

  tituloLogin.textContent = "Entrar";

  introducaoLogin.textContent =
    "Entre com seu e-mail e senha para acessar " +
    "os conteúdos restritos.";

  mensagemCadastro.textContent = "";
  mensagemLogin.textContent = "";
  mensagemLogin.className = "login-mensagem";

  setTimeout(function () {
    loginEmail.focus();
  }, 50);
}

function abrirModalLogin() {
  mensagemLogin.textContent = "";
  mensagemLogin.classList.remove("erro", "sucesso");

  modalLogin.classList.add("aberto");
  modalLogin.setAttribute("aria-hidden", "false");
  document.body.classList.add("travado");

  setTimeout(function () {
    loginEmail.focus();
  }, 100);
}

function fecharModalLogin() {
  modalLogin.classList.remove("aberto");
  modalLogin.setAttribute("aria-hidden", "true");
  document.body.classList.remove("travado");

  formLogin.reset();
  formCadastro.reset();

  mensagemLogin.textContent = "";
  mensagemCadastro.textContent = "";

  mensagemLogin.className = "login-mensagem";
  mensagemCadastro.className = "login-mensagem";

  formCadastro.hidden = true;
  formLogin.hidden = false;
  atalhoCadastro.hidden = false;

  tituloLogin.textContent = "Entrar";

  introducaoLogin.textContent = "Entre com seu e-mail e senha para acessar " + "os conteúdos restritos.";
}

function traduzirErroLogin(mensagem) {
  const erros = {
    "Invalid login credentials": "E-mail ou senha incorretos.",
    "Email not confirmed": "O e-mail ainda não foi confirmado.",
    "User not found": "Usuário não encontrado."
  };

  return erros[mensagem] ||
    "Não foi possível entrar. Verifique suas credenciais.";
}

async function atualizarInterfaceAutenticacao(session) {
  sessaoAtual = session;

  const usuarioAutenticado = Boolean(
    session && session.user
  );

  usuarioTemAcesso =
    await verificarAutorizacaoUsuario(session);

  usuarioTemAcessoPasta =
    await verificarAutorizacaoPasta(session);

  if (usuarioAutenticado) {
    btnLoginNavbar.textContent =
      obterTextosAtuais().sair;

    btnLoginNavbar.setAttribute(
      "title",
      "Usuário autenticado: " +
      (session.user.email || "conta ativa")
    );
  } else {
    btnLoginNavbar.textContent =
      obterTextosAtuais().entrar;

    btnLoginNavbar.removeAttribute("title");
  }

  obterLinksProtegidos().forEach(function (link) {
    if (usuarioTemAcesso) {
      link.textContent =
        obterTextosAtuais().acessarEstudo;

      link.classList.remove("link-bloqueado");
      link.removeAttribute("aria-disabled");

      link.setAttribute(
        "title",
        obterTextosAtuais().acessarEstudo
      );

      return;
    }

    link.textContent =
      obterTextosAtuais().entreEmContato;

    link.classList.add("link-bloqueado");
    link.removeAttribute("aria-disabled");

    link.setAttribute(
      "title",
      obterTextosAtuais().entreEmContato
    );
  });

  if (secaoPastaRestrita) {
    secaoPastaRestrita.classList.toggle(
      "oculto",
      !usuarioTemAcessoPasta
    );

    secaoPastaRestrita.setAttribute(
      "aria-hidden",
      usuarioTemAcessoPasta
        ? "false"
        : "true"
    );
  }

  if (usuarioTemAcessoPasta) {
    await carregarArquivosPastaRestrita();
  } else {
    arquivosPastaCarregados = false;

    if (containerArquivosPastaRestrita) {
      containerArquivosPastaRestrita.innerHTML = "";
    }
  }

  if (window.atualizarNavProdutos) {
    setTimeout(function () {
      window.atualizarNavProdutos();
    }, 100);
  }
}

async function realizarCadastro(evento) {
  evento.preventDefault();
  if (!supabaseClient) {
    mensagemCadastro.textContent = "O serviço de cadastro não está configurado.";
    mensagemCadastro.className = "login-mensagem erro";
    return;
  }

  const nome = nomeCadastro.value.trim();
  const email = emailCadastro.value.trim();
  const senha = senhaCadastro.value;
  const confirmarSenha = confirmarSenhaCadastro.value;

  mensagemCadastro.textContent = "";
  mensagemCadastro.className = "login-mensagem";

  if (!nome || !email || !senha || !confirmarSenha) {
    mensagemCadastro.textContent =
      "Preencha todos os campos obrigatórios.";

    mensagemCadastro.classList.add("erro");
    return;
  }

  if (senha.length < 8) {
    mensagemCadastro.textContent =
      "A senha deve ter pelo menos 8 caracteres.";

    mensagemCadastro.classList.add("erro");
    return;
  }

  if (senha !== confirmarSenha) {
    mensagemCadastro.textContent =
      "As senhas informadas não coincidem.";

    mensagemCadastro.classList.add("erro");
    return;
  }

  btnCadastrar.disabled = true;
  btnCadastrar.textContent = obterTextosAtuais().criandoConta;

  let resultado;

  try {
    resultado = await supabaseClient.auth.signUp({
      email: email,
      password: senha,
      options: {
        data: {
          nome: nome
        }
      }
    });
  } catch (erro) {
    console.error("Falha de conexão no cadastro:", erro);

    mensagemCadastro.textContent =
      "Não foi possível conectar ao serviço de cadastro. " +
      "Tente novamente.";

    mensagemCadastro.classList.add("erro");
    return;
  } finally {
    btnCadastrar.disabled = false;
    btnCadastrar.textContent = obterTextosAtuais().criarConta;
  }

  btnCadastrar.disabled = false;
  btnCadastrar.textContent = obterTextosAtuais().criarConta;

  if (resultado.error) {
    console.error(
      "Erro no cadastro:",
      resultado.error
    );

    mensagemCadastro.textContent =
      "Não foi possível criar a conta. " +
      "Verifique os dados e tente novamente.";

    mensagemCadastro.classList.add("erro");
    return;
  }

  formCadastro.reset();

  if (resultado.data.session) {
    mensagemCadastro.textContent =
      "Conta criada com sucesso.";

    mensagemCadastro.classList.add("sucesso");

    await atualizarInterfaceAutenticacao(resultado.data.session);

    setTimeout(function () {
      fecharModalLogin();
    }, 700);

    return;
  }

  mensagemCadastro.textContent =
    "Conta criada. Verifique seu e-mail para confirmar o cadastro.";

  mensagemCadastro.classList.add("sucesso");
}

async function realizarLogin(evento) {
  evento.preventDefault();

  const email = loginEmail.value.trim();
  const password = loginSenha.value;

  mensagemLogin.textContent = "";
  mensagemLogin.classList.remove("erro", "sucesso");

  if (!email || !password) {
    mensagemLogin.textContent = "Preencha o e-mail e a senha.";
    mensagemLogin.classList.add("erro");
    return;
  }

  btnEntrar.disabled = true;
  btnEntrar.textContent = "Entrando...";

  try {
    const { data, error } =
      await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

    if (error) {
      console.error("Erro no login:", error);

      mensagemLogin.textContent =
        traduzirErroLogin(error.message);

      mensagemLogin.classList.add("erro");
      return;
    }

    mensagemLogin.textContent =
      "Login realizado com sucesso.";

    mensagemLogin.classList.add("sucesso");

    await atualizarInterfaceAutenticacao(data.session);

    setTimeout(function () {
      fecharModalLogin();
    }, 400);
  } catch (erro) {
    console.error("Erro de conexão:", erro);

    mensagemLogin.textContent =
      "Não foi possível conectar ao Supabase.";

    mensagemLogin.classList.add("erro");
  } finally {
    btnEntrar.disabled = false;
    btnEntrar.textContent = "Entrar";
  }
}

async function verificarSessao() {
  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error) {
    console.error("Erro ao verificar sessão:", error);
    await atualizarInterfaceAutenticacao(null);
    return;
  }

  await atualizarInterfaceAutenticacao(data.session);
}

async function sair() {
  btnLoginNavbar.disabled = true;
  btnLoginNavbar.textContent = obterTextosAtuais().saindo;

  try {
    const { error } =
      await supabaseClient.auth.signOut();

    if (error) {
      console.error("Erro ao sair:", error);
      alert("Não foi possível encerrar a sessão.");
      await atualizarInterfaceAutenticacao(sessaoAtual);
      return;
    }

    await atualizarInterfaceAutenticacao(null);
  } catch (erro) {
    console.error("Erro de conexão ao sair:", erro);
    alert("Não foi possível encerrar a sessão.");
    await atualizarInterfaceAutenticacao(sessaoAtual);
  }
  finally {
    btnLoginNavbar.disabled = false;
  }
}

async function acionarLoginNavbar() {
  if (sessaoAtual && sessaoAtual.user) {
    await sair();
  } else {
    abrirModalLogin();
  }
}

btnLoginNavbar.addEventListener(
  "click",
  acionarLoginNavbar
);

function vincularLinksProdutos() {

  obterLinksProtegidos().forEach(function (link) {
    if (link.dataset.vinculadoProtegido === "1") { return; }
    link.dataset.vinculadoProtegido = "1";

    link.addEventListener(
      "click",
      function (evento) {
        if (!usuarioTemAcesso) {
          evento.preventDefault();
          evento.stopImmediatePropagation();
          abrirContatoEstudo();
        }
      },
      true
    );
  });

  obterLinksSitesExternos().forEach(function (link) {
    if (link.dataset.vinculadoSite === "1") { return; }
    link.dataset.vinculadoSite = "1";

    link.addEventListener(
      "click",
      async function (evento) {
        evento.preventDefault();
        evento.stopPropagation();

        if (!usuarioTemAcesso) {
          abrirContatoEstudo();
          return;
        }

        const codigoSite = link.dataset.site;
        const textoAnterior = link.textContent;

        if (!codigoSite) {
          console.error(
            "O atributo data-site não foi informado."
          );
          return;
        }

        link.textContent =
          obterTextosAtuais().abrindo;
        link.setAttribute("aria-busy", "true");

        try {
          const { data, error } = await supabaseClient
            .from("destinos_protegidos")
            .select("url")
            .eq("codigo", codigoSite)
            .single();

          if (error) {
            throw error;
          }

          if (!data || !data.url) {
            throw new Error(
              "Endereço do site não encontrado."
            );
          }

          window.open(
            data.url,
            "_blank",
            "noopener,noreferrer"
          );

          link.textContent = obterTextosAtuais().acessarEstudo;
        } catch (erro) {
          console.error(
            "Erro ao abrir site externo:",
            erro
          );

          link.textContent = obterTextosAtuais().acessoIndisponivel;

          setTimeout(function () {
            link.textContent = textoAnterior;
          }, 2500);
        } finally {
          link.removeAttribute("aria-busy");
        }
      }
    );
  });

  obterLinksPdfProtegidos().forEach(function (link) {
    if (link.dataset.vinculadoPdf === "1") { return; }
    link.dataset.vinculadoPdf = "1";

    link.addEventListener(
      "click",
      async function (evento) {
        evento.preventDefault();
        evento.stopPropagation();

        if (!usuarioTemAcesso) {
          abrirContatoEstudo();
          return;
        }

        const caminhoArquivo = link.dataset.arquivo;
        const novaJanela = window.open(
          "about:blank",
          "_blank"
        );

        if (!novaJanela) return;
        const { data, error } =
          await supabaseClient.storage
            .from("estudos-tecnicos")
            .createSignedUrl(
              caminhoArquivo,
              300
            );

        if (error) {
          console.error(error);
          novaJanela.close()
          return;
        }
        novaJanela.location.replace(data.signedUrl);
      }
    );
  });

}

vincularLinksProdutos();

btnFecharLogin.addEventListener(
  "click",
  fecharModalLogin
);

formLogin.addEventListener(
  "submit",
  realizarLogin
);

abrirCadastro.addEventListener(
  "click",
  exibirCadastro
);

voltarLogin.addEventListener(
  "click",
  exibirLogin
);

formCadastro.addEventListener(
  "submit",
  realizarCadastro
);

modalLogin.addEventListener("click", function (evento) {
  if (evento.target === modalLogin) {
    fecharModalLogin();
  }
});

document.addEventListener("keydown", function (evento) {
  if (
    evento.key === "Escape" &&
    modalLogin.classList.contains("aberto")
  ) {
    fecharModalLogin();
  }
});

supabaseClient.auth.onAuthStateChange(function (
  evento,
  session
) {
  setTimeout(function () {
    atualizarInterfaceAutenticacao(session);
  }, 0);
});

window.vincularLinksProdutos = vincularLinksProdutos;
window.reaplicarEstadoAutenticacao = function () {
  return atualizarInterfaceAutenticacao(sessaoAtual);
};

verificarSessao();
