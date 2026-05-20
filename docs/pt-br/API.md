# API Interna (UI <-> Worker)

## Escopo

O ORBIT não expõe API HTTP. Este documento cobre a **API interna de mensagens** entre React (main thread) e `orbitEngine.worker.ts`.

## Canal de Comunicação

- Mecanismo: `Worker.postMessage`.
- Origem principal: `src/features/orbit-engine/hooks/useOrbitEngineController.ts`.
- Destino: `src/features/orbit-engine/workers/orbitEngine.worker.ts`.

## Mensagens Enviadas para o Worker

### `INIT`

Inicializa worker e contexto de render.

Payload:

- `canvas`: `OffscreenCanvas`
- `width`: `number`
- `height`: `number`

### `UPDATE_PARAMS`

Atualiza parâmetros da simulação.

Payload:

- `mass`: `number` (faixa recomendada `0.1` a `3.0`)
- `spin`: `number` (faixa recomendada `-1.0` a `1.0`)

### `UPDATE_CAMERA`

Atualiza orientação da câmera orbital.

Payload:

- `yaw`: `number`
- `pitch`: `number`

### `UPDATE_QUALITY`

Define qualidade por interação de usuário.

Payload:

- `number` entre `0.0` e `1.0`

### `RESIZE`

Atualiza dimensões base para render.

Payload:

- `width`: `number`
- `height`: `number`

### `STOP`

Solicita encerramento do loop de render antes do `terminate()` do worker.

Payload:

- sem payload.

## Contratos de Dados da UI

Tipos em `src/features/orbit-engine/types/orbitEngine.types.ts`:

- `EngineParams`
- `EngineCamera`
- `TelemetryMetrics`
- `OrbitViewportBindings`

## Boas Práticas de Evolução

- Versionar mensagens novas com cuidado para evitar quebra de compatibilidade.
- Manter validação mínima de payload no worker para evitar estados inválidos.
- Centralizar novas mensagens no hook controlador antes de espalhar chamadas pela UI.
