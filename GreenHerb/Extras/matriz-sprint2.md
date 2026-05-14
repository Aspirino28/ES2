# Matriz de Rastreabilidade — Sprint 2

O Sprint 2 incidiu sobre a criação de testes de unidade para duas funcionalidades principais da plataforma GREENHERB:

1. Importação do catálogo de ervas aromáticas;
2. Criação e validação de planos de cultivo.

Os testes foram implementados com Jest e incidem diretamente sobre os serviços `herbImportService.js` e `planService.js`, sem dependência de base de dados, servidor HTTP ou ficheiros externos.

---

## 1. Matriz de Rastreabilidade — Importação de Ervas Aromáticas

| ID | Requisito / Regra | Componente | Técnica | Resultado Esperado | Pré-condições |
|---|---|---|---|---|---|
| TU-16 | RF-HERB-01: validar linha válida do catálogo de ervas | `validateHerbRow()` | Particionamento de Equivalência | Linha aceite, `valid: true` | Objeto de erva completo e válido |
| TU-17 | RF-HERB-02: nome da erva obrigatório | `validateHerbRow()` | Particionamento de Equivalência | Linha rejeitada com “Nome obrigatório” | Objeto de erva com `name` vazio |
| TU-18 | RN-HERB-01: temperatura mínima não pode exceder máxima | `validateHerbRow()` | Particionamento de Equivalência / regra de coerência | Linha rejeitada com erro de temperatura | Objeto com `minTemperature > maxTemperature` |
| TU-19 | RN-HERB-02: humidade deve estar entre 0 e 100 | `validateHerbRow()` | Valores Limite / Particionamento de Equivalência | Linha rejeitada por humidade inválida | Objeto com `minHumidity < 0` e `maxHumidity > 100` |
| TU-20 | RF-HERB-03: importação com linhas válidas, inválidas e parciais | `importHerbs()` | Particionamento de Equivalência | Totais agregados corretos | Array com uma linha válida e duas inválidas |
| TU-21 | RF-HERB-04: rejeição de importação vazia | `importHerbs()` | Particionamento de Equivalência | Erro “Ficheiro vazio ou inválido” | Array vazio |
| TU-22 | RF-HERB-05: nome científico obrigatório | `validateHerbRow()` | Particionamento de Equivalência | Linha rejeitada com “Nome científico obrigatório” | Objeto com `scientificName` vazio |
| TU-23 | RF-HERB-06: temperatura mínima obrigatória | `validateHerbRow()` | Particionamento de Equivalência | Linha rejeitada com “Temperatura mínima inválida” | Objeto sem `minTemperature` |
| TU-24 | RF-HERB-07: temperatura máxima obrigatória | `validateHerbRow()` | Particionamento de Equivalência | Linha rejeitada com “Temperatura máxima inválida” | Objeto sem `maxTemperature` |
| TU-25 | RN-HERB-03: humidade mínima não pode exceder máxima | `validateHerbRow()` | Particionamento de Equivalência / regra de coerência | Linha rejeitada com erro de humidade | Objeto com `minHumidity > maxHumidity` |
| TU-26 | RF-HERB-08: dados de importação devem ser array | `importHerbs()` | Particionamento de Equivalência / Condições Múltiplas | Erro “Ficheiro vazio ou inválido” | Valor `null` passado à função |
| TU-27 | RN-HERB-04: linha inválida só conta como parcial se tiver identificador | `importHerbs()` | Condições Múltiplas | Linha inválida não incrementa `partial` | Linha sem `name` e sem `scientificName` |

---

## 2. Matriz de Rastreabilidade — Planos de Cultivo

