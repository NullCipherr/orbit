<div align="center">
  <img src="docs/assets/orbit-logo.png" alt="Logo do ORBIT" width="220" />
  <h1>ORBIT</h1>
  <p><i>Simulação interativa de buraco negro com renderização em tempo real via WebGL2 + Web Worker</i></p>

  <p>
    <img src="https://img.shields.io/badge/React-19-149ECA?style=flat-square&logo=react&logoColor=white" alt="React 19" />
    <img src="https://img.shields.io/badge/Vite-6-6E36F6?style=flat-square&logo=vite&logoColor=white" alt="Vite 6" />
    <img src="https://img.shields.io/badge/WebGL2-GPU-1E88E5?style=flat-square" alt="WebGL2" />
    <img src="https://img.shields.io/badge/Performance-60FPS%20Target-2E7D32?style=flat-square" alt="Meta de 60 FPS" />
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-111111?style=flat-square" alt="Licença MIT" /></a>
  </p>
</div>

---

## Documentação

Documentação técnica organizada em módulos:

- [Índice da Documentação](docs/README.md)
- [Arquitetura](docs/pt-br/ARQUITETURA.md)
- [API Interna (UI <-> Worker)](docs/pt-br/API.md)
- [Operação, Deploy e Manutenção](docs/pt-br/OPERACAO_DEPLOY_MANUTENCAO.md)
- [Observabilidade e Benchmark](docs/pt-br/OBSERVABILIDADE_E_BENCHMARK.md)
- [Testes Automatizados](docs/pt-br/TESTES_AUTOMATIZADOS.md)
- [Métricas e Automação Shell](docs/pt-br/METRICAS_AUTOMACAO_SHELL.md)
- [Roadmap Técnico](docs/pt-br/ROADMAP.md)

Documentos institucionais:

- [Contribuição](CONTRIBUTING.md)
- [Código de Conduta](CODE_OF_CONDUCT.md)
- [Segurança](SECURITY.md)
- [Suporte](SUPPORT.md)
- [Histórico de Mudanças](CHANGELOG.md)
- [Licença](LICENSE)

---

## Preview

Interface principal servida pela aplicação React:

- Entrada: `src/main.tsx`
- Tela principal: `src/features/orbit-engine/OrbitEngine.tsx`
- Acesso local: `http://localhost:3000`

---

## Visão Geral

O **ORBIT** é uma aplicação front-end para visualização de um buraco negro com foco em previsibilidade de performance, desacoplamento de renderização e evolução incremental.

O projeto prioriza:

- pipeline de render em GPU com `WebGL2`;
- simulação isolada em `Web Worker` com `OffscreenCanvas`;
- controles interativos de parâmetros físicos/visuais;
- telemetria derivada em tempo real;
- adaptação automática de qualidade para perseguir fluidez visual.

---

## Funcionalidades

- **Renderização com WebGL2** em fragment shader para simulação visual em tempo real.
- **Worker dedicado** para evitar bloqueio da main thread do React.
- **Controle orbital por ponteiro** para inspeção dinâmica da cena.
- **Ajuste adaptativo de performance** com base em frame time suavizado (EWMA).
- **Escala de render dinâmica** (`renderScale`) para equilibrar fidelidade e FPS.
- **Painel de telemetria** com indicadores de horizonte de eventos, ergosfera e velocidade angular aproximada.
- **Arquitetura por feature** com separação clara entre componentes de UI, hooks, tipos, utilitários e worker.

---

## Arquitetura

Fluxo principal da aplicação:

1. `OrbitEngine.tsx` compõe o layout da feature e os blocos visuais da página.
2. `useOrbitEngineController.ts` centraliza estado, eventos de interação e mensageria com o worker.
3. `orbitEngine.worker.ts` executa shaders, loop de render e políticas de ajuste adaptativo.
4. Componentes em `components/*` permanecem focados em apresentação e interação.
5. `orbitTelemetry.ts` concentra cálculos derivados exibidos no rodapé de telemetria.

---

## Performance

Estratégia atual de desempenho:

