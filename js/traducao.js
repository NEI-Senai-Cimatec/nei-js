// traducao.js
// NEI - Nucleo de Economia Industrial | SENAI CIMATEC
// Inicializacao do widget Google Translate e seu carregamento sob demanda.
// Extraido de index.html (bloco original: linhas 525-586).

function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "pt",
      includedLanguages: "pt,en,es",
      autoDisplay: false
    },
    "google_translate_element"
  );

  const idiomaSalvo =
    localStorage.getItem("idioma-nei") || "pt";

  if (idiomaSalvo === "pt") {
    return;
  }

  let tentativas = 0;

  const temporizador = setInterval(function () {
    const seletorGoogle =
      document.querySelector(".goog-te-combo");

    tentativas += 1;

    if (seletorGoogle) {
      clearInterval(temporizador);

      if (seletorGoogle.value !== idiomaSalvo) {
        seletorGoogle.value = idiomaSalvo;

        seletorGoogle.dispatchEvent(
          new Event("change", {
            bubbles: true
          })
        );
      }

      return;
    }

    if (tentativas >= 20) {
      clearInterval(temporizador);

      console.error(
        "O seletor do Google Translate não foi carregado."
      );
    }
  }, 250);
}

// Só baixa o widget do Google Translate se o idioma salvo não for português.
if ((localStorage.getItem("idioma-nei") || "pt") !== "pt") {
  const elementoTradutor = document.createElement("script");
  elementoTradutor.src =
    "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(elementoTradutor);
}
