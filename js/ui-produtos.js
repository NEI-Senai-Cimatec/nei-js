// ui-produtos.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Busca, filtro por texto, setas de navegacao das grades e efeito reveal.
// Extraido de index.html (bloco original: linhas 423-616).

(function () {
  var alvos = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) { alvos.forEach(function (e) { e.classList.add('vis') }) }
  else {
    var obs = new IntersectionObserver(function (ent) {
      ent.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('vis'); obs.unobserve(en.target) } });
    }, { threshold: .12 });
    alvos.forEach(function (e) { obs.observe(e) });
  }

  var busca = document.getElementById('busca');
  if (busca) {
    var cards = [];
    var grupos = Array.prototype.slice.call(document.querySelectorAll('#produtos .grupo'));
    var grades = Array.prototype.slice.call(document.querySelectorAll('#produtos [data-grade]'));
    var vazio = document.getElementById('vazio');
    var contagem = document.getElementById('contagem');
    var total = cards.length;

    function limpa(t) {
      return t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
    window.reindexarBuscaProdutos = function () {
      cards = Array.prototype.slice.call(document.querySelectorAll('#produtos .card'));
      grupos = Array.prototype.slice.call(document.querySelectorAll('#produtos .grupo'));
      grades = Array.prototype.slice.call(document.querySelectorAll('#produtos [data-grade]'));
      total = cards.length;
      cards.forEach(function (c) { c.dataset.texto = limpa(c.textContent.replace(/\s+/g, ' ')) });
    };
    window.reindexarBuscaProdutos();

    function filtrar() {
      var termos = limpa(busca.value.trim()).split(/\s+/).filter(Boolean);
      var visiveis = 0;
      cards.forEach(function (c) {
        var bate = termos.every(function (t) { return c.dataset.texto.indexOf(t) > -1 });
        c.classList.toggle('oculto', !bate);
        if (bate) { visiveis++ }
      });
      grades.forEach(function (g, i) {
        var algum = Array.prototype.some.call(g.querySelectorAll('.card'), function (c) { return !c.classList.contains('oculto') });
        g.classList.toggle('oculto', !algum);
        var wrapper = g.closest('.produtos-wrapper');
        if (wrapper) { wrapper.classList.toggle('oculto', !algum); }
        if (grupos[i]) { grupos[i].classList.toggle('oculto', !algum); }
      });
      vazio.style.display = visiveis === 0 ? 'block' : 'none';
      contagem.textContent = termos.length === 0 ? '' : visiveis + ' de ' + total + ' estudos';
      if (window.atualizarNavProdutos) { window.atualizarNavProdutos(); }
    }
    busca.addEventListener('input', filtrar);
    busca.addEventListener('search', filtrar);
  }

  function initNavProdutos() {
    var listas = document.querySelectorAll('.produtos.reveal');
    var fnAtualizarTodas = [];

    listas.forEach(function (lista) {
      var wrapper = lista.closest('.produtos-wrapper');
      if (!wrapper) return;
      var btnPrev = wrapper.querySelector('.btn-prev');
      var btnNext = wrapper.querySelector('.btn-next');
      if (!btnPrev || !btnNext) return;

      function atualizarBotoes() {
        var maxScroll = lista.scrollWidth - lista.clientWidth;
        btnPrev.disabled = lista.scrollLeft <= 5;
        btnNext.disabled = lista.scrollLeft >= maxScroll - 5;
      }

      btnPrev.addEventListener('click', function () {
        var card = lista.querySelector('.card:not(.oculto)');
        var pass = card ? card.offsetWidth + 20 : 320;
        lista.scrollBy({ left: -pass, behavior: 'smooth' });
      });

      btnNext.addEventListener('click', function () {
        var card = lista.querySelector('.card:not(.oculto)');
        var pass = card ? card.offsetWidth + 20 : 320;
        lista.scrollBy({ left: pass, behavior: 'smooth' });
      });

      lista.addEventListener('scroll', atualizarBotoes);
      window.addEventListener('resize', atualizarBotoes);
      atualizarBotoes();
      fnAtualizarTodas.push(atualizarBotoes);
    });

    window.atualizarNavProdutos = function () {
      fnAtualizarTodas.forEach(function (fn) { fn(); });
    };
  }
  initNavProdutos();

  var modal = document.getElementById('modal-form');
  var moldura = document.getElementById('moldura');
  var modalContatoEstudo = document.getElementById('modal-contato-estudo');

  var btnFecharContatoEstudo = document.getElementById('btn-fechar-contato-estudo');
  var url = 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=Qphi0sNU7EG6tSre6-k5w7Ukfmdhn4NHmqBk_imgSEhUQllIWk1PUDIxOTlUV1c2TlYxNTU1T09VOS4u&embed=true';

  function abrir() {
    if (!moldura.querySelector('iframe')) {
      var f = document.createElement('iframe');
      f.setAttribute('src', url);
      f.setAttribute('title', 'Formulário de demandas do NEI');
      f.setAttribute('allowfullscreen', '');
      moldura.appendChild(f);
    }
    modal.classList.add('aberto');
    document.body.classList.add('travado');
  }
  function fechar() {
    modal.classList.remove('aberto');
    document.body.classList.remove('travado');
  }

  function abrirContatoEstudo() {
    if (!modalContatoEstudo) {
      return;
    }

    modalContatoEstudo.classList.add('aberto');

    modalContatoEstudo.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add('travado');
  }

  function fecharContatoEstudo() {
    if (!modalContatoEstudo) {
      return;
    }

    modalContatoEstudo.classList.remove('aberto');

    modalContatoEstudo.setAttribute(
      'aria-hidden',
      'true'
    );

    document.body.classList.remove('travado');
  }

  document.querySelectorAll('.abre-form').forEach(function (botao) {
    botao.addEventListener(
      'click',
      abrir
    );
  });

  document.getElementById('btn-fechar').addEventListener('click', fechar);

  modal.addEventListener('click', function (evento) {
    if (evento.target === modal) {
      fechar();
    }
  });

  if (btnFecharContatoEstudo) {
    btnFecharContatoEstudo.addEventListener('click', fecharContatoEstudo);
  }

  if (modalContatoEstudo) {
    modalContatoEstudo.addEventListener('click', function (evento) {
      if (evento.target === modalContatoEstudo) {
        fecharContatoEstudo();
      }
    });
  }

  document.addEventListener('keydown', function (evento) {
    if (evento.key !== 'Escape') {
      return;
    }

    if (modal.classList.contains('aberto')) {
      fechar();
    }

    if (modalContatoEstudo && modalContatoEstudo.classList.contains('aberto')) {
      fecharContatoEstudo();
    }
  });

  window.abrirContatoEstudo = abrirContatoEstudo;
  window.fecharContatoEstudo = fecharContatoEstudo;
})();
