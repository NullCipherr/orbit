# Roadmap Técnico

## Objetivo

Evoluir o **Event Horizon Engine** para maior robustez visual, previsibilidade de performance e maturidade de entrega.

## Curto prazo

- Expor métricas de render (FPS médio, frame time EWMA, escala de render ativa) no painel.
- Adicionar fallback visual para navegadores sem `OffscreenCanvas`/`WebGL2`.
- Revisar e limpar dependências não utilizadas no `package.json`.
- Melhorar acessibilidade do painel de controle (labels, foco, teclado).

## Médio prazo

- Presets de qualidade (`Performance`, `Balanced`, `Cinematic`) com override manual.
- Modo de captura de frame/screenshot com parâmetros da simulação.
- Modularização do shader em blocos lógicos para facilitar iteração.
- Estratégia básica de testes automatizados para utilitários e contratos de mensagens do worker.

## Longo prazo

- Explorar backend opcional para cenários e presets persistentes.
- Exportar telemetria da simulação para uso educacional.
- Investigar viabilidade de migração parcial para WebGPU quando a base de suporte for adequada.