| ID | Requisito / Regra | Componente | Técnica | Resultado Esperado | Pré-condições |
|---|---|---|---|---|---|
| TU-28 | RF-PLAN-01: plano regular válido | `validatePlan()` | Particionamento de Equivalência | Plano aceite, `valid: true` | Objeto de plano regular válido |
| TU-29 | RF-PLAN-02: tipo de plano inválido | `validatePlan()` | Particionamento de Equivalência | Plano rejeitado com “Tipo de plano inválido” | Plano com `type: "experimental"` |
| TU-30 | RN-PLAN-01: temperatura deve estar entre 18 e 28 ºC | `validatePlan()` | Valores Limite | 17 e 29 rejeitados; 18, 23 e 28 aceites | Plano regular com temperatura mínima variável |
| TU-31 | RN-PLAN-02: humidade deve estar entre 40 e 80% | `validatePlan()` | Valores Limite | 39 e 81 rejeitados; 40, 60 e 80 aceites | Plano regular com humidade mínima variável |
| TU-32 | RN-PLAN-03: luminosidade deve estar entre 5000 e 25000 lux | `validatePlan()` | Valores Limite | 4999 e 25001 rejeitados; 5000, 15000 e 25000 aceites | Plano regular com luminosidade mínima variável |
| TU-33 | RN-PLAN-04: duração deve estar entre 1 e 365 dias | `validatePlan()` | Valores Limite | 0 e 366 rejeitados; 1, 90 e 365 aceites | Plano regular com duração variável |
| TU-34 | RN-PLAN-05: plano pontual exige autorização | `validatePlan()` | Condições Múltiplas | Plano rejeitado por falta de autorização | Plano pontual com `authorizedByResponsible: false` |
| TU-35 | RN-PLAN-06: plano pontual autorizado pode ser aceite | `validatePlan()` | Condições Múltiplas | Plano aceite quando autorizado e válido | Plano pontual com `authorizedByResponsible: true` |
| TU-36 | RN-PLAN-07: temperatura mínima não pode exceder máxima | `validatePlan()` | Particionamento de Equivalência / regra de coerência | Plano rejeitado por incoerência de temperatura | Plano com `minTemperature > maxTemperature` |
| TU-37 | RF-PLAN-03: temperatura obrigatória | `validatePlan()` | Particionamento de Equivalência | Plano rejeitado com “Temperatura obrigatória” | Plano sem `minTemperature` e `maxTemperature` |
| TU-38 | RF-PLAN-04: humidade obrigatória | `validatePlan()` | Particionamento de Equivalência | Plano rejeitado com “Humidade obrigatória” | Plano sem `minHumidity` e `maxHumidity` |
| TU-39 | RF-PLAN-05: luminosidade obrigatória | `validatePlan()` | Particionamento de Equivalência | Plano rejeitado com “Luminosidade obrigatória” | Plano sem `minLight` e `maxLight` |
| TU-40 | RF-PLAN-06: duração obrigatória | `validatePlan()` | Particionamento de Equivalência | Plano rejeitado com “Duração obrigatória” | Plano sem `durationDays` |
| TU-41 | RF-PLAN-07: tipo de plano obrigatório | `validatePlan()` | Particionamento de Equivalência | Plano rejeitado com “Tipo de plano inválido” | Plano sem `type` |
| TU-42 | RN-PLAN-08: temperatura máxima deve respeitar limite superior | `validatePlan()` | Valores Limite | Plano rejeitado com erro de temperatura máxima | Plano com `maxTemperature = 29` |
| TU-43 | RN-PLAN-09: humidade máxima deve respeitar limite superior | `validatePlan()` | Valores Limite | Plano rejeitado com erro de humidade máxima | Plano com `maxHumidity = 81` |
| TU-44 | RN-PLAN-10: luminosidade máxima deve respeitar limite superior | `validatePlan()` | Valores Limite | Plano rejeitado com erro de luminosidade máxima | Plano com `maxLight = 25001` |
| TU-45 | RN-PLAN-11: humidade mínima não pode exceder máxima | `validatePlan()` | Particionamento de Equivalência / regra de coerência | Plano rejeitado por incoerência de humidade | Plano com `minHumidity > maxHumidity` |
| TU-46 | RN-PLAN-12: luminosidade mínima não pode exceder máxima | `validatePlan()` | Particionamento de Equivalência / regra de coerência | Plano rejeitado por incoerência de luminosidade | Plano com `minLight > maxLight` |

---

## 3. Cobertura Bidirecional — Requisito → Casos de Teste

| Requisito / Regra | Casos de Teste Associados |
|---|---|
| RF-HERB-01: validar linha válida do catálogo de ervas | TU-16 |
| RF-HERB-02: nome da erva obrigatório | TU-17 |
| RN-HERB-01: temperatura mínima não pode exceder máxima | TU-18 |
| RN-HERB-02: humidade deve estar entre 0 e 100 | TU-19 |
| RF-HERB-03: importação com linhas válidas, inválidas e parciais | TU-20 |
| RF-HERB-04: rejeição de importação vazia | TU-21 |
| RF-HERB-05: nome científico obrigatório | TU-22 |
| RF-HERB-06: temperatura mínima obrigatória | TU-23 |
| RF-HERB-07: temperatura máxima obrigatória | TU-24 |
| RN-HERB-03: humidade mínima não pode exceder máxima | TU-25 |
| RF-HERB-08: dados de importação devem ser array | TU-26 |
| RN-HERB-04: linha inválida parcial exige identificador | TU-27 |
| RF-PLAN-01: plano regular válido | TU-28 |
| RF-PLAN-02: tipo de plano inválido | TU-29 |
| RN-PLAN-01: temperatura deve estar entre 18 e 28 ºC | TU-30 |
| RN-PLAN-02: humidade deve estar entre 40 e 80% | TU-31 |
| RN-PLAN-03: luminosidade deve estar entre 5000 e 25000 lux | TU-32 |
| RN-PLAN-04: duração deve estar entre 1 e 365 dias | TU-33 |
| RN-PLAN-05: plano pontual exige autorização | TU-34 |
| RN-PLAN-06: plano pontual autorizado pode ser aceite | TU-35 |
| RN-PLAN-07: temperatura mínima não pode exceder máxima | TU-36 |
| RF-PLAN-03: temperatura obrigatória | TU-37 |
| RF-PLAN-04: humidade obrigatória | TU-38 |
| RF-PLAN-05: luminosidade obrigatória | TU-39 |
| RF-PLAN-06: duração obrigatória | TU-40 |
| RF-PLAN-07: tipo de plano obrigatório | TU-41 |
| RN-PLAN-08: temperatura máxima deve respeitar limite superior | TU-42 |
| RN-PLAN-09: humidade máxima deve respeitar limite superior | TU-43 |
| RN-PLAN-10: luminosidade máxima deve respeitar limite superior | TU-44 |
| RN-PLAN-11: humidade mínima não pode exceder máxima | TU-45 |
| RN-PLAN-12: luminosidade mínima não pode exceder máxima | TU-46 |

---

## 4. Resumo da Execução

`Test Suites: 3 passed, 3 total
Tests:       51 passed, 51 total
Snapshots:   0 total`