# Matriz de Rastreabilidade — Sprint 5

O Sprint 5 incidiu sobre a criação de **testes White-Box** para a funcionalidade de **criação de planos de cultivo**, materializada na função `validatePlan()` do ficheiro `src/services/planService.js`.

Os testes foram implementados com **Jest** no ficheiro `tests/planWhiteBox.test.js`, exercitando directamente o serviço sem dependência de base de dados, servidor HTTP ou ficheiros externos. A análise mapeia cada caso de teste a uma estrutura de controlo `if`/`else if` específica e à(s) condição(ões) atómica(s) por ela cobertas.

A função `validatePlan()` contém **16 estruturas `if`/`else if` explícitas** + **1 decisão implícita** no `return`. **Não contém ciclos `while` ou `for`** no código produtivo, pelo que a cobertura de ciclos é Não-Aplicável e está aqui assinalada como tal.

---

## Defects / Observações descobertas durante o Sprint 5

| ID | Descrição | Ficheiro | Gravidade | Estado |
|---|---|---|---|---|
| OBS-WB-01 | Em IF-01 (`!plan.type \|\| !VALID_PLAN_TYPES.includes(plan.type)`), a combinação (C1=T, C2=F) é logicamente infeasible: todo valor falsy de `plan.type` está automaticamente excluído da enumeração de tipos válidos, pelo que C1 mascara C2. Sugere-se simplificar para `!VALID_PLAN_TYPES.includes(plan.type)`. | `src/services/planService.js` | Baixa (code smell) | Aberto |
| OBS-WB-02 | IF-16 utiliza `plan.authorizedByResponsible !== true` (igualdade estrita ao literal booleano). Valores como `"true"` (string), `1` ou outros truthy são tratados como "não autorizado". Comportamento defensivo correcto mas não documentado: clientes HTTP que enviem `"true"` em JSON falham silenciosamente. | `src/services/planService.js` (linha 64) | Média | Aberto |
| OBS-WB-03 | `validatePlan` não tem early-return: detectado um erro continua a validar todos os outros campos, acumulando erros num único `errors[]`. Comportamento adequado para reportar tudo de uma vez, mas pode gerar mensagens redundantes (ex.: `min > max` quando `min` está fora do intervalo). Demonstrado em TU-WB-50 (8 erros simultâneos). | `src/services/planService.js` | Baixa (decisão de design) | Documentado |

---

## 1. Matriz de Rastreabilidade — IF-01: Validação do tipo de plano

| ID        | Requisito / Regra                                            | Componente / Estrutura                | Nível   | Técnica | Resultado Esperado                         | Pré-condições                           |
|-----------|--------------------------------------------------------------|---------------------------------------|---------|---------|--------------------------------------------|-----------------------------------------|
| TU-WB-01  | RN-PLAN-WB-01: tipo definido e válido não dispara erro       | `validatePlan()` — IF-01 (C1=F, C2=F) | Unidade | MCC     | Sem `"Tipo de plano inválido"` em `errors` | `type:"regular"`, restante plano válido |
| TU-WB-02  | RN-PLAN-WB-01: tipo definido fora da enumeração dispara erro | `validatePlan()` — IF-01 (C1=F, C2=T) | Unidade | MCC     | `errors` contém `"Tipo de plano inválido"` | `type:"experimental"`                   |
| TU-WB-03  | RN-PLAN-WB-01: tipo omisso dispara erro (curto-circuito C1)  | `validatePlan()` — IF-01 (C1=T)       | Unidade | MCC     | `errors` contém `"Tipo de plano inválido"` | `type` omisso                           |
| TU-WB-03b | RN-PLAN-WB-01: tipo como string vazia (falsy) dispara erro   | `validatePlan()` — IF-01 (C1=T)       | Unidade | MCC     | `errors` contém `"Tipo de plano inválido"` | `type:""`                               |

### Tabela de Verdade MCC — IF-01 (OR de 2 condições)

