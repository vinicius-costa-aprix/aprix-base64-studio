# Aprix Base64 Studio

Aplicação estática para converter arquivos ou texto em base64.

## O que ela faz

- Recebe um arquivo `.csv`, `.zip`, `.txt` ou texto colado na tela.
- Gera base64 do arquivo exatamente como ele foi enviado.
- Gera base64 do texto digitado.
- Funciona inteiramente no navegador.

## Rodando localmente

Abra `index.html` no navegador.

Se preferir servir por HTTP:

```bash
npx serve .
```

## Publicando no GitHub Pages

1. Suba estes arquivos para um repositório no GitHub.
2. Em `Settings > Pages`, selecione o deploy pela branch principal.
3. Use a raiz do repositório como pasta publicada.

## Publicando na Vercel

Importe o repositório na Vercel. Não é necessário configurar build command.

## Observação

Todo processamento acontece no navegador. O arquivo não é enviado para nenhum servidor.
