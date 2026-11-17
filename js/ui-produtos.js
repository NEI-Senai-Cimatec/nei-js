// ui-produtos.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Busca, filtro por texto e tipo de produto, modo grade ("Ver todos"), setas de navegacao e efeito reveal.

(function () {
  var alvos = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    alvos.forEach(function (e) { e.classList.add('vis'); });
  } else {
    var obs = new IntersectionObserver(function (ent) {
      ent.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('vis');
          obs.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    alvos.forEach(function (e) { obs.observe(e); });
  }

  var busca = document.getElementById('busca');
  var chipTipoAtivo = '';

  function limpa(t) {
    return String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }

  if (busca) {
    var cards = [];
    var grupos = Array.prototype.slice.call(document.querySelectorAll('#produtos .grupo'));
    var cabecalhosGrupo = Array.prototype.slice.call(document.querySelectorAll('#produtos .grupo-cabecalho'));
    var grades = Array.prototype.slice.call(document.querySelectorAll('#produtos [data-grade]'));
    var vazio = document.getElementById('vazio');
    var contagem = document.getElementById('contagem');
    var total = 0;

    window.reindexarBuscaProdutos = function () {
      cards = Array.prototype.slice.call(document.querySelectorAll('#produtos .card'));
      grupos = Array.prototype.slice.call(document.querySelectorAll('#produtos .grupo'));
      cabecalhosGrupo = Array.prototype.slice.call(document.querySelectorAll('#produtos .grupo-cabecalho'));
      grades = Array.prototype.slice.call(document.querySelectorAll('#produtos [data-grade]'));
      total = cards.length;
      cards.forEach(function (c) {
        c.dataset.texto = limpa(c.textContent.replace(/\s+/g, ' '));
        c.dataset.tipoLimpo = limpa(c.dataset.tipoProduto || '');
      });
      filtrar();
    };

    function filtrar() {
      var termos = limpa(busca.value.trim()).split(/\s+/).filter(Boolean);
      var filtroChipLimpo = limpa(chipTipoAtivo);
      var visiveis = 0;

      cards.forEach(function (c) {
        var bateTexto = termos.every(function (t) {
          return (c.dataset.texto || '').indexOf(t) > -1;
        });
        var bateTipo = !filtroChipLimpo || (c.dataset.tipoLimpo || '') === filtroChipLimpo;
        var bate = bateTexto && bateTipo;
        c.classList.toggle('oculto', !bate);
        if (bate) {
          visiveis++;
        }
      });

      grades.forEach(function (g, i) {
        var cardsGrade = g.querySelectorAll('.card:not(.oculto)');
        var algum = cardsGrade.length > 0;
        g.classList.toggle('oculto', !algum);
        var wrapper = g.closest('.produtos-wrapper');
        if (wrapper) {
          wrapper.classList.toggle('oculto', !algum);
        }
        if (cabecalhosGrupo[i]) {
          cabecalhosGrupo[i].classList.toggle('oculto', !algum);
          var btnVerTodos = cabecalhosGrupo[i].querySelector('.btn-ver-todos');
          if (btnVerTodos) {
            btnVerTodos.hidden = cardsGrade.length <= 3;
          }
        } else if (grupos[i]) {
          grupos[i].classList.toggle('oculto', !algum);
        }
      });

      if (vazio) {
        vazio.style.display = visiveis === 0 && total > 0 ? 'block' : 'none';
      }

      if (contagem) {
        var temFiltro = termos.length > 0 || Boolean(filtroChipLimpo);
        contagem.textContent = !temFiltro ? '' : visiveis + ' de ' + total + ' entregas';
      }

      if (window.atualizarNavProdutos) {
        window.atualizarNavProdutos();
      }
    }

    busca.addEventListener('input', filtrar);
    busca.addEventListener('search', filtrar);

    // Filtros por chip de tipo de produto
    var chips = document.querySelectorAll('[data-chip-tipo]');
    function ativarFiltroTipo(tipo) {
      chipTipoAtivo = tipo || '';
      var tipoLimpo = limpa(chipTipoAtivo);
      chips.forEach(function (chip) {
        var esteLimpo = limpa(chip.getAttribute('data-chip-tipo') || '');
        var ativo = esteLimpo === tipoLimpo;
        chip.classList.toggle('ativo', ativo);
        chip.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      });
      filtrar();
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var tipo = chip.getAttribute('data-chip-tipo') || '';
        if (chipTipoAtivo && limpa(chipTipoAtivo) === limpa(tipo)) {
          ativarFiltroTipo('');
        } else {
          ativarFiltroTipo(tipo);
        }
      });
    });

    // Links clicáveis na seção "Nossa atuação" (#desafios)
    var linksDesafio = document.querySelectorAll('.filtro-desafio-link[data-filtro-tipo]');
    linksDesafio.forEach(function (botao) {
      botao.addEventListener('click', function () {
        var tipo = botao.getAttribute('data-filtro-tipo') || '';
        busca.value = '';
        ativarFiltroTipo(tipo);
        var secaoProdutos = document.getElementById('produtos');
        if (secaoProdutos) {
          secaoProdutos.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });

    window.filtrarProdutosPorTipo = ativarFiltroTipo;
    window.reindexarBuscaProdutos();
  }

  // Botões "Ver todos" para alternar entre carrossel e grade completa
  var botoesVerTodos = document.querySelectorAll('.btn-ver-todos[data-alvo-grade]');
  botoesVerTodos.forEach(function (botao) {
    botao.addEventListener('click', function () {
      var idAlvo = botao.getAttribute('data-alvo-grade');
      var grade = document.getElementById(idAlvo);
      if (!grade) return;
      var wrapper = grade.closest('.produtos-wrapper');
      var expandido = grade.classList.toggle('em-grade');
      if (wrapper) {
        wrapper.classList.toggle('em-grade-wrapper', expandido);
      }
      botao.setAttribute('aria-expanded', expandido ? 'true' : 'false');
      botao.textContent = expandido ? 'Recolher grade' : 'Ver todos';
      if (typeof window.traduzirElemento === 'function') {
        window.traduzirElemento(botao);
      }
      if (window.atualizarNavProdutos) {
        window.atualizarNavProdutos();
      }
    });
  });

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
        if (lista.classList.contains('em-grade')) {
          btnPrev.disabled = true;
          btnNext.disabled = true;
          return;
        }
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

  // Links do formulário de "Solicitar estudo" por idioma (pt, en, es).
  // Substitua as URLs de "en" e "es" quando os formulários traduzidos forem criados.
  var URLS_FORMULARIO_ESTUDO = {
    pt: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=Qphi0sNU7EG6tSre6-k5w7Ukfmdhn4NHmqBk_imgSEhUQllIWk1PUDIxOTlUV1c2TlYxNTU1T09VOS4u',
    en: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=Qphi0sNU7EG6tSre6-k5w7Ukfmdhn4NHmqBk_imgSEhUQllIWk1PUDIxOTlUV1c2TlYxNTU1T09VOS4u',
    es: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=Qphi0sNU7EG6tSre6-k5w7Ukfmdhn4NHmqBk_imgSEhUQllIWk1PUDIxOTlUV1c2TlYxNTU1T09VOS4u'
  };

  // Links do formulário de "Solicitar acesso" (acesso a estudos restritos) por idioma.
  var URLS_FORMULARIO_CONTATO_ESTUDO = {
    pt: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=Qphi0sNU7EG6tSre6-k5w7Ukfmdhn4NHmqBk_imgSEhUOUsxM0dRR01SSkgwRVNSSEpQMkNISFhDSy4u',
    en: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=Qphi0sNU7EG6tSre6-k5w7Ukfmdhn4NHmqBk_imgSEhUOUsxM0dRR01SSkgwRVNSSEpQMkNISFhDSy4u',
    es: 'https://forms.cloud.microsoft/Pages/ResponsePage.aspx?id=Qphi0sNU7EG6tSre6-k5w7Ukfmdhn4NHmqBk_imgSEhUOUsxM0dRR01SSkgwRVNSSEpQMkNISFhDSy4u'
  };

  function obterIdiomaSite() {
    if (typeof window.obterIdiomaAtual === 'function') {
      return window.obterIdiomaAtual();
    }
    var salvo = localStorage.getItem('idioma-nei');
    if (salvo === 'en' || salvo === 'es' || salvo === 'pt') {
      return salvo;
    }
    return 'pt';
  }

  function obterUrlEstudoAtual() {
    var idioma = obterIdiomaSite();
    return URLS_FORMULARIO_ESTUDO[idioma] || URLS_FORMULARIO_ESTUDO.pt;
  }

  function atualizarLinksFormulariosPorIdioma() {
    var idioma = obterIdiomaSite();

    var urlEstudo = obterUrlEstudoAtual();
    var linkFormEstudo = document.getElementById('link-form-estudo');
    if (linkFormEstudo) {
      linkFormEstudo.href = urlEstudo;
    }

    var urlContato = URLS_FORMULARIO_CONTATO_ESTUDO[idioma] || URLS_FORMULARIO_CONTATO_ESTUDO.pt;
    var linkFormContato = document.getElementById('link-form-contato-estudo');
    if (linkFormContato) {
      linkFormContato.href = urlContato;
    }

    var iframeContato = document.getElementById('iframe-contato-estudo');
    if (iframeContato) {
      var urlEmbedContato = urlContato.indexOf('embed=true') > -1 ? urlContato : urlContato + '&embed=true';
      if (iframeContato.getAttribute('src') !== urlEmbedContato) {
        iframeContato.setAttribute('src', urlEmbedContato);
      }
    }
  }

  atualizarLinksFormulariosPorIdioma();
  window.atualizarLinksFormulariosPorIdioma = atualizarLinksFormulariosPorIdioma;

  function abrir() {
    atualizarLinksFormulariosPorIdioma();
    var urlBase = obterUrlEstudoAtual();
    var urlEmbed = urlBase.indexOf('embed=true') > -1 ? urlBase : urlBase + '&embed=true';

    if (moldura) {
      var iframeExistente = moldura.querySelector('iframe');
      if (!iframeExistente) {
        var f = document.createElement('iframe');
        f.setAttribute('src', urlEmbed);
        f.setAttribute('title', 'Formulário de demandas do NEI');
        f.setAttribute('allowfullscreen', '');
        moldura.appendChild(f);
      } else if (iframeExistente.getAttribute('src') !== urlEmbed) {
        iframeExistente.setAttribute('src', urlEmbed);
      }
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

    atualizarLinksFormulariosPorIdioma();

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
