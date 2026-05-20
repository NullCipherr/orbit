# Métricas e Automação via Shell

## Objetivo

Fornecer um fluxo simples para coletar indicadores de build e desempenho de forma repetível no ambiente local.

## Automação Básica Disponível

Hoje, os comandos existentes no `package.json` são:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run clean`

## Coleta Manual Sugerida

### 1) Build e tamanho de artefatos

```bash
npm run clean
npm run build
du -sh dist
find dist -type f -maxdepth 2 | sort
```

### 2) Validação de tipagem

```bash
npm run lint
```

### 3) Benchmark de carregamento local (manual)

- subir preview (`npm run preview`)
- abrir Lighthouse no navegador
- registrar LCP, CLS, INP e TBT

## Script Recomendado (próxima etapa)

Criar script em `scripts/metrics.sh` para:

- executar `clean`, `build` e `lint`;
- salvar saída em `reports/metrics/YYYYMMDD_HHMMSS.log`;
- registrar tamanho total de `dist/`.

## Formato de Registro Recomendado

Para cada execução:

- data/hora;
- versão de Node;
- hash de commit;
- status de build e lint;
- tamanho final de `dist/`;
- observações de benchmark manual (quando aplicável).
