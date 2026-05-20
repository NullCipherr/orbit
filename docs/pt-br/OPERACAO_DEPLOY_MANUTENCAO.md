# Operação, Deploy e Manutenção

## Pré-requisitos

- Node.js `20+`
- npm `10+`

## Execução Local

Instalação e desenvolvimento:

```bash
npm install
npm run dev
```

Acesso padrão:

- `http://localhost:3000`

## Build e Preview

```bash
npm run build
npm run preview
```

## Verificação de Qualidade

```bash
npm run lint
```

No projeto atual, `lint` executa validação de tipagem TypeScript (`tsc --noEmit`).

## Limpeza de Artefatos

```bash
npm run clean
```

## Deploy Estático

O output de produção é gerado em `dist/` e pode ser servido por qualquer host estático (ex.: Nginx, Cloudflare Pages, Vercel, Netlify).

Checklist mínimo de deploy:

- rodar `npm run build` sem erro;
- validar `npm run preview` localmente;
- configurar cache para assets versionados do Vite;
- habilitar compressão (`gzip`/`brotli`) no servidor.

## Manutenção Recomendada

- revisar dependências trimestralmente;
- acompanhar suporte de `OffscreenCanvas` e `WebGL2` nos navegadores alvo;
- registrar mudanças relevantes em `CHANGELOG.md`;
- manter documentação em `docs/` sincronizada com alterações de arquitetura.
