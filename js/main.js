/* ==========================================================================
   Pesquisa Eleitoral 2026
   Placar, pontos e pagamentos são SIMULADOS no navegador (localStorage).
   Em produção: placar numa API e Pix num PSP de verdade, com webhook.
   ========================================================================== */

const CHAVES = {
  lado: "termometro:lado",
  placar: "termometro:placar",
  pontos: "termometro:pontos",
  indicados: "termometro:indicados",
  creditado: "termometro:creditado",
  codigo: "termometro:codigo",
};

// Endere\u00e7o p\u00fablico do site, usado no link de indica\u00e7\u00e3o.
// Deixe vazio pra usar o endere\u00e7o que o navegador j\u00e1 est\u00e1 mostrando.
const SITE = "";

const META_PONTOS = 5;
const ATUALIZA_MS = 5000;

const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

const ler = (chave, padrao) => {
  try {
    const v = localStorage.getItem(chave);
    return v === null ? padrao : JSON.parse(v);
  } catch {
    return padrao;
  }
};
const gravar = (chave, valor) => {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {}
};

const int = (v) => Math.round(v).toLocaleString("pt-BR");
const pct = (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + "%";
const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const sorteio = (lista) => lista[Math.floor(Math.random() * lista.length)];

/* ==========================================================================
   Conteúdo. A conversa muda de tom conforme o lado escolhido.
   ========================================================================== */
const CAMPOS = {
  lula: {
    nome: "Lula",
    rotulo: "Lula · campo popular",
    copy: {
      kicker: "Você tá no campo do Lula",
      "apoio-kicker": "Como ajudar em 10 segundos",
      "apoio-titulo": "Seu voto entra na barra na hora",
      "apoio-texto":
        "Escolhe quantos votos quer dar. A barra vermelha sobe na sua frente, no mesmo segundo.",
      "apoio-botao": "Votar no Lula · R$ 2,50",
      "apoio-nota": "Pix na hora · sem cadastro · voto simbólico",
      "pacotes-titulo": "Quanto custa cada voto",
      "pacotes-texto": "R$ 0,50 o voto. Quanto mais voto, mais a barra vermelha anda.",
      "acervo-titulo": "6 livros do nosso lado",
      "acervo-texto": "R$ 9,90 cada. Título inventado pra você ganhar discussão de mesa.",
      "surpresa-titulo": "O que te espera até a eleição",
    },
  },
  flavio: {
    nome: "Flávio",
    rotulo: "Flávio · campo patriota",
    copy: {
      kicker: "Você tá no campo do Flávio",
      "apoio-kicker": "Como ajudar em 10 segundos",
      "apoio-titulo": "Seu voto entra na barra na hora",
      "apoio-texto":
        "Escolhe quantos votos quer dar. A barra verde sobe na sua frente, no mesmo segundo.",
      "apoio-botao": "Votar no Flávio · R$ 2,50",
      "apoio-nota": "Pix na hora · sem cadastro · voto simbólico",
      "pacotes-titulo": "Quanto custa cada voto",
      "pacotes-texto": "R$ 0,50 o voto. Quanto mais voto, mais a barra verde anda.",
      "acervo-titulo": "6 livros do nosso lado",
      "acervo-texto": "R$ 9,90 cada. Título inventado pra você ganhar discussão de mesa.",
      "surpresa-titulo": "O que te espera até a eleição",
    },
  },
};

const LIVROS = {
  lula: [
    { t: "Manual do Terceiro Tempo", s: "Volume I", n: "Da cadeia ao Planalto, e de volta, e de novo" },
    { t: "A Picanha Prometida", s: "Culinária aplicada", n: "Receitas que só aparecem em ano de eleição" },
    { t: "Companheiro, Companheira", s: "Retórica", n: "Como esticar qualquer abertura por 40 minutos" },
    { t: "Nunca Antes Neste País", s: "Clássico de bolso", n: "A frase que salva qualquer entrevista apertada" },
    { t: "O Dedo Levantado", s: "Aula de gestual", n: "Nove lições de palanque pra quem fala com as mãos" },
    { t: "Memórias de um Ex Tudo", s: "Autobiografia", n: "Ex presidente, ex réu, ex aposentado, ex de novo" },
  ],
  flavio: [
    { t: "Pátria Amada, Grupo Ativo", s: "Volume I", n: "Como tomar conta de quatorze grupos de WhatsApp" },
    { t: "O Boné e a Bandeira", s: "Moda patriótica", n: "Verde e amarelo em qualquer temperatura, sem suar" },
    { t: "Imbrochável: o Método", s: "Autoajuda", n: "Disciplina, pátria e muito treino de discurso" },
    { t: "Deus, Família e Marketing", s: "Comunicação", n: "A trindade que sustenta a live das dez da noite" },
    { t: "Manual do Sobrenome", s: "Genealogia", n: "Como herdar um eleitorado inteirinho de graça" },
    { t: "Live das Vinte Horas", s: "Ensaios", n: "Dois anos de transmissão apertados em 300 páginas" },
  ],
};

const ZOADAS = [
  {
    dono: "lula",
    txt: "Falou que ia ser r\u00e1pido. Quarenta minutos depois, ainda tava no come\u00e7o do racioc\u00ednio.",
  },
  {
    dono: "flavio",
    txt: "A live come\u00e7a \u00e0s oito. O assunto chega \u00e0s dez. A conclus\u00e3o fica pra pr\u00f3xima.",
  },
  {
    dono: "lula",
    txt: "Sempre tem um de camisa vermelha que jura ter decorado o PIB de 2010. Pede o n\u00famero. Ele te oferece uma cerveja.",
  },
  {
    dono: "flavio",
    txt: "Sempre tem um de bon\u00e9 que jura que n\u00e3o \u00e9 pol\u00edtico, \u00e9 patriota. E fala de pol\u00edtica por quatro horas.",
  },
  {
    dono: null,
    txt: "Os dois v\u00e3o resolver sa\u00fade, seguran\u00e7a e o pre\u00e7o do arroz. Nenhum dos dois resolveu a fila do cart\u00f3rio.",
  },
  {
    dono: null,
    txt: "Voc\u00ea desceu a p\u00e1gina toda de um placar simb\u00f3lico pra provar um ponto que ningu\u00e9m pediu. O Brasil \u00e9 isso.",
  },
];

const PRESSAO = {
  lula: [
    "O BRASIL ESTÁ NAS SUAS MÃOS",
    "APOIE QUEM VAI TRAZER PAZ PRO BRASIL",
    "NÃO DEIXE A DIREITA PASSAR NA SUA FRENTE",
    "CADA MINUTO SEM O SEU APOIO É MINUTO PERDIDO",
    "O OUTRO LADO NÃO ESTÁ DORMINDO. E VOCÊ?",
    "SE VOCÊ NÃO CLICAR, ALGUÉM CLICA CONTRA",
    "O POVO NÃO PODE PERDER ESSA",
    "A BARRA VERMELHA DEPENDE DE VOCÊ AGORA",
    "QUEM AMA O POVO NÃO ASSISTE DE FORA",
    "É AGORA OU É ARREPENDIMENTO DEPOIS",
  ],
  flavio: [
    "O BRASIL ESTÁ NAS SUAS MÃOS",
    "APOIE QUEM VAI TRAZER PAZ PRO BRASIL",
    "NÃO DEIXE A ESQUERDA PASSAR NA SUA FRENTE",
    "DEUS, PÁTRIA, FAMÍLIA E O SEU CLIQUE",
    "A ESQUERDA NÃO DORME. NÃO DURMA TAMBÉM.",
    "SE VOCÊ NÃO CLICAR, ALGUÉM CLICA CONTRA",
    "A PÁTRIA NÃO PODE PERDER ESSA",
    "A BARRA VERDE DEPENDE DE VOCÊ AGORA",
    "PATRIOTA DE VERDADE NÃO ASSISTE DE FORA",
    "É AGORA OU É ARREPENDIMENTO DEPOIS",
  ],
};

// o letreiro mistura pressão com o aviso de sempre, pra ninguém se perder
const LETREIRO_FIXO = [
  "Voto simbólico, <b>não vale na urna</b>",
  "Pesquisa eleitoral independente, sem valor oficial",
];

const DESTINOS = [
  "Voc\u00ea vai discutir pol\u00edtica com um parente essa semana. E vai perder, mesmo estando certo.",
  "Tr\u00eas primos v\u00e3o te bloquear at\u00e9 domingo. Dois voltam.",
  "No churrasco de domingo, voc\u00ea vai ser o \u00faltimo a soltar o microfone.",
  "Voc\u00ea vai mandar esse link pra alguém s\u00f3 pra provocar. E vai funcionar.",
  "Seu candidato ganha no seu grupo, empata no trabalho e perde feio no grupo do pr\u00e9dio.",
  "Voc\u00ea vai voltar nessa p\u00e1gina hoje \u00e0 noite pra ver se a barra mudou. Vai mudar.",
  "Recado curto: sai da internet e vai tomar um caf\u00e9. A elei\u00e7\u00e3o continua a\u00ed amanh\u00e3.",
  "No fim, seu tio vai jurar que previu tudo desde o come\u00e7o.",
];

/* ==========================================================================
   Estado
   ========================================================================== */
let lado = ler(CHAVES.lado, null);
let placar = ler(CHAVES.placar, { lula: 77438, flavio: 71482 });
let pontos = ler(CHAVES.pontos, 0);
let indicados = ler(CHAVES.indicados, 0);
let ultimoDelta = { lula: 0, flavio: 0 };
let ultimaAtualizacao = Date.now();
let cliquesTermo = 0;
let modoFesta = false;

if (!["lula", "flavio"].includes(lado)) lado = null;

// sem O, 0, I e 1: quem for ditar o c\u00f3digo no zap n\u00e3o erra
const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function meuCodigo() {
  let c = ler(CHAVES.codigo, null);
  if (!c || !/^[A-Z2-9]{6}$/.test(c)) {
    c = Array.from({ length: 6 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join("");
    gravar(CHAVES.codigo, c);
  }
  return c;
}

/* ==========================================================================
   Aviso flutuante
   ========================================================================== */
let avisoTimer;
function avisar(msg) {
  const el = $("[data-aviso]");
  el.textContent = msg;
  el.setAttribute("data-visivel", "");
  clearTimeout(avisoTimer);
  avisoTimer = setTimeout(() => el.removeAttribute("data-visivel"), 4200);
}

/* ==========================================================================
   Portão. A pergunta fica trocando de nome até alguém escolher um lado.
   ========================================================================== */
let perguntaAtual = Math.random() < 0.5 ? "lula" : "flavio";
let perguntaTimer;

function pintarPergunta() {
  const el = $("[data-pergunta-nome]");
  if (!el) return;
  el.textContent = CAMPOS[perguntaAtual].nome;
  el.dataset.nome = perguntaAtual;
  // reinicia a animação de entrada
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "";
}

function girarPergunta() {
  perguntaAtual = perguntaAtual === "lula" ? "flavio" : "lula";
  pintarPergunta();
}

/* ==========================================================================
   Troca de lado. A página inteira se remodela.
   ========================================================================== */
function aplicarLado() {
  document.documentElement.dataset.lado = lado || "";
  const portao = $("#portao");
  const app = $("#app");
  const abre = $(".abre-indica");

  if (!lado) {
    portao.hidden = false;
    app.hidden = true;
    abre.hidden = true;
    clearInterval(perguntaTimer);
    clearInterval(pressaoTimer);
    pintarPergunta();
    perguntaTimer = setInterval(girarPergunta, 3200);
    return;
  }

  clearInterval(perguntaTimer);
  portao.hidden = true;
  app.hidden = false;
  abre.hidden = false;

  const campo = CAMPOS[lado];
  $("[data-lado-rotulo]").textContent = campo.rotulo;
  Object.entries(campo.copy).forEach(([chave, valor]) => {
    const el = $(`[data-copy="${chave}"]`);
    if (el) el.innerHTML = valor;
  });

  montarLetreiro();
  montarEstante();
  montarResenha();
  pressaoIndice = 0;
  girarPressao();
  clearInterval(pressaoTimer);
  pressaoTimer = setInterval(girarPressao, 3800);

  // o botao de trocar de lado promete o nome do outro candidato
  const rival = lado === "lula" ? "flavio" : "lula";
  $("[data-trocar]").textContent = `Vou votar no ${CAMPOS[rival].nome}, que é melhor`;

  // os botoes dos pacotes dizem o nome do candidato, pra nao sobrar duvida
  $$("[data-cta-nome]").forEach((el) => {
    const qtd = Number(el.closest("[data-votar]")?.dataset.votar || 0);
    if (qtd) el.textContent = `Votar no ${campo.nome} · ${brl(qtd * 0.5)}`;
  });

  render();
  renderIndica();
}

function escolherLado(novo, comAnimacao = true) {
  const troca = () => {
    lado = novo;
    gravar(CHAVES.lado, novo);
    document.body.removeAttribute("data-portao-saindo");
    aplicarLado();
    scrollTo({ top: 0, behavior: "instant" });
    if (novo) avisar(`Chegou no campo do ${CAMPOS[novo].nome}. A página agora é sua.`);
  };

  if (novo && comAnimacao && !$("#portao").hidden) {
    document.body.setAttribute("data-portao-saindo", "");
    setTimeout(troca, 520);
  } else {
    troca();
  }
}

/* ==========================================================================
   Gráfico. O mesmo para os dois lados.
   ========================================================================== */
function render() {
  const total = placar.lula + placar.flavio;
  const p = { lula: (placar.lula / total) * 100, flavio: (placar.flavio / total) * 100 };
  const diff = Math.abs(placar.lula - placar.flavio);
  const lider = placar.lula >= placar.flavio ? "lula" : "flavio";

  $$("[data-total], [data-total-portao]").forEach((el) => (el.textContent = int(total)));
  $$("[data-portal-num]").forEach((el) => (el.textContent = pct(p[el.dataset.portalNum])));

  ["lula", "flavio"].forEach((c) => {
    $(`[data-pct="${c}"]`).textContent = pct(p[c]);
    $(`[data-votos="${c}"]`).textContent = int(placar[c]) + " votos";
    // a barra e a foto na ponta dela andam juntas
    const largura = Math.max(8, Math.min(100, p[c]));
    $(`[data-barra="${c}"]`).style.setProperty("--w", largura + "%");
    $(`[data-ficha="${c}"]`).style.setProperty("--w", largura + "%");
    $(`[data-delta="${c}"]`).textContent = ultimoDelta[c] ? `+${int(ultimoDelta[c])} nos últimos 5s` : "sem voto novo";
  });

  // barra de vantagem
  $("[data-vant-barra]").style.width = p.lula + "%";
  $('[data-vant="lula"]').textContent = `Lula ${pct(p.lula)}`;
  $('[data-vant="flavio"]').textContent = `${pct(p.flavio)} Flávio`;
  $('[data-vant="centro"]').textContent = `${CAMPOS[lider].nome} na frente por ${int(diff)} votos`;

  if (lado) {
    const outro = lado === "lula" ? "flavio" : "lula";
    $("[data-meu-pct]").textContent = pct(p[lado]);
    $("[data-outro-pct]").textContent = pct(p[outro]);
    $("[data-diferenca]").textContent = (lider === lado ? "+" : "-") + int(diff);

    // o título é o placar: quem bate o olho já sabe se tá ganhando ou perdendo
    const h = $("[data-titulo-dinamico]");
    if (lider === lado) {
      h.innerHTML = `Você tá ganhando por <em>${int(diff)}</em> votos. Segura essa.`;
    } else {
      h.innerHTML = `Faltam <em>${int(diff)}</em> votos pro ${CAMPOS[lado].nome} virar o jogo.`;
    }
  }

  renderTermo(p, lider);
}

function renderTermo(p, lider) {
  if (!lado) return;
  const meu = p[lado];
  $("[data-termo-merc]").style.setProperty("--h", Math.max(6, Math.min(100, meu)) + "%");

  let titulo;
  if (modoFesta) titulo = "Modo churrasco ligado";
  else if (meu >= 55) titulo = "Fervendo";
  else if (meu >= 50) titulo = "Na frente, mas suando";
  else if (meu >= 45) titulo = "Esquentando";
  else titulo = "Morno, e isso é ruim";

  $("[data-termo-titulo]").textContent = titulo;
  $("[data-termo-sub]").textContent = modoFesta
    ? "você achou o segredo da casa"
    : `${CAMPOS[lado].nome} com ${pct(meu)} do placar`;
}

function simular() {
  ultimoDelta = { lula: Math.floor(Math.random() * 42), flavio: Math.floor(Math.random() * 42) };
  placar.lula += ultimoDelta.lula;
  placar.flavio += ultimoDelta.flavio;
  ultimaAtualizacao = Date.now();
  gravar(CHAVES.placar, placar);
  render();
}

function somar(campo, qtd) {
  placar[campo] = Math.max(0, placar[campo] + qtd);
  ultimaAtualizacao = Date.now();
  gravar(CHAVES.placar, placar);
  render();
}

function relogio() {
  const s = Math.round((Date.now() - ultimaAtualizacao) / 1000);
  $$("[data-relogio]").forEach((el) => (el.textContent = s + "s"));
  const el2 = $("[data-relogio-2]");
  if (el2) el2.textContent = `mexeu faz ${s}s`;
}

/* ==========================================================================
   Fotos das fichas. Usa fotos/*.webp e cai nas iniciais se faltar arquivo.
   ========================================================================== */
function montarFotos() {
  ["lula", "flavio"].forEach((c) => {
    const ficha = $(`[data-ficha="${c}"]`);
    const img = new Image();
    img.src = `fotos/${c}.webp`;
    img.alt = CAMPOS[c].nome;
    img.addEventListener("load", () => {
      ficha.textContent = "";
      ficha.appendChild(img);
    });
    // se der erro, fica a inicial que já está no HTML
  });
}

/* ==========================================================================
   Estante, resenha e letreiro
   ========================================================================== */
// so entram os livros do campo escolhido: nada do outro lado aparece aqui
function montarEstante() {
  if (!lado) return;
  const alvo = $("[data-livros]");
  alvo.innerHTML = LIVROS[lado]
    .map(
      (l, i) => `
      <button class="livro" data-livro="${lado}" data-titulo="${l.t}">
        <span class="livro__selo">${l.s}</span>
        <span class="livro__t">${l.t}</span>
        <span class="livro__pe"><span>${String(i + 1).padStart(2, "0")}/06</span><span>R$ 9,90</span></span>
      </button>`
    )
    .join("");
  // a piada de cada capa aparece no title, pra quem passa o mouse
  $$("[data-livros] .livro").forEach((el, i) => (el.title = LIVROS[lado][i].n));
  $("[data-prateleira-rot]").textContent = `Seis títulos do campo do ${CAMPOS[lado].nome}`;
}

function montarResenha() {
  if (!lado) return;
  const rival = lado === "lula" ? "flavio" : "lula";
  $("[data-resenha]").innerHTML = ZOADAS.map((z) => {
    let classe = "geral";
    let quem = "Pros dois";
    if (z.dono === lado) {
      classe = "meu";
      quem = `Sobre o ${CAMPOS[lado].nome}`;
    } else if (z.dono === rival) {
      classe = "rival";
      quem = `Sobre o ${CAMPOS[rival].nome}`;
    }
    return `
    <article class="zoada zoada--${classe}">
      <div class="zoada__quem mono">${quem}</div>
      <p>${z.txt}</p>
    </article>`;
  }).join("");
}

function montarLetreiro() {
  const frases = lado ? PRESSAO[lado] : [];
  const fita = [...frases.map((t) => `<b>${t}</b>`), ...LETREIRO_FIXO]
    .map((t) => `<span class="mono">${t}</span>`)
    .join("");
  $$("[data-letreiro]").forEach((el) => (el.innerHTML = fita));
}

// a frase de pressão embaixo do título troca sozinha
let pressaoIndice = 0;
let pressaoTimer;

function girarPressao() {
  const el = $("[data-pressao]");
  if (!el || !lado) return;
  const frases = PRESSAO[lado];
  el.textContent = frases[pressaoIndice % frases.length];
  pressaoIndice++;
  el.style.animation = "none";
  void el.offsetWidth;
  el.style.animation = "";
}

/* ==========================================================================
   Indique e ganhe
   ========================================================================== */
function linkIndicacao() {
  const base = SITE || location.href;
  const url = new URL(base, location.href);
  url.hash = "";
  url.search = "?ref=" + meuCodigo();
  // "/pasta/index.html" vira "/pasta/": link curto e sem cara de arquivo
  url.pathname = url.pathname.replace(/index\.html?$/i, "");
  return url.toString();
}

// na tela o link aparece sem https:// e sem www, que \u00e9 ru\u00eddo
function linkVisivel() {
  return linkIndicacao().replace(/^https?:\/\//i, "").replace(/^www\./i, "");
}

function creditarIndicacao() {
  const ref = new URLSearchParams(location.search).get("ref");
  if (!ref || ref === meuCodigo()) return;
  const jaCreditados = ler(CHAVES.creditado, []);
  if (jaCreditados.includes(ref)) return; // uma visita credita uma vez só
  jaCreditados.push(ref);
  gravar(CHAVES.creditado, jaCreditados);
  pontos += 1;
  indicados += 1;
  gravar(CHAVES.pontos, pontos);
  gravar(CHAVES.indicados, indicados);
  avisar("Você caiu aqui por indicação. Tá com mais 1 ponto na conta.");
}

function renderIndica() {
  $("[data-pontos]").textContent = int(pontos);
  $("[data-indicados]").textContent = int(indicados);
  $("[data-indica-badge]").textContent = int(pontos);
  $("[data-link]").textContent = linkVisivel();

  const falta = Math.max(0, META_PONTOS - pontos);
  $("[data-progresso]").style.width = Math.min(100, (pontos / META_PONTOS) * 100) + "%";
  $("[data-progresso-txt]").textContent = falta
    ? `falta ${falta} ${falta === 1 ? "ponto" : "pontos"} pra poder trocar`
    : "já pode trocar, tem 5 pontos na mão";

  const liberado = pontos >= META_PONTOS;
  $("[data-usar-estado]").textContent = liberado ? "liberado" : `precisa de ${META_PONTOS} pts`;
  $$("[data-usar]").forEach((b) => (b.disabled = !liberado));
}

function usarPontos(campo, sinal) {
  if (pontos < META_PONTOS) return;
  pontos -= META_PONTOS;
  gravar(CHAVES.pontos, pontos);
  somar(campo, sinal * META_PONTOS);
  renderIndica();
  avisar(`Trocado! ${sinal > 0 ? "Mais" : "Menos"} ${META_PONTOS} pontos pro ${CAMPOS[campo].nome}.`);
  if (sinal > 0) confete(campo);
}

/* ==========================================================================
   Pix simulado
   ========================================================================== */
const modal = $("[data-modal]");
let pedido = { qtd: 0, valor: 0, campo: null, tipo: "voto" };
let confirmando = false;

function qrFake() {
  // "QR" de demonstração, sempre igual. Não representa cobrança nenhuma.
  const g = $("[data-qr]");
  let semente = 7;
  const rnd = () => (semente = (semente * 1103515245 + 12345) % 2147483648) / 2147483648;
  let saida = "";
  for (let y = 0; y < 29; y++) {
    for (let x = 0; x < 29; x++) {
      const cantoOlho = (cx, cy) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
      const olho = cantoOlho(0, 0) || cantoOlho(22, 0) || cantoOlho(0, 22);
      const dentro = olho
        ? !((x % 7 === 1 || x % 7 === 5) && y % 7 > 0 && y % 7 < 6) &&
          !((y % 7 === 1 || y % 7 === 5) && x % 7 > 0 && x % 7 < 6)
        : rnd() > 0.52;
      if (dentro) saida += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  }
  g.innerHTML = saida;
}

function abrirPix({ qtd, valor, titulo, sub, tipo = "voto" }) {
  pedido = { qtd, valor, campo: lado, tipo };
  $("[data-modal-titulo]").textContent = titulo;
  $("[data-modal-sub]").textContent = sub;
  $("[data-modal-valor]").textContent = brl(valor);
  $("[data-modal-qtd]").textContent = tipo === "voto" ? int(qtd) : "1 e-book";
  $("[data-modal-campo]").textContent = CAMPOS[lado].nome;
  $("[data-modal-st]").textContent = "Ambiente de demonstração: nenhuma cobrança é feita.";
  $("[data-confirmar]").disabled = false;
  confirmando = false;
  modal.showModal();
}

function confirmarPix() {
  if (confirmando) return;
  confirmando = true;
  $("[data-confirmar]").disabled = true;
  $("[data-modal-st]").textContent = "Conferindo o pagamento, um segundo...";

  setTimeout(() => {
    if (pedido.tipo === "voto") {
      somar(pedido.campo, pedido.qtd);
      $("[data-modal-st]").textContent = `Tá valendo! Mais ${int(pedido.qtd)} votos simbólicos.`;
    } else {
      $("[data-modal-st]").textContent = "Tá valendo! Acesso liberado.";
    }
    setTimeout(() => {
      modal.close();
      confirmando = false;
      avisar(
        pedido.tipo === "voto"
          ? `Mais ${int(pedido.qtd)} votos simbólicos pro ${CAMPOS[pedido.campo].nome}.`
          : "Acervo liberado. Boa leitura nessa obra que nem existe."
      );
      if (pedido.tipo === "voto") confete(pedido.campo);
    }, 1100);
  }, 1500);
}

/* ==========================================================================
   Confete e surpresa final
   ========================================================================== */
function confete(campo, quantidade = 70) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const cores =
    campo === "lula" ? ["#e11d2e", "#ff6a72", "#fedf00", "#fff"] : ["#00a854", "#45db8b", "#fedf00", "#fff"];
  const caixa = document.createElement("div");
  caixa.className = "confete";
  for (let i = 0; i < quantidade; i++) {
    const p = document.createElement("i");
    p.style.left = Math.random() * 100 + "vw";
    p.style.background = sorteio(cores);
    p.style.animationDuration = 2.2 + Math.random() * 1.8 + "s";
    p.style.animationDelay = Math.random() * 0.6 + "s";
    caixa.appendChild(p);
  }
  document.body.appendChild(caixa);
  setTimeout(() => caixa.remove(), 5000);
}

function oraculo() {
  const total = placar.lula + placar.flavio;
  const meu = (placar[lado] / total) * 100;
  const saida = $("[data-oraculo-saida]");
  saida.innerHTML = `
    <strong>${sorteio(DESTINOS)}</strong>
    <span>Leitura feita às ${new Date().toLocaleTimeString("pt-BR")}, com o campo do ${CAMPOS[lado].nome} em ${pct(meu)}.
    Rigor científico envolvido: zero, e com muito orgulho.</span>`;
  confete(lado, 40);
}

/* ==========================================================================
   O segredo do termômetro
   ========================================================================== */
function clicarTermo() {
  cliquesTermo++;
  if (cliquesTermo >= 7 && !modoFesta) {
    modoFesta = true;
    confete(lado, 160);
    avisar("MODO CHURRASCO: acabou a discussão, agora é só resenha.");
  }
  render();
}

/* ==========================================================================
   Ligações
   ========================================================================== */
function ligar() {
  // portão
  $$("[data-escolher]").forEach((b) => b.addEventListener("click", () => escolherLado(b.dataset.escolher)));
  $("[data-trocar]").addEventListener("click", () => {
    escolherLado(lado === "lula" ? "flavio" : "lula", false);
  });

  // votos
  $$("[data-votar]").forEach((b) =>
    b.addEventListener("click", () => {
      const qtd = Number(b.dataset.votar);
      abrirPix({
        qtd,
        valor: qtd * 0.5,
        titulo: "Botar meu voto no placar",
        sub: `${qtd} ${qtd === 1 ? "voto" : "votos"} no ${CAMPOS[lado].rotulo}`,
      });
    })
  );

  // livros
  document.addEventListener("click", (e) => {
    const livro = e.target.closest("[data-livro]");
    if (!livro) return;
    abrirPix({
      qtd: 0,
      valor: 9.9,
      tipo: "livro",
      titulo: "Garantir meu acesso",
      sub: livro.dataset.titulo,
    });
  });

  // painel de indicação
  const painel = $("[data-indica]");
  $$("[data-abrir-indica]").forEach((b) =>
    b.addEventListener("click", () => {
      renderIndica();
      painel.hidden = false;
    })
  );
  $$("[data-fechar-indica]").forEach((b) => b.addEventListener("click", () => (painel.hidden = true)));

  $("[data-copiar-link]").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(linkIndicacao());
      avisar("Link copiado. Manda pra cinco pessoas e volta aqui pra trocar.");
    } catch {
      avisar("Não rolou copiar sozinho. Seleciona o link na mão mesmo.");
    }
  });

  $("[data-compartilhar]").addEventListener("click", async () => {
    const dados = {
      title: "Pesquisa Eleitoral 2026",
      text: `${CAMPOS[lado]?.nome || "Lula"} ou Flávio? Vota aí e vem ver o placar. O voto é simbólico, relaxa.`,
      url: linkIndicacao(),
    };
    try {
      if (navigator.share) await navigator.share(dados);
      else {
        await navigator.clipboard.writeText(`${dados.text} ${dados.url}`);
        avisar("Aqui não tem compartilhar nativo, então já copiei o texto pra você colar.");
      }
    } catch {}
  });

  $$("[data-usar]").forEach((b) =>
    b.addEventListener("click", () => usarPontos(b.dataset.usar, Number(b.dataset.sinal)))
  );

  // modal
  $("[data-fechar-modal]").addEventListener("click", () => modal.close());
  $("[data-confirmar]").addEventListener("click", confirmarPix);
  modal.addEventListener("click", (e) => e.target === modal && modal.close());

  // surpresa e segredo
  $("[data-oraculo]").addEventListener("click", oraculo);
  $("[data-termo]").addEventListener("click", clicarTermo);

  // Esc fecha o painel
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !painel.hidden) painel.hidden = true;
  });
}

/* ==========================================================================
   Início
   ========================================================================== */
creditarIndicacao();
qrFake();
montarEstante();
montarResenha();
montarLetreiro();
montarFotos();
ligar();
aplicarLado();
render();
renderIndica();

setInterval(simular, ATUALIZA_MS);
setInterval(relogio, 1000);
