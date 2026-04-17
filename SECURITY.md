# Política de Segurança

## Versões suportadas

Como base inicial, consideramos suportada a branch principal (`main`) e a release mais recente.

## Reporte responsável

Se você identificar uma vulnerabilidade:

1. **Não** publique detalhes exploráveis em issue pública.
2. Descreva o problema com:
   - vetor de ataque;
   - impacto;
   - prova de conceito mínima;
   - sugestão de mitigação (se houver).
3. Envie o reporte por canal privado com o mantenedor do repositório.

Se não houver canal privado configurado no momento, abra uma issue com o título `Security: private report requested` sem detalhes técnicos sensíveis.

## Escopo de segurança relevante neste projeto

- Exposição de segredos no front-end.
- Injeção de conteúdo indevido em renderização/entrada do usuário.
- Dependências com vulnerabilidades críticas.
- Quebras que permitam indisponibilidade do app.

## Boas práticas adotadas

- Variáveis sensíveis fora do código-fonte.
- Separação entre UI e motor de render em worker.
- Revisão de dependências antes de releases.

## SLA inicial

- Confirmação de recebimento: até 72 horas.
- Avaliação inicial: até 7 dias corridos.
- Plano de correção: conforme severidade e impacto.
