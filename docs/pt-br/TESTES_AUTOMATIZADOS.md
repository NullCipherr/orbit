# Testes Automatizados

## Estado Atual

Atualmente, o projeto possui verificação automática de tipagem:

```bash
npm run lint
```

Script equivalente:

- `tsc --noEmit`

## Cobertura Atual

- validação de tipos TypeScript;
- checagem de contratos estáticos entre componentes, hook e utilitários.

## Lacunas

- sem testes unitários para utilitários (`orbitTelemetry`);
- sem testes de contrato de mensagens do worker;
- sem testes de integração de UI;
- sem validação automatizada de regressão visual/performance.

## Estratégia Recomendada (incremental)

1. Adicionar testes unitários para `calculateTelemetry` e `formatTelemetryValue`.
2. Adicionar testes de contrato para mensagens aceitas pelo worker.
3. Adicionar smoke tests de render básico em ambiente de navegador real.
4. Criar rotina mínima de CI com `install + lint + test`.

## Critério de Pronto para PR

- `npm run lint` sem erros;
- documentação atualizada quando houver alteração arquitetural;
- alteração relevante registrada em `CHANGELOG.md`.
