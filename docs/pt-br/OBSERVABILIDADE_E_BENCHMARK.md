# Observabilidade e Benchmark

## Escopo Atual

O ORBIT não possui endpoint de métricas nem backend. A observabilidade atual é **client-side**, focada em renderização e experiência visual.

## Sinais de Performance Existentes

No worker (`orbitEngine.worker.ts`), a estratégia adaptativa usa:

- `TARGET_FPS = 60`
- `TARGET_FRAME_MS = 16.67ms`
- EWMA de frame time (`EWMA_ALPHA = 0.12`)
- ajuste periódico (`PERF_ADJUST_INTERVAL = 20` frames)

Parâmetros ajustáveis automaticamente:

- `renderScale` (`0.5` a `1.0`)
- `autoQuality` (`0.2` a `1.0`)

## Telemetria de Simulação na UI

A UI exibe métricas derivadas em `OrbitTelemetryFooter`:

- `Event Horizon (r+)`
- `Ergosphere (Eq)`
- `Horizon Ang. Velocity`

Cálculo centralizado em:

- `src/features/orbit-engine/utils/orbitTelemetry.ts`

## Benchmark Manual Recomendado

Como baseline de validação, executar teste manual com:

1. `npm run dev`
2. Abrir `http://localhost:3000`
3. Ativar Performance Profiler do navegador
4. Interagir com drag contínuo por 20-30s
5. Registrar:
- FPS médio
- frame time médio/p95
- uso de CPU/GPU

## Próximos Passos

- expor métricas internas do worker para a UI (FPS, EWMA, renderScale, quality efetiva);
- permitir export simples (JSON/CSV) para comparação entre builds;
- criar protocolo de benchmark reproduzível por hardware/navegador.
