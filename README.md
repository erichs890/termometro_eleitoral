# Pesquisa Eleitoral 2026

Site estático em HTML, CSS e JavaScript puros, sem build e sem dependência nenhuma.
Abra `index.html` ou sirva a pasta com `python -m http.server`.

```
├── index.html      portão (a pergunta) + placar + acervo + resenha + rodapé legal
├── css/base.css    tokens, temas por candidato, botões, avisos
├── css/telas.css   portão, abertura, gráfico, estante, painel, modal, rodapé
├── js/main.js      copy por lado, placar, gráfico, indicação, Pix simulado, oráculo
└── fotos/          lula.webp e flavio.webp, usadas na ponta das barras
```

## Como funciona

1. **Portão**: a primeira tela é só a pergunta, que alterna sozinha entre
   *"Lula para a presidência?"* e *"Flávio para a presidência?"*. Escolher um portal salva o
   lado no navegador.
2. **Remodelagem**: o lado escolhido vira `data-lado` no `<html>` e todos os tokens de acento
   trocam, vermelho pro Lula e verde pro Flávio. A copy do título, dos pacotes, do acervo e da
   surpresa é reescrita pro público daquele campo.
3. **Placar primeiro**: sem header e sem seção de abertura. Entra um título chamativo, uma frase de
   pressão que troca sozinha e já vem o gráfico: duas pistas, barra proporcional e a **foto do
   candidato na ponta da linha**, mais barra de vantagem, resumo do seu campo e medidor.
4. **Separação de cores**: verde e vermelho nunca se misturam. O campo do visitante sai na cor
   dele e **o rival sai sempre em cinza neutro** (tokens `--meu*` e `--rival*`). A estante mostra
   só os seis livros do campo escolhido.
5. **Apoiar**: seção com chamada direta ("Apoie o Lula agora") e os pacotes de 1, 5 e 20, que
   abrem o modal de Pix simulado.
6. **Indique e ganhe**: botão fixo no canto inferior direito, link com `?ref=CÓDIGO`, 1 ponto por visita
   nova e, a partir de **5 pontos**, troca por mais ou menos 5 pontos em qualquer campo.
7. **Acervo**: 6 livros fictícios por candidato, aparecendo só na prateleira do lado escolhido.
   Ainda sem imagem, as capas são tipográficas.
8. **Surpresa**: o oráculo do destino eleitoral no fim da página. E tem um segredo: 7 cliques no
   medidor ligam o *modo churrasco*.

## Onde mexer

- **Copy por lado:** `CAMPOS`, em `js/main.js`.
- **Livros:** `LIVROS`, 6 por candidato.
- **Pressão, piadas e destinos:** `PRESSAO` (por lado), `ZOADAS`, `LETREIRO_FIXO` e `DESTINOS`.
- **Cores dos campos:** `--lula*` e `--flavio*`, mais os blocos `html[data-lado="..."]` em
  `css/base.css`.

> Placar, pontos e pagamentos são **simulados** no navegador, via `localStorage`. Pra produção:
> placar numa API, Pix num PSP de verdade (copia e cola e QR reais, com webhook de confirmação) e
> crédito de indicação validado no servidor, porque o `?ref=` atual é honesto mas fácil de burlar.
>
> O rodapé ficou enxuto, com o carimbo de **voto simbólico** (não vale na urna, não vale no TSE).
> A lista longa de avisos legais foi removida a pedido.
