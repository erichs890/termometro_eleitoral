// Termômetro Eleitoral 2026 — navegação, placar ao vivo e modais de Pix.
// ponytail: placar e pagamentos são simulados no navegador; ligar a uma API/PSP de Pix quando houver backend.

const MOBILE_ATE = 768; // px
const ATUALIZA_MS = 5000;
const CHAVE_LADO = "termometro:lado";

const placar = { lula: 77438, flavio: 71482 };
let ultimaAtualizacao = Date.now();

const nomes = { popular: "LULA · CAMPO POPULAR", patriota: "FLÁVIO · CAMPO PATRIOTA" };

// ---------- utilidades ----------
const n = (...partes) => partes.map((p) => `[data-n="${p}"]`).join(" ");
const $ = (raiz, sel) => raiz.querySelector(sel);
const $$ = (raiz, sel) => [...raiz.querySelectorAll(sel)];
const int = (v) => v.toLocaleString("pt-BR");
const pct = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }).replace(/ /, " ");

function texto(el, valor) {
  if (el) el.textContent = valor;
}

function lerLado() {
  try {
    return localStorage.getItem(CHAVE_LADO);
  } catch {
    return null;
  }
}

function salvarLado(lado) {
  try {
    lado ? localStorage.setItem(CHAVE_LADO, lado) : localStorage.removeItem(CHAVE_LADO);
  } catch {}
}

// Torna um elemento do design clicável e acessível por teclado.
function acao(el, rotulo, fn) {
  if (!el) return;
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.setAttribute("aria-label", rotulo);
  el.classList.add("clicavel");
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    fn();
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fn();
    }
  });
}

let avisoTimer;
function avisar(msg) {
  const aviso = $(document, ".aviso");
  aviso.textContent = msg;
  aviso.hidden = false;
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => (aviso.hidden = true), 4000);
}

// ---------- telas ----------
let lado = lerLado();

function telaAtual() {
  if (!lado) return $(document, "#portao");
  return $(document, `#${innerWidth < MOBILE_ATE ? "mobile" : "app"}-${lado}`);
}

function ajustarEscala(tela) {
  const frame = tela.firstElementChild;
  frame.style.zoom = "";
  const largura = frame.offsetWidth;
  const escala = tela.hasAttribute("data-mobile") ? innerWidth / largura : Math.min(1, innerWidth / largura);
  frame.style.zoom = escala;
  $$(document, ".modal").forEach((m) => (m.style.zoom = Math.min(1, (innerWidth - 24) / 450)));
}

function mostrar() {
  const atual = telaAtual();
  $$(document, ".tela").forEach((t) => (t.hidden = t !== atual));
  document.body.style.background = getComputedStyle(atual).getPropertyValue("--fundo");
  ajustarEscala(atual);
}

function escolherLado(novo) {
  lado = novo;
  salvarLado(novo);
  mostrar();
  scrollTo(0, 0);
}

