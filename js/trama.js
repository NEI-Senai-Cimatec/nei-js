// trama.js
// NEI - Núcleo de Economia Industrial | SENAI CIMATEC
// Dinâmica de ondas fluidas e harmônicas na capa institucional (seção hero).

(function () {
  'use strict';

  function init() {
    var cv = document.getElementById('onda-hero') || document.getElementById('trama');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    if (!ctx) return;

    var hero = cv.closest ? cv.closest('.hero') : cv.parentElement;
    var animId = null;
    var visivel = true;
    var parado = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var W = 0;
    var H = 0;
    var dpr = 1;

    // 12 partículas de dados brilhantes
    var particulas = [];
    var NUM_PARTICULAS = 12;
    for (var p = 0; p < NUM_PARTICULAS; p++) {
      particulas.push({
        progresso: p / NUM_PARTICULAS,
        velocidade: 0.0006 + (p % 4) * 0.0003,
        feixeIdx: p % 3,
        tamanho: 2.4 + (p % 3) * 1.2,
        alfaBase: 0.5 + (p % 3) * 0.25
      });
    }

    function medir() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      var rect = (hero && hero.getBoundingClientRect()) || {};
      W = rect.width || (hero && hero.clientWidth) || cv.clientWidth || window.innerWidth || 1200;
      H = rect.height || (hero && hero.clientHeight) || cv.clientHeight || 480;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (parado) {
        desenhar(0);
      }
    }

    // Curvas senoidais do feixe de dados
    function calcularLinhaFeixe(x, t, idx) {
      if (idx === 0) {
        return (
          H * 0.38 +
          Math.sin(x * 0.0032 + t * 0.8) * 30 +
          Math.cos(x * 0.0068 - t * 0.5) * 16
        );
      } else if (idx === 1) {
        return (
          H * 0.50 +
          Math.sin(x * 0.0040 - t * 0.65 + 1.8) * 26 +
          Math.sin(x * 0.0085 + t * 0.45) * 14
        );
      }
      return (
        H * 0.62 +
        Math.cos(x * 0.0035 + t * 0.55 + 3.2) * 28 +
        Math.sin(x * 0.0072 - t * 0.7) * 15
      );
    }

    function desenhar(ms) {
      var t = ms / 1000;
      ctx.clearRect(0, 0, W, H);

      // 1. Feixes de ondas luminosas (linhas de sinal) com alto contraste
      var passoX = 6;
      for (var l = 0; l < 3; l++) {
        ctx.save();
        var gradLinha = ctx.createLinearGradient(0, 0, W, 0);
        gradLinha.addColorStop(0, 'rgba(0, 163, 224, 0.08)');
        gradLinha.addColorStop(0.3, 'rgba(0, 163, 224, 0.35)');
        gradLinha.addColorStop(0.65, 'rgba(0, 210, 255, 0.75)');
        gradLinha.addColorStop(1, 'rgba(180, 240, 255, 0.90)');

        ctx.beginPath();
        for (var x = 0; x <= W + passoX; x += passoX) {
          var y = calcularLinhaFeixe(x, t, l);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = gradLinha;
        ctx.lineWidth = l === 1 ? 2.2 : 1.6;
        ctx.shadowColor = 'rgba(0, 210, 255, 0.8)';
        ctx.shadowBlur = l === 1 ? 12 : 6;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Partículas pulsantes ao longo dos feixes de ondas
      if (!parado) {
        for (var i = 0; i < particulas.length; i++) {
          var pt = particulas[i];
          pt.progresso += pt.velocidade;
          if (pt.progresso > 1) pt.progresso -= 1;

          var px = pt.progresso * W;
          var py = calcularLinhaFeixe(px, t, pt.feixeIdx);

          var alfa = pt.alfaBase * Math.min(1, pt.progresso * 1.8);
          if (alfa > 0.05) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(px, py, pt.tamanho, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(210, 248, 255, ' + alfa.toFixed(2) + ')';
            ctx.shadowColor = 'rgba(0, 210, 255, 0.9)';
            ctx.shadowBlur = 8;
            ctx.fill();
            ctx.restore();
          }
        }
      }

      if (!parado && visivel) {
        animId = requestAnimationFrame(desenhar);
      }
    }

    medir();
    window.addEventListener('resize', medir, { passive: true });

    // Desenhar o primeiro quadro imediatamente
    desenhar(performance.now());
    if (!parado) {
      animId = requestAnimationFrame(desenhar);
    }

    // Otimização: pausar quando a seção hero sair da janela
    if ('IntersectionObserver' in window && hero) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            visivel = entry.isIntersecting;
            if (visivel && !parado) {
              if (!animId) animId = requestAnimationFrame(desenhar);
            } else if (!visivel && animId) {
              cancelAnimationFrame(animId);
              animId = null;
            }
          });
        },
        { threshold: 0.05 }
      );
      observer.observe(hero);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
