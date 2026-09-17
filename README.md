# Termômetro Eleitoral 2026

Site estático em HTML, CSS e JavaScript puros — sem build, sem dependências. Abra `index.html`.

```
site/
├── index.html      telas (portão, app popular/patriota, mobile) + modais
├── css/base.css    tokens, botões, modais, aviso
├── css/telas.css   visual das telas, convertido do design no Pencil
└── js/main.js      fluxo, placar ao vivo, modais de Pix
```

## Fluxo

1. **Portão** — clicar em um portal escolhe o lado (fica salvo no navegador).
2. **App** — placar atualiza a cada 5s; "Trocar" volta ao portão (no mobile, toque no logo).
3. **Votar** — botão gigante, pacotes (1/5/20) ou barra fixa abrem o modal de Pix.
4. **Acervo** — clicar num livro abre o modal de acesso → Pix de R$ 9,90.

Telas abaixo de 768px usam o layout mobile.

> Pagamentos e placar são **simulados** no navegador. Para produção, ligar a um backend com PSP de Pix (código copia-e-cola e QR reais + webhook de confirmação).