// ---------- placar ----------
function render() {
  const total = placar.lula + placar.flavio;
  const pl = (placar.lula / total) * 100;
  const pf = 100 - pl;
  const diff = Math.abs(placar.lula - placar.flavio);

  // Portão
  const portao = $(document, "#portao");
  texto($(portao, n("Top", "R")), `${int(total)} VOTOS COMPUTADOS · AO VIVO`);
  [["Portal · Lula", placar.lula, pl], ["Portal · Flávio", placar.flavio, pf]].forEach(([portal, votos, p]) => {
    const vs = $$(portao, n(portal, "Números", "V"));
    texto(vs[0], int(votos));
    texto(vs[1], pct(p));
  });

  // Desktop
  $$(document, ".tela:not([data-mobile]):not(#portao)").forEach((tela) => {
    const meuLado = tela.dataset.lado;
    texto($(tela, n("Meta", "V")), `${int(total)} VOTOS`);
    texto($(tela, n("Lutador · LULA", "P")), pct(pl));
    texto($(tela, n("Lutador · LULA", "V")), `${int(placar.lula)} VOTOS`);
    texto($(tela, n("Lutador · FLÁVIO BOLSONARO", "P")), pct(pf));
    texto($(tela, n("Lutador · FLÁVIO BOLSONARO", "V")), `${int(placar.flavio)} VOTOS`);
    texto($(tela, n("Rótulos") + " > " + n("A") + " " + n("T")), `LULA ${pct(pl)}`);
    texto($(tela, n("Rótulos") + " > " + n("C")), `VANTAGEM DE ${int(diff)} VOTOS`);
    texto($(tela, n("Rótulos") + " > " + n("B") + " " + n("T")), `${pct(pf)} FLÁVIO`);
    const barra = $(tela, n("Barra", "Lula"));
    if (barra) barra.style.width = pl + "%";
    texto($(tela, n("Barra Fixa", "C", "A")), alerta(meuLado, pl, pf));
  });

  // Mobile
  $$(document, ".tela[data-mobile]").forEach((tela) => {
    texto($(tela, n("C LULA", "P")), pct(pl));
    texto($(tela, n("C LULA", "V")), `${int(placar.lula)} VOTOS`);
    texto($(tela, n("C FLÁVIO", "P")), pct(pf));
    texto($(tela, n("C FLÁVIO", "V")), `${int(placar.flavio)} VOTOS`);
    const barra = $(tela, n("Batalha", "Barra") + " > " + n("L"));
    if (barra) barra.style.width = pl + "%";
    texto($(tela, n("Barra Fixa", "C", "A")), alerta(tela.dataset.lado, pl, pf).replace("SEU CANDIDATO ESTÁ ", ""));
  });
}

function alerta(meuLado, pl, pf) {
  const meu = meuLado === "popular" ? pl : pf;
  const outro = 100 - meu;
  const pontos = Math.max(1, Math.round(Math.abs(meu - outro)));
  return meu >= outro
    ? `SEU CANDIDATO ESTÁ A ${pontos} PONTOS DE PERDER A LIDERANÇA`
    : `SEU CANDIDATO ESTÁ A ${pontos} PONTOS DE RETOMAR A LIDERANÇA`;
}

function tempoAtualizacao() {
  const s = Math.round((Date.now() - ultimaAtualizacao) / 1000);
  $$(document, ".tela:not([data-mobile]) " + n("Barra Fixa", "C", "B")).forEach((el) =>
    texto(el, `ATUALIZADO HÁ ${s} SEGUNDOS · A BARRA MUDA A CADA DEPÓSITO`)
  );
  $$(document, ".tela[data-mobile] " + n("Barra Fixa", "C") + " > " + n("T")).forEach((el) => texto(el, `ATUALIZADO HÁ ${s}S`));
}

function simularVotos() {
  placar.lula += Math.floor(Math.random() * 40);
  placar.flavio += Math.floor(Math.random() * 40);
  ultimaAtualizacao = Date.now();
  render();
}

function somarVotos(ladoVoto, qtd) {
  if (ladoVoto === "popular") placar.lula += qtd;
  else placar.flavio += qtd;
  ultimaAtualizacao = Date.now();
  render();
}

// ---------- modais ----------
function abrirVoto(qtd, extra = {}) {
  const modal = $(document, `#voto-${lado}`);
  const valor = extra.valor ?? qtd * 0.5;
  const linhas = $$(modal, n("Valores", "R"));

  modal.dataset.qtd = qtd;
  texto($(modal, n("Cabeçalho", "T")), extra.titulo ?? "DEPOSITAR MEU VOTO");
  texto($(modal, n("Cabeçalho", "S")), extra.sub ?? `${qtd} ${qtd === 1 ? "VOTO" : "VOTOS"} · ${nomes[lado]}`);
  texto($(linhas[0], n("V")), brl(valor));
  texto($(linhas[1], n("K")), extra.item ? "ITEM" : "VOTOS");
  texto($(linhas[1], n("V")), extra.item ?? String(qtd));
  texto($(modal, n("CTA", "T")), "JÁ PAGUEI · CONFIRMAR");
  texto($(modal, n("St")), "AGUARDANDO PAGAMENTO · CONFIRMAÇÃO AUTOMÁTICA");
  texto($(modal, n("Copiar", "T")), "COPIAR");
  modal.showModal();
}