| Caso | C1: `!plan.type` | C2: `!VALID_PLAN_TYPES.includes(plan.type)` | Resultado | Caso de teste |
|---|---|---|---|---|
| 1 | F | F | F | TU-WB-01 |
| 2 | F | T | T | TU-WB-02 |
| 3 | T | T | T | TU-WB-03, TU-WB-03b |
| 4 | T | F | — | **Infeasible** (C1=T ⇒ C2=T por subconjunto) |

---

## 2. Matriz de Rastreabilidade — IF-02 a IF-05: Validação de temperatura

| ID       | Requisito / Regra                                    | Componente / Estrutura                | Nível   | Técnica  | Resultado Esperado                                                    | Pré-condições                                 |
|----------|------------------------------------------------------|---------------------------------------|---------|----------|-----------------------------------------------------------------------|-----------------------------------------------|
| TU-WB-04 | RF-PLAN-03: temperatura presente entra no bloco else | `validatePlan()` — IF-02 (C1=F, C2=F) | Unidade | MCC      | Sem `"Temperatura obrigatória"`; avalia IF-03/04/05                   | `minTemperature` e `maxTemperature` definidas |
| TU-WB-05 | RF-PLAN-03: max omissa dispara erro                  | `validatePlan()` — IF-02 (C1=F, C2=T) | Unidade | MCC      | `errors` contém `"Temperatura obrigatória"`                           | `maxTemperature` omisso                       |
| TU-WB-06 | RF-PLAN-03: min omissa dispara erro                  | `validatePlan()` — IF-02 (C1=T, C2=F) | Unidade | MCC      | `errors` contém `"Temperatura obrigatória"`                           | `minTemperature` omisso                       |
| TU-WB-07 | RF-PLAN-03: ambas omissas dispara erro               | `validatePlan()` — IF-02 (C1=T, C2=T) | Unidade | MCC      | `errors` contém `"Temperatura obrigatória"`                           | `min` e `maxTemperature` omissos              |
| TU-WB-08 | RN-PLAN-01: minTemp interior (=23) aceite            | `validatePlan()` — IF-03 (C1=F, C2=F) | Unidade | MCC + VL | Sem `"Temperatura mínima fora..."`                                    | `minTemperature:23`                           |
| TU-WB-09 | RN-PLAN-01: minTemp=17 abaixo do limite              | `validatePlan()` — IF-03 (C1=T, C2=F) | Unidade | MCC + VL | `errors` contém `"Temperatura mínima fora do intervalo permitido"`    | `minTemperature:17`                           |
| TU-WB-10 | RN-PLAN-01: minTemp=29 acima do limite               | `validatePlan()` — IF-03 (C1=F, C2=T) | Unidade | MCC + VL | `errors` contém `"Temperatura mínima fora do intervalo permitido"`    | `minTemperature:29`                           |
| TU-WB-11 | RN-PLAN-08: maxTemp interior (=23) aceite            | `validatePlan()` — IF-04 (C1=F, C2=F) | Unidade | MCC + VL | Sem `"Temperatura máxima fora..."`                                    | `maxTemperature:23`                           |
| TU-WB-12 | RN-PLAN-08: maxTemp=17 abaixo do limite              | `validatePlan()` — IF-04 (C1=T, C2=F) | Unidade | MCC + VL | `errors` contém `"Temperatura máxima fora do intervalo permitido"`    | `maxTemperature:17`                           |
| TU-WB-13 | RN-PLAN-08: maxTemp=29 acima do limite               | `validatePlan()` — IF-04 (C1=F, C2=T) | Unidade | MCC + VL | `errors` contém `"Temperatura máxima fora do intervalo permitido"`    | `maxTemperature:29`                           |
| TU-WB-14 | RN-PLAN-07: min ≤ max é coerente                     | `validatePlan()` — IF-05 (F)          | Unidade | Branch   | Sem `"Temperatura mínima não pode ser superior à máxima"`             | `min=18, max=28`                              |
| TU-WB-15 | RN-PLAN-07: min > max é incoerente                   | `validatePlan()` — IF-05 (T)          | Unidade | Branch   | `errors` contém `"Temperatura mínima não pode ser superior à máxima"` | `min=28, max=18`                              |

