// publicacoes.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Carrega White Papers, Estudos Cientificos e Estudos Tecnicos do Supabase.
// Extraido de index.html (bloco original: linhas 529-675).

// Escapa valores do banco antes de injetar no HTML.
function esc(valor) {
  return String(valor === null || valor === undefined ? "" : valor)
    .replace(/[&<>"']/g, function (c) {
      return {
        "&": "&amp;", "<": "&lt;", ">": "&gt;",
        '"': "&quot;", "'": "&#39;"
      }[c];
    });
}

// Uma única consulta atende White Papers e Estudos Científicos.
async function carregarPublicacoes() {

  const alvos = {
    white_paper: document.getElementById("white-papers-dinamicos"),
    estudo_cientifico: document.getElementById("cientificos-dinamicos")
  };

  if (!alvos.white_paper && !alvos.estudo_cientifico) { return; }

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
    if (alvos[chave]) { alvos[chave].innerHTML = ""; }
  });

  if (!data || data.length === 0) { return; }

  data.forEach(function (item) {

    const container = alvos[item.categoria];
    if (!container) { return; }

    const card = document.createElement("article");
    card.className = "card";

    card.innerHTML = `
        <div class="capa doc">
            <img src="${esc(item.capa_url)}"
                 alt="${esc(item.titulo)}"
                 loading="lazy">
        </div>

        <div class="corpo">
            <h3>${esc(item.titulo)}</h3>
            <p>${esc(item.resumo)}</p>
            <p class="produto">Produto: ${esc(item.tipo)}</p>
            <a class="link link-publico"
               href="${esc(item.documento_url)}"
               target="_blank"
               rel="noopener">Acessar estudo</a>
        </div>
    `;

    container.appendChild(card);

  });

}

async function carregarEstudosTecnicos() {

  const container = document.getElementById("tecnicos-dinamicos");

  if (!container) { return; }

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

  if (!data || data.length === 0) { return; }

  data.forEach(function (estudo) {
    const arquivo = estudo.caminho_arquivo?.toLowerCase();

    const card = document.createElement("article");
    card.className = "card";

    console.log(estudo.tipo);
    card.innerHTML = `
        <div class="capa">
            <img src="${esc(estudo.caminho_capa)}"
                 alt="${esc(estudo.titulo)}"
                 loading="lazy">
        </div>

        <div class="corpo">
            <h3>${esc(estudo.titulo)}</h3>
            <p>${esc(estudo.resumo)}</p>
            <p class="produto">Produto: ${esc(estudo.tipo)}</p>
            <a class="link link-protegido ${arquivo === "compras" || arquivo === "anuario"
        ? "link-site-externo"
        : "link-pdf-protegido"
      }"
href="#"
${arquivo === "compras"
        ? 'data-site="compras"'
        : arquivo === "anuario"
          ? 'data-site="anuario"'
          : `data-arquivo="${esc(estudo.caminho_arquivo)}"`
      }>
Entre em contato
</a>
        </div>
    `;

    container.appendChild(card);

  });

}

// Ordem importa: os cards precisam existir antes de vincular, autenticar e indexar.
(async function inicializarPublicacoes() {

  await Promise.all([
    carregarPublicacoes(),
    carregarEstudosTecnicos()
  ]);

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