function abrirLivro(titulo) {
  const modal = $(document, `#livro-${lado}`);
  modal.dataset.titulo = titulo;
  texto($(modal, n("Capa", "T")), titulo);
  modal.showModal();
}

function prepararModais() {
  $$(document, ".modal").forEach((modal) => {
    $(modal, ".fechar").addEventListener("click", () => modal.close());
    // clique fora do conteúdo (no backdrop) fecha
    modal.addEventListener("click", (e) => e.target === modal && modal.close());
  });

  ["popular", "patriota"].forEach((l) => {
    const voto = $(document, `#voto-${l}`);
    let confirmando = false;

    acao($(voto, n("Copiar")), "Copiar código Pix", async () => {
      const codigo = $(voto, n("Copia e Cola", "C")).textContent.trim();
      try {
        await navigator.clipboard.writeText(codigo);
        texto($(voto, n("Copiar", "T")), "COPIADO");
      } catch {
        texto($(voto, n("Copiar", "T")), "ERRO");
      }
    });

    acao($(voto, n("CTA")), "Já paguei, confirmar", () => {
      if (confirmando) return;
      confirmando = true;
      texto($(voto, n("St")), "VERIFICANDO PAGAMENTO…");
      setTimeout(() => {
        const qtd = Number(voto.dataset.qtd);
        if (qtd > 0) somarVotos(l, qtd);
        texto($(voto, n("St")), qtd > 0 ? `PAGAMENTO CONFIRMADO · +${qtd} ${qtd === 1 ? "VOTO" : "VOTOS"}` : "PAGAMENTO CONFIRMADO");
        setTimeout(() => {
          voto.close();
          confirmando = false;
          avisar(qtd > 0 ? `Voto confirmado! +${qtd} para o seu lado.` : "Acesso liberado! O link chega no seu e-mail.");
        }, 1200);
      }, 2000);
    });

    const livro = $(document, `#livro-${l}`);
    acao($(livro, n("CTA")), "Pagar R$ 9,90 no Pix", () => {
      livro.close();
      abrirVoto(0, { titulo: "GARANTIR MEU ACESSO", sub: livro.dataset.titulo, valor: 9.9, item: "1 E-BOOK" });
    });
  });
}

// ---------- ligações das telas ----------
function prepararTelas() {
  const portao = $(document, "#portao");
  acao($(portao, n("Portal · Lula")), "Entrar no Campo Popular", () => escolherLado("popular"));
  acao($(portao, n("Portal · Flávio")), "Entrar no Campo Patriota", () => escolherLado("patriota"));

  $$(document, ".tela:not(#portao)").forEach((tela) => {
    acao($(tela, n("Seu Lado")), "Trocar de lado", () => escolherLado(null));
    acao($(tela, n("Topo") + " > " + n("L")), "Trocar de lado", () => escolherLado(null));
    acao($(tela, n("Botão Gigante")), "Depositar meu voto", () => abrirVoto(1));
    acao($(tela, n("Barra Fixa") + " > " + n("Botão")), "Votar R$ 0,50", () => abrirVoto(1));
    acao($(tela, n("Barra Fixa") + " > " + n("B")), "Votar R$ 0,50", () => abrirVoto(1));
    [["P 1 VOTO", 1], ["P 5 VOTOS", 5], ["P 20 VOTOS", 20]].forEach(([nome, qtd]) =>
      acao($(tela, n(nome)), `Comprar ${qtd} votos`, () => abrirVoto(qtd))
    );
    $$(tela, n("Acervo", "Capa")).forEach((capa) => {
      const livro = capa.parentElement;
      const titulo = $(capa, ':scope > [data-n="Título"], :scope > [data-n="T"]');
      if (!titulo) return;
      const nome = titulo.textContent.trim().replace(/\s+/g, " ");
      acao(livro, `Garantir acesso: ${nome}`, () => abrirLivro(nome));
    });
  });
}

// ---------- início ----------
prepararTelas();
prepararModais();
render();
mostrar();

setInterval(simularVotos, ATUALIZA_MS);
setInterval(tempoAtualizacao, 1000);

let resizeTimer;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(mostrar, 100);
});