### Tabela de Verdade MCC — IF-02 (OR, 4 combinações exequíveis)

| Caso | C1: `min===undefined` | C2: `max===undefined` | Resultado | Caso de teste |
|---|---|---|---|---|
| 1 | F | F | F | TU-WB-04 |
| 2 | F | T | T | TU-WB-05 |
| 3 | T | F | T | TU-WB-06 |
| 4 | T | T | T | TU-WB-07 |

### Tabela de Verdade — IF-03 / IF-04 (OR de 2 ranges, T/T infeasible)

| Caso | C1: `< limMin` | C2: `> limMax` | Resultado | IF-03 (minTemp) | IF-04 (maxTemp) |
|---|---|---|---|---|---|
| 1 | F | F | F | TU-WB-08 | TU-WB-11 |
| 2 | T | F | T | TU-WB-09 | TU-WB-12 |
| 3 | F | T | T | TU-WB-10 | TU-WB-13 |
| 4 | T | T | — | **Infeasible** (n. não pode ser `<a` E `>b` com a<b) | — |

---

## 3. Matriz de Rastreabilidade — IF-06 a IF-09: Validação de humidade

| ID       | Requisito / Regra                           | Componente / Estrutura                | Nível   | Técnica  | Resultado Esperado                                                 | Pré-condições                           |
|----------|---------------------------------------------|---------------------------------------|---------|----------|--------------------------------------------------------------------|-----------------------------------------|
| TU-WB-16 | RF-PLAN-04: humidade presente entra no else | `validatePlan()` — IF-06 (C1=F, C2=F) | Unidade | MCC      | Sem `"Humidade obrigatória"`                                       | `minHumidity` e `maxHumidity` definidas |
| TU-WB-17 | RF-PLAN-04: maxHumidity omissa dispara erro | `validatePlan()` — IF-06 (C1=F, C2=T) | Unidade | MCC      | `errors` contém `"Humidade obrigatória"`                           | `maxHumidity` omisso                    |
| TU-WB-18 | RF-PLAN-04: minHumidity omissa dispara erro | `validatePlan()` — IF-06 (C1=T, C2=F) | Unidade | MCC      | `errors` contém `"Humidade obrigatória"`                           | `minHumidity` omisso                    |
| TU-WB-19 | RF-PLAN-04: ambas omissas dispara erro      | `validatePlan()` — IF-06 (C1=T, C2=T) | Unidade | MCC      | `errors` contém `"Humidade obrigatória"`                           | ambas omissas                           |
| TU-WB-20 | RN-PLAN-02: minHum interior (=60) aceite    | `validatePlan()` — IF-07 (C1=F, C2=F) | Unidade | MCC + VL | Sem `"Humidade mínima fora..."`                                    | `minHumidity:60`                        |
| TU-WB-21 | RN-PLAN-02: minHum=39 abaixo do limite      | `validatePlan()` — IF-07 (C1=T, C2=F) | Unidade | MCC + VL | `errors` contém `"Humidade mínima fora do intervalo permitido"`    | `minHumidity:39`                        |
| TU-WB-22 | RN-PLAN-02: minHum=81 acima do limite       | `validatePlan()` — IF-07 (C1=F, C2=T) | Unidade | MCC + VL | `errors` contém `"Humidade mínima fora do intervalo permitido"`    | `minHumidity:81`                        |
| TU-WB-23 | RN-PLAN-09: maxHum interior (=60) aceite    | `validatePlan()` — IF-08 (C1=F, C2=F) | Unidade | MCC + VL | Sem `"Humidade máxima fora..."`                                    | `maxHumidity:60`                        |
| TU-WB-24 | RN-PLAN-09: maxHum=39 abaixo do limite      | `validatePlan()` — IF-08 (C1=T, C2=F) | Unidade | MCC + VL | `errors` contém `"Humidade máxima fora do intervalo permitido"`    | `maxHumidity:39`                        |
| TU-WB-25 | RN-PLAN-09: maxHum=81 acima do limite       | `validatePlan()` — IF-08 (C1=F, C2=T) | Unidade | MCC + VL | `errors` contém `"Humidade máxima fora do intervalo permitido"`    | `maxHumidity:81`                        |
| TU-WB-26 | RN-PLAN-11: min ≤ max é coerente            | `validatePlan()` — IF-09 (F)          | Unidade | Branch   | Sem `"Humidade mínima não pode ser superior à máxima"`             | `min=40, max=80`                        |
| TU-WB-27 | RN-PLAN-11: min > max é incoerente          | `validatePlan()` — IF-09 (T)          | Unidade | Branch   | `errors` contém `"Humidade mínima não pode ser superior à máxima"` | `min=80, max=40`                        |

> IF-06 segue o padrão de IF-02 (4 combinações exequíveis). IF-07 e IF-08 seguem o padrão de IF-03/IF-04 (T/T infeasible).

---

## 4. Matriz de Rastreabilidade — IF-10 a IF-13: Validação de luminosidade

| ID       | Requisito / Regra                               | Componente / Estrutura                | Nível   | Técnica  | Resultado Esperado                                                     | Pré-condições                     |
|----------|-------------------------------------------------|---------------------------------------|---------|----------|------------------------------------------------------------------------|-----------------------------------|
| TU-WB-28 | RF-PLAN-05: luminosidade presente entra no else | `validatePlan()` — IF-10 (C1=F, C2=F) | Unidade | MCC      | Sem `"Luminosidade obrigatória"`                                       | `minLight` e `maxLight` definidas |
| TU-WB-29 | RF-PLAN-05: maxLight omissa dispara erro        | `validatePlan()` — IF-10 (C1=F, C2=T) | Unidade | MCC      | `errors` contém `"Luminosidade obrigatória"`                           | `maxLight` omisso                 |
| TU-WB-30 | RF-PLAN-05: minLight omissa dispara erro        | `validatePlan()` — IF-10 (C1=T, C2=F) | Unidade | MCC      | `errors` contém `"Luminosidade obrigatória"`                           | `minLight` omisso                 |
| TU-WB-31 | RF-PLAN-05: ambas omissas dispara erro          | `validatePlan()` — IF-10 (C1=T, C2=T) | Unidade | MCC      | `errors` contém `"Luminosidade obrigatória"`                           | ambas omissas                     |
| TU-WB-32 | RN-PLAN-03: minLight interior (=15000) aceite   | `validatePlan()` — IF-11 (C1=F, C2=F) | Unidade | MCC + VL | Sem `"Luminosidade mínima fora..."`                                    | `minLight:15000`                  |
| TU-WB-33 | RN-PLAN-03: minLight=4999 abaixo do limite      | `validatePlan()` — IF-11 (C1=T, C2=F) | Unidade | MCC + VL | `errors` contém `"Luminosidade mínima fora do intervalo permitido"`    | `minLight:4999`                   |
| TU-WB-34 | RN-PLAN-03: minLight=25001 acima do limite      | `validatePlan()` — IF-11 (C1=F, C2=T) | Unidade | MCC + VL | `errors` contém `"Luminosidade mínima fora do intervalo permitido"`    | `minLight:25001`                  |
| TU-WB-35 | RN-PLAN-10: maxLight interior (=15000) aceite   | `validatePlan()` — IF-12 (C1=F, C2=F) | Unidade | MCC + VL | Sem `"Luminosidade máxima fora..."`                                    | `maxLight:15000`                  |
| TU-WB-36 | RN-PLAN-10: maxLight=4999 abaixo do limite      | `validatePlan()` — IF-12 (C1=T, C2=F) | Unidade | MCC + VL | `errors` contém `"Luminosidade máxima fora do intervalo permitido"`    | `maxLight:4999`                   |
| TU-WB-37 | RN-PLAN-10: maxLight=25001 acima do limite      | `validatePlan()` — IF-12 (C1=F, C2=T) | Unidade | MCC + VL | `errors` contém `"Luminosidade máxima fora do intervalo permitido"`    | `maxLight:25001`                  |
| TU-WB-38 | RN-PLAN-12: min ≤ max é coerente                | `validatePlan()` — IF-13 (F)          | Unidade | Branch   | Sem `"Luminosidade mínima não pode ser superior à máxima"`             | `min=5000, max=25000`             |
| TU-WB-39 | RN-PLAN-12: min > max é incoerente              | `validatePlan()` — IF-13 (T)          | Unidade | Branch   | `errors` contém `"Luminosidade mínima não pode ser superior à máxima"` | `min=25000, max=5000`             |

---

## 5. Matriz de Rastreabilidade — IF-14 e IF-15: Duração do plano (if / else if)

| ID       | Requisito / Regra                                           | Componente / Estrutura                            | Nível   | Técnica         | Resultado Esperado                                                | Pré-condições         |
|----------|-------------------------------------------------------------|---------------------------------------------------|---------|-----------------|-------------------------------------------------------------------|-----------------------|
| TU-WB-40 | RF-PLAN-06: duração omissa dispara erro; IF-15 não avaliado | `validatePlan()` — IF-14 (T)                      | Unidade | Branch + cadeia | `errors` contém `"Duração obrigatória"` e NÃO `"Duração fora..."` | `durationDays` omisso |
| TU-WB-41 | RN-PLAN-04: duração nominal (=90) é coerente                | `validatePlan()` — IF-14 (F) / IF-15 (C1=F, C2=F) | Unidade | Branch + MCC    | Sem erros de duração                                              | `durationDays:90`     |
| TU-WB-42 | RN-PLAN-04: durationDays=0 abaixo do limite                 | `validatePlan()` — IF-15 (C1=T, C2=F)             | Unidade | MCC + VL        | `errors` contém `"Duração fora do intervalo permitido"`           | `durationDays:0`      |
| TU-WB-43 | RN-PLAN-04: durationDays=366 acima do limite                | `validatePlan()` — IF-15 (C1=F, C2=T)             | Unidade | MCC + VL        | `errors` contém `"Duração fora do intervalo permitido"`           | `durationDays:366`    |

### Tabela de Verdade — Cadeia IF-14 / IF-15

| Cenário           | IF-14 (`undefined`) | IF-15 C1 (`<1`) | IF-15 C2 (`>365`) | Caminho exercitado                  | Caso de teste  |
|-------------------|---------------------|-----------------|-------------------|-------------------------------------|----------------|
| Omissa            | T                   | (não avaliada)  | (não avaliada)    | IF-14 ramo true                     | TU-WB-40       |
| Nominal (90)      | F                   | F               | F                 | IF-14 ramo false → IF-15 ramo false | TU-WB-41       |
| Abaixo (0)        | F                   | T               | F                 | IF-14 ramo false → IF-15 ramo true  | TU-WB-42       |
| Acima (366)       | F                   | F               | T                 | IF-14 ramo false → IF-15 ramo true  | TU-WB-43       |
| Ambas (<1 E >365) | F                   | T               | T                 | —                                   | **Infeasible** |

---

## 6. Matriz de Rastreabilidade — IF-16: Plano pontual exige autorização (decisão AND)