- meta nominal de `60 FPS` (`16.67ms` por frame);
- monitoramento contínuo de frame time com EWMA;
- reajuste periódico de parâmetros de render:
  - `renderScale` entre `0.5` e `1.0`;
  - `quality` entre `0.2` e `1.0`.

Observação:

- estabilidade de FPS em WebGL depende de GPU, navegador, resolução e carga do sistema;
- o ORBIT aplica controle adaptativo para manter a experiência fluida no maior intervalo possível de hardware.

---

## Decisões Técnicas

- **Desacoplamento de UI e render**: React cuida da interface enquanto o worker processa a simulação.
- **Escalabilidade de código**: organização por feature com responsabilidades explícitas.
- **Evolução orientada por telemetria**: métricas visuais e de frame time guiam ajustes de qualidade.
- **Simplicidade intencional**: foco no núcleo da experiência, sem dependências desnecessárias.

---

## Stack Técnica

- **Framework**: React 19
- **Linguagem**: TypeScript
- **Build Tool**: Vite 6
- **Estilo**: Tailwind CSS 4
- **Renderização**: WebGL2
- **Concorrência**: Web Worker + OffscreenCanvas

---

## Estrutura do Projeto

```text
.
├── docs/
│   ├── assets/
│   │   └── orbit-logo.png
│   ├── pt-br/
│   │   └── API.md
│   │   └── ARQUITETURA.md
│   │   └── METRICAS_AUTOMACAO_SHELL.md
│   │   └── OBSERVABILIDADE_E_BENCHMARK.md
│   │   └── OPERACAO_DEPLOY_MANUTENCAO.md
│   │   └── ROADMAP.md
│   │   └── TESTES_AUTOMATIZADOS.md
│   └── README.md
├── src/
│   ├── features/
│   │   └── orbit-engine/
│   │       ├── components/
│   │       │   ├── OrbitControlPanel.tsx
│   │       │   ├── OrbitEngineHeader.tsx
│   │       │   ├── OrbitRangeControl.tsx
│   │       │   ├── OrbitTelemetryFooter.tsx
│   │       │   └── OrbitViewport.tsx
│   │       ├── constants/
│   │       │   └── orbitEngine.constants.ts
│   │       ├── hooks/
│   │       │   └── useOrbitEngineController.ts
│   │       ├── types/
│   │       │   └── orbitEngine.types.ts
│   │       ├── utils/
│   │       │   └── orbitTelemetry.ts
│   │       ├── workers/
│   │       │   └── orbitEngine.worker.ts
│   │       └── OrbitEngine.tsx
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── CONTRIBUTING.md
├── CODE_OF_CONDUCT.md
├── SECURITY.md
├── SUPPORT.md
├── CHANGELOG.md
└── LICENSE
```

---

## Como Começar

### Pré-requisitos

- Node.js 20+
- npm 10+

### Execução local

```bash
npm install
npm run dev
```

Acesso local padrão:

- `http://localhost:3000`

### Build de produção

```bash
npm run build
npm run preview
```

### Qualidade de código

```bash
npm run lint
```

---

## Scripts Disponíveis

- `npm run dev`: inicia servidor de desenvolvimento na porta `3000`.
- `npm run build`: gera build de produção.
- `npm run preview`: inicia preview do build.
- `npm run clean`: remove artefatos em `dist`.
- `npm run lint`: valida tipagem TypeScript sem emitir arquivos.

---

## CI/CD

O projeto está configurado com GitHub Actions para:

- **CI** em push/PR: instalação, validação de tipos e build.
- **CD** em push na `main`: deploy automático no GitHub Pages.

Workflows:

- `.github/workflows/ci.yml`
- `.github/workflows/deploy-pages.yml`

Configuração manual necessária (uma única vez no repositório):

1. GitHub `Settings` -> `Pages`
2. Em `Build and deployment`, selecionar `Source: GitHub Actions`

---

## Licença

Este projeto é open-source sob a **MIT License**. Consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## Contribuição

Contribuições são bem-vindas. Antes de abrir PR, leia:

- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)

<div align="center">
  Construído para visualização interativa, performance previsível e evolução contínua.
</div>
