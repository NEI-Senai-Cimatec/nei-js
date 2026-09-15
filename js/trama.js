// trama.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Animacao do canvas de fundo do hero.
// Extraido de index.html (bloco original: linhas 527-587).

(function () {
  var cv = document.getElementById('trama');
  if (!cv) return;
  var ctx = cv.getContext('2d');

  var N = 70;          // numero de curvas
  var COR = '0,87,168';  // --azul-institucional em RGB
  var ALFA = 0.23;        // opacidade base
  var VEL = 1.12;        // velocidade da onda
  var ONDA = 0.1;       // amplitude do movimento lateral
  var ESPAL = 4;         // defasagem ao longo do feixe
  var CINT = 0.55;        // profundidade da cintilacao

  var W = 0, H = 0, dpr = 1;
  var parado = matchMedia('(prefers-reduced-motion: reduce)').matches;

  function medir() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (parado) quadro(0);
  }

  function quadro(ms) {
    var t = ms / 1000;
    ctx.clearRect(0, 0, W, H);
    ctx.lineWidth = 1.1;
    var A = ONDA * W;

    for (var i = 0; i < N; i++) {
      var u = i / (N - 1);
      var uu = Math.pow(u, 1.3);
      var f = u * ESPAL;

      var d0 = A * 0.55 * Math.sin(t * VEL * 1.00 + f);
      var d1 = A * 0.85 * Math.sin(t * VEL * 0.73 + f * 1.4 + 1.1);
      var dc = A * 1.70 * Math.sin(t * VEL * 0.61 + f * 0.8 + 2.3);
      var cy = H * (0.46 + 0.10 * Math.sin(t * VEL * 0.47 + f * 0.5));

      var brilho = 0.5 + 0.5 * Math.sin(t * VEL * 0.9 + f * 1.9);
      var a = ALFA * (1 - CINT + CINT * brilho) * (0.5 + 0.5 * (1 - uu));

      ctx.beginPath();
      ctx.moveTo(W * (0.50 + 0.66 * uu) + d0, -25);
      ctx.quadraticCurveTo(
        W * (0.58 + 0.82 * uu) + dc, cy,
        W * (0.26 + 0.74 * uu) + d1, H + 25
      );
      ctx.strokeStyle = 'rgba(' + COR + ',' + a.toFixed(3) + ')';
      ctx.stroke();
    }
    if (!parado) requestAnimationFrame(quadro);
  }

  medir();
  addEventListener('resize', medir, { passive: true });
  if (!parado) requestAnimationFrame(quadro);
})();