| ID        | Requisito / Regra                                                        | Componente / Estrutura                | Nível   | Técnica         | Resultado Esperado                                                         | Pré-condições                                    |
|-----------|--------------------------------------------------------------------------|---------------------------------------|---------|-----------------|----------------------------------------------------------------------------|--------------------------------------------------|
| TU-WB-44  | RN-PLAN-05/06: regular + autorizado é aceite                             | `validatePlan()` — IF-16 (C1=F, C2=F) | Unidade | **MCC + MC/DC** | Sem `"Plano pontual exige autorização..."`                                 | `type:"regular", authorizedByResponsible:true`   |
| TU-WB-45  | RN-PLAN-05/06: regular + não-autorizado é aceite (C1 curto-circuita AND) | `validatePlan()` — IF-16 (C1=F, C2=T) | Unidade | **MCC + MC/DC** | Sem `"Plano pontual exige autorização..."`                                 | `type:"regular", authorizedByResponsible:false`  |
| TU-WB-46  | RN-PLAN-06: pontual + autorizado é aceite                                | `validatePlan()` — IF-16 (C1=T, C2=F) | Unidade | **MCC + MC/DC** | `valid:true`; sem erros                                                    | `type:"pontual", authorizedByResponsible:true`   |
| TU-WB-47  | RN-PLAN-05: pontual + não-autorizado é rejeitado                         | `validatePlan()` — IF-16 (C1=T, C2=T) | Unidade | **MCC + MC/DC** | `errors` contém `"Plano pontual exige autorização do Responsável Técnico"` | `type:"pontual", authorizedByResponsible:false`  |
| TU-WB-47b | RN-PLAN-05: pontual + autorização omissa equivale a não-autorizado       | `validatePlan()` — IF-16 (C1=T, C2=T) | Unidade | MCC             | `errors` contém `"Plano pontual exige autorização do Responsável Técnico"` | `type:"pontual", authorizedByResponsible` omisso |

### Tabela de Verdade MCC — IF-16 (AND, 4 combinações exequíveis) ⭐

| Caso | C1: `type === 'pontual'` | C2: `authorizedByResponsible !== true` | Resultado | Caso de teste |
|---|---|---|---|---|
| 1 | F | F | F | TU-WB-44 |
| 2 | F | T | F | TU-WB-45 |
| 3 | T | F | F | TU-WB-46 |
| 4 | T | T | T | TU-WB-47, TU-WB-47b |

**Análise MC/DC para IF-16:**
- Par **{TU-WB-46, TU-WB-47}** isola **C2** (com C1=T fixo, alteração de C2 altera o resultado: F→T).
- Par **{TU-WB-45, TU-WB-47}** isola **C1** (com C2=T fixo, alteração de C1 altera o resultado: F→T).
- Conjunto mínimo MC/DC: **{TU-WB-45, TU-WB-46, TU-WB-47}** (N+1 = 3 casos para uma decisão de 2 condições). ✅

---

## 7. Matriz de Rastreabilidade — D-RET: Decisão implícita do `return`

| ID       | Requisito / Regra                                           | Componente / Estrutura                    | Nível   | Técnica                           | Resultado Esperado                                     | Pré-condições                                                                    |
|----------|-------------------------------------------------------------|-------------------------------------------|---------|-----------------------------------|--------------------------------------------------------|----------------------------------------------------------------------------------|
| TU-WB-48 | RF-PLAN-VAL: plano sem erros retorna `valid:true`           | `validatePlan()` — D-RET (T)              | Unidade | Branch                            | `valid:true`, `errors.length===0`                      | Plano base completo e válido                                                     |
| TU-WB-49 | RF-PLAN-VAL: plano com erros retorna `valid:false`          | `validatePlan()` — D-RET (F)              | Unidade | Branch                            | `valid:false`, `errors.length > 0`                     | `type:"experimental"`                                                            |
| TU-WB-50 | OBS-WB-03: ausência de early-return acumula múltiplos erros | `validatePlan()` — todos os `errors.push` | Unidade | Branch + ausência de early-return | `valid:false` e todos os 8 erros presentes em `errors` | Plano com violação em todos os campos (tipo, temp, hum, light, dur, autorização) |

