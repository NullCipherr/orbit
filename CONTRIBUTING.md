# Guia de Contribuição

Obrigado por contribuir com o **Event Horizon Engine**.

## Como começar

1. Faça um fork do projeto.
2. Crie uma branch a partir da `main`:
   - `feat/nome-da-feature`
   - `fix/nome-do-ajuste`
   - `docs/nome-da-documentacao`
3. Instale dependências e valide o projeto:
   - `npm install`
   - `npm run lint`
   - `npm run build`

## Padrões esperados

- Código e documentação com nomes claros e objetivos.
- Alterações pequenas e focadas (evite PRs muito amplos).
- Sem segredos ou credenciais versionadas.
- Sem quebra de build/lint.

## Commits e Pull Requests

- Prefira commits atômicos e com mensagem descritiva.
- No PR, inclua:
  - contexto do problema;
  - solução implementada;
  - riscos/limitações;
  - evidências de validação (`lint`, `build`, prints/gifs quando útil).

## Diretrizes técnicas para este projeto

- Não misturar lógica de integração/dados com componentes puramente visuais.
- Manter a comunicação com o motor de render centralizada por mensagens no worker.
- Evitar dependências desnecessárias.
- Priorizar acessibilidade, semântica e responsividade na UI.

## Reporte de bugs

Ao abrir issue, inclua:

- comportamento atual;
- comportamento esperado;
- passos para reproduzir;
- ambiente (SO, navegador, versão do Node);
- logs/prints relevantes.

## Segurança

Para vulnerabilidades, consulte [SECURITY.md](SECURITY.md) e evite exposição pública inicial.
