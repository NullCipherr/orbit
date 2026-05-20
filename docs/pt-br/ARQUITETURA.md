# Arquitetura do ORBIT

## Objetivo

Documentar a arquitetura da feature `orbit-engine`, com foco em separação de responsabilidades, previsibilidade de render e facilidade de manutenção.

## Visão de Alto Nível

A aplicação é dividida em duas camadas principais:

- **Camada de UI (React)**: estado da interface, interação de usuário e composição visual.
- **Camada de Render (Web Worker + WebGL2)**: shader, loop de render e ajuste adaptativo de desempenho.

Essa divisão reduz contenção na main thread e mantém a UI responsiva durante interação intensa.

## Fluxo Principal

1. `src/features/orbit-engine/OrbitEngine.tsx` monta header, viewport, painel de controle e telemetria.
2. `useOrbitEngineController` inicializa o canvas, cria o worker e controla mensagens.
3. O canvas é transferido para `OffscreenCanvas` e enviado ao worker (`INIT`).
4. O worker configura WebGL2, compila shaders e inicia o loop de render.
5. Interações de mouse atualizam câmera e parâmetros via mensagens (`UPDATE_CAMERA`, `UPDATE_PARAMS`).
6. Rodapé calcula e exibe telemetria derivada de massa/spin na camada React.

## Organização por Feature

Diretório principal: `src/features/orbit-engine/`

- `components/`: componentes visuais puros.
- `hooks/`: orquestração de estado e integração com worker.
- `workers/`: execução da simulação e renderização.
- `utils/`: cálculos derivados e formatação.
- `types/`: contratos de tipos compartilhados.
- `constants/`: limites, defaults e parâmetros de interação.

## Responsabilidades por Módulo

- `OrbitEngine.tsx`: composição da tela da feature.
- `useOrbitEngineController.ts`: ciclo de vida do worker, eventos de pointer e sincronização de estado.
- `orbitEngine.worker.ts`: pipeline WebGL2, uniforms, raymarching e controle adaptativo de qualidade.
- `orbitTelemetry.ts`: cálculo de métricas físicas aproximadas para exibição.

## Decisões Arquiteturais

- **Worker obrigatório para render**: evita bloquear input/layout/pintura da UI.
- **Controle adaptativo no worker**: decisões de performance próximas ao loop de render.
- **Componentes de apresentação desacoplados**: facilita manutenção, testes e evolução de layout.

## Limitações Atuais

- Não existe fallback completo para ambientes sem `OffscreenCanvas`/`WebGL2`.
- Não há persistência de presets de simulação.
- Não há backend; toda a telemetria é calculada localmente.