---

## 8. Cobertura Bidirecional — Requisito / Estrutura → Casos de Teste

| Requisito / Regra / Estrutura                          | Casos de Teste                          |
|--------------------------------------------------------|-----------------------------------------|
| RN-PLAN-WB-01: validação do tipo (IF-01)               | TU-WB-01, TU-WB-02, TU-WB-03, TU-WB-03b |
| RF-PLAN-03: temperatura obrigatória (IF-02)            | TU-WB-04 … TU-WB-07                     |
| RN-PLAN-01: range temperatura mínima (IF-03)           | TU-WB-08, TU-WB-09, TU-WB-10            |
| RN-PLAN-08: range temperatura máxima (IF-04)           | TU-WB-11, TU-WB-12, TU-WB-13            |
| RN-PLAN-07: coerência min ≤ max temperatura (IF-05)    | TU-WB-14, TU-WB-15                      |
| RF-PLAN-04: humidade obrigatória (IF-06)               | TU-WB-16 … TU-WB-19                     |
| RN-PLAN-02: range humidade mínima (IF-07)              | TU-WB-20, TU-WB-21, TU-WB-22            |
| RN-PLAN-09: range humidade máxima (IF-08)              | TU-WB-23, TU-WB-24, TU-WB-25            |
| RN-PLAN-11: coerência min ≤ max humidade (IF-09)       | TU-WB-26, TU-WB-27                      |
| RF-PLAN-05: luminosidade obrigatória (IF-10)           | TU-WB-28 … TU-WB-31                     |
| RN-PLAN-03: range luminosidade mínima (IF-11)          | TU-WB-32, TU-WB-33, TU-WB-34            |
| RN-PLAN-10: range luminosidade máxima (IF-12)          | TU-WB-35, TU-WB-36, TU-WB-37            |
| RN-PLAN-12: coerência min ≤ max luminosidade (IF-13)   | TU-WB-38, TU-WB-39                      |
| RF-PLAN-06: duração obrigatória (IF-14)                | TU-WB-40, TU-WB-41                      |
| RN-PLAN-04: range duração (IF-15)                      | TU-WB-41, TU-WB-42, TU-WB-43            |
| RN-PLAN-05/06: plano pontual exige autorização (IF-16) | TU-WB-44 … TU-WB-47, TU-WB-47b          |
| RF-PLAN-VAL: decisão de retorno (D-RET)                | TU-WB-48, TU-WB-49, TU-WB-50            |
| Cobertura de ciclos (`while`/`for`)                    | **N/A** — ausentes no código produtivo  |

---

## 9. Resumo da Execução

```
Test Suites: 1 passed, 1 total
Tests:       52 passed, 52 total
Snapshots:   0 total
Tempo total: ~0.65 s

Coverage de planService.js (white-box only):
----------------|---------|----------|---------|---------|
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
planService.js  |   100   |    100   |   100   |   100   |
----------------|---------|----------|---------|---------|
```

### Distribuição por técnica

| Técnica                                          | Nº de casos |
|--------------------------------------------------|-------------|
| Cobertura de Ramos (Branch) — exclusiva          | 10          |
| Cobertura de Condições Múltiplas (MCC)           | 22          |
| MCC combinada com Análise de Valores Limite (VL) | 18          |
| MC/DC plena (subconjunto de IF-16)               | 3           |
| Branch + ausência de early-return (D-RET)        | 3           |
| **Total Sprint 5**                               | **52**      |

### Distribuição acumulada por nível

| Nível      | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Total    |
|------------|----------|----------|----------|----------|----------|----------|
| Unidade    | 15       | 31       | ~50 est. | 0        | **52**   | **~148** |
| Integração | 0        | 0        | 0        | 74       | 0        | 74       |
| Sistema    | 0        | 0        | 0        | 0        | 0        | 0        |
