# Site do NEI — Núcleo de Economia Industrial

Site institucional publicado via GitHub Pages em
`https://nei-senai-cimatec.github.io/nei/`.

HTML, CSS e JavaScript puros. Não há build, não há dependências para instalar.
Editar, commitar e dar push publica o site.

---

## Estrutura

```
index.html              marcação da página
css/estilo.css          todo o CSS
js/ui-produtos.js       busca, filtro, setas das grades, efeito reveal
js/idioma.js            alternância de idioma e textos da interface
js/auth.js              Supabase, login, cadastro, links protegidos
js/traducao.js          widget do Google Translate
js/trama.js             animação do canvas de fundo
js/publicacoes.js       carrega os estudos do banco
```

---

## Onde editar o quê

| Quero mudar | Arquivo |
|---|---|
| Texto de qualquer seção | `index.html` |
| Integrantes da equipe, Lattes | `index.html`, seção `<section id="equipe">` |
| Redes sociais, rodapé | `index.html`, `<footer>` |
| Cores, fontes, espaçamentos | `css/estilo.css` (variáveis no `:root`, topo do arquivo) |
| Como os cards de estudos aparecem | `js/publicacoes.js` |
| Regras de login e acesso a PDF | `js/auth.js` |
| Textos traduzidos da interface | `js/idioma.js` |

Os estudos em si **não ficam no código**. Vêm das tabelas
`publicacoes_publicas` e `estudos_tecnicos` no Supabase. Para publicar um
estudo novo, insira a linha no banco — o site pega sozinho.

---

## Ordem dos scripts (não altere)

Os arquivos JS têm dependências entre si e a ordem no `index.html` importa:

1. `ui-produtos.js` expõe `atualizarNavProdutos` e `reindexarBuscaProdutos`
2. `idioma.js` expõe `obterIdiomaAtual` e `obterTextosInterface`
3. `auth.js` cria `supabaseClient` e expõe `vincularLinksProdutos`
4. `traducao.js` depende do widget do Google
5. `trama.js` é independente
6. `publicacoes.js` usa tudo acima — precisa ser o último

Cada `<script src>` está exatamente na posição onde o código inline estava
antes da separação. Mover as tags pode quebrar o carregamento.

---

## Publicar

```bash
git add .
git commit -m "descrição da mudança"
git push
```

O GitHub Pages atualiza em cerca de um minuto. Se o navegador mostrar a
versão antiga, force o recarregamento com `Ctrl+Shift+R`.

---

## Ao mexer no JavaScript

Antes de commitar, confira a sintaxe:

```bash
node --check js/auth.js
```

Sem saída significa que está correto. Vale rodar em qualquer arquivo JS que
você tenha editado — evita publicar uma página que não carrega.

---

## Pendências conhecidas

- O logo da ABEIN em `index.html` (seção Parceiros) está embutido como base64,
  ocupando 18 KB. Trocar por um `.png` em `img/` deixa a página mais leve e
  permite cache entre visitas.
- Confirmar se a tabela `estudos_tecnicos` usa mesmo as colunas
  `caminho_capa` e `caminho_arquivo`. As publicações usam `capa_url` e
  `documento_url`.
- Se as capas estiverem guardadas como base64 no banco, migrar para o Storage
  do Supabase e salvar só a URL. Teste no console do navegador:

  ```js
  supabaseClient.from("publicacoes_publicas").select("*").eq("ativo", true)
    .then(r => console.log("KB:", (JSON.stringify(r.data).length/1024).toFixed(0)));
  ```

  Acima de 50 KB, é aí que está a lentidão no carregamento dos cards.
