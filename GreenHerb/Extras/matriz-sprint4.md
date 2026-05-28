# Matriz de Rastreabilidade — Sprint 4

O Sprint 4 incidiu sobre a criação de testes de integração para todos os endpoints da API REST GREENHERB, cobrindo o espaço completo de inputs: cabeçalhos HTTP, payloads JSON, métodos HTTP e respostas esperadas.

Os testes foram implementados com **Jest + Supertest** sobre a stack real (Express + serviços em memória), sem dependência de base de dados externa.

---

## Defects descobertos durante o Sprint 4

| ID     | Descrição | Ficheiro | Gravidade | Estado |
|--------|-----------|----------|-----------|--------|
| DEF-02 | `authcontroller.js` não invoca `validateLoginInput` (authValidator.js), pelo que a validação de comprimento máximo de username (30 chars) não é aplicada a nível de controlador. Um username de 31 chars retorna 401 (credenciais inválidas) em vez de 400 (input inválido). | `src/controllers/authcontroller.js` | Média | Aberto |
| DEF-03 | Os middlewares `checkRole` nos routes (alertRoutes, batchRoutes, auditRoutes, userRoutes) capturavam todas as excepções de `validateUserRole` e retornavam 401, mesmo quando o utilizador estava autenticado mas não tinha o perfil necessário (deveria ser 403). | `src/routes/*.js` | Alta | Corrigido (Sprint 4) |

---

## 1. Matriz de Rastreabilidade — /auth

| ID | Requisito / Regra | Endpoint | Nível | Técnica | Resultado Esperado | Pré-condições |
|---|---|---|---|---|---|---|
| TI-AUTH-01 | RF-AUTH-01: login com credenciais válidas emite token | POST /auth/login | Integração | PE | 200 + `token` JWT na resposta | Utilizador `admin/123456` pré-existente no store em memória |
| TI-AUTH-02 | RF-AUTH-01: username inexistente rejeita | POST /auth/login | Integração | PE | 401 com mensagem | Nenhuma |
| TI-AUTH-03 | RF-AUTH-01: password incorrecta rejeita | POST /auth/login | Integração | PE | 401 com mensagem | Utilizador `admin` existe |
| TI-AUTH-04 | RN-AUTH-01: campos obrigatórios (body vazio) | POST /auth/login | Integração | PE | 400 | Body `{}` |
| TI-AUTH-05 | RN-AUTH-01: campo username em falta | POST /auth/login | Integração | PE | 400 | Body só com `password` |
| TI-AUTH-06 | RN-AUTH-01: campo password em falta | POST /auth/login | Integração | PE | 400 | Body só com `username` |
| TI-AUTH-07 | RN-AUTH-02: username com 30 chars (limite max) | POST /auth/login | Integração | VL | 401 (comprimento válido, credenciais erradas) | Username de 30 chars inexistente |
| TI-AUTH-08 | DEF-02: username com 31 chars — authcontroller não valida comprimento | POST /auth/login | Integração | VL | 401 em vez de 400 esperado (bug documentado) | Username de 31 chars |
| TI-AUTH-09 | RN-AUTH-03: Content-Type inválido | POST /auth/login | Integração | PE | 400 (body não parseado) | Header `Content-Type: text/plain` |
| TI-AUTH-10 | RN-AUTH-04: método HTTP inválido | GET /auth/login | Integração | PE | 404 | Nenhuma |
| TI-AUTH-11 | RN-AUTH-05: rate limiting — 6 tentativas consecutivas | POST /auth/login | Integração | VL | 429 após exceder limite de 5 tentativas | Rate limiter limpo no `beforeEach` |

---

## 2. Matriz de Rastreabilidade — /batches

| ID | Requisito / Regra | Endpoint | Nível | Técnica | Resultado Esperado | Pré-condições |
|---|---|---|---|---|---|---|
| TI-BATCH-01 | RN-BATCH-01: autenticação obrigatória | POST /batches | Integração | PE | 401 sem token | Nenhuma |
| TI-BATCH-02 | RN-BATCH-01: Technician não pode criar lote | POST /batches | Integração | PE | 403 | Token com role `Technician` |
| TI-BATCH-03 | RN-BATCH-01: Technical Manager pode criar lote | POST /batches | Integração | PE | 201 + lote com `state: active` | Token `Technical Manager` válido |
| TI-BATCH-04 | RN-BATCH-01: Admin pode criar lote | POST /batches | Integração | PE | 201 | Token `Admin` válido |
| TI-BATCH-05 | RN-BATCH-02: campos obrigatórios (herbId em falta) | POST /batches | Integração | PE | 400 | Token `Admin` |
| TI-BATCH-06 | RN-BATCH-03: leitura acessível a qualquer autenticado | GET /batches | Integração | PE | 200 + array | Token `Technician` válido |
| TI-BATCH-07 | RN-BATCH-04: C1=false (Technician tenta transição) | PATCH /batches/:id/transition | Integração | MCC | 403 | Lote activo criado; token `Technician` |
| TI-BATCH-08 | RN-BATCH-04: C2=false (lote já `completed`) | PATCH /batches/:id/transition | Integração | MCC | 422 | Lote previamente transitado para `completed` |
| TI-BATCH-09 | RN-BATCH-04: C3=false (targetState inválido) | PATCH /batches/:id/transition | Integração | MCC | 422 | Lote activo; targetState = `suspended` |
| TI-BATCH-10 | RN-BATCH-04: C4=false (losses>0 sem justificação) | PATCH /batches/:id/transition | Integração | MCC | 422 | Lote activo com `losses: 10` |
| TI-BATCH-11 | RN-BATCH-04: todas condições verdadeiras (C1+C2+C3+C4) | PATCH /batches/:id/transition | Integração | MCC | 200 + `state: compromised` | Lote activo, losses=5, token Manager, targetState válido, justificação presente |
| TI-BATCH-12 | RN-BATCH-05: transição sem perdas não exige justificação | PATCH /batches/:id/transition | Integração | PE | 200 + `state: completed` | Lote activo com losses=0 |
| TI-BATCH-13 | RN-AUTH-06: token expirado rejeitado | GET /batches | Integração | PE | 401 | Token gerado com `expiresIn: '-1s'` |

### Tabela de Verdade MCC — transitionBatch (TI-BATCH-07 a 12)

| Caso | C1: role permitido | C2: state=active | C3: targetState válido | C4: losses=0 OU justif. presente | Resultado |
|------|-------------------|-----------------|----------------------|----------------------------------|-----------|
| TI-BATCH-07 | ✗ (Technician) | ✓ | ✓ | ✓ | 403 |
| TI-BATCH-08 | ✓ | ✗ (completed) | ✓ | ✓ | 422 |
| TI-BATCH-09 | ✓ | ✓ | ✗ (suspended) | ✓ | 422 |
| TI-BATCH-10 | ✓ | ✓ | ✓ | ✗ (losses>0, sem justif.) | 422 |
| TI-BATCH-11 | ✓ | ✓ | ✓ | ✓ | 200 |
| TI-BATCH-12 | ✓ | ✓ | ✓ | ✓ (losses=0) | 200 |

---

## 3. Matriz de Rastreabilidade — /alerts

| ID | Requisito / Regra | Endpoint | Nível | Técnica | Resultado Esperado | Pré-condições |
|---|---|---|---|---|---|---|
| TI-ALERT-01 | RN-AUTH-01: autenticação obrigatória em /alerts | POST /alerts | Integração | PE | 401 sem token | Nenhuma |
| TI-ALERT-02 | RN-ALERT-01: sensor inoperacional → Informative | POST /alerts | Integração | PE | 201 + `classification: Informative` | Token válido; `sensorOK: false` |
| TI-ALERT-03 | RN-ALERT-02: ambos dentro dos limites → Informative | POST /alerts | Integração | PE | 201 + `classification: Informative` | `temp: 23, humidity: 60` |
| TI-ALERT-04 | RN-ALERT-03: só temp fora → Warning | POST /alerts | Integração | PE | 201 + `classification: Warning` | `temp: 35, humidity: 60` |
| TI-ALERT-05 | RN-ALERT-04: ambos fora → Critical | POST /alerts | Integração | PE | 201 + `classification: Critical` | `temp: 35, humidity: 90` |
| TI-ALERT-06 | RN-ALERT-05: payload incompleto | POST /alerts | Integração | PE | 400 | Body parcial (só `temp`) |
| TI-ALERT-07 | RN-PLAN-01: temperatura limite inferior exacto (18 ºC) | POST /alerts | Integração | VL | 201 + Informative | `temp: 18` |
| TI-ALERT-08 | RN-PLAN-01: temperatura abaixo do limite (17 ºC) | POST /alerts | Integração | VL | 201 + Warning | `temp: 17` |
| TI-ALERT-09 | RN-PLAN-01: temperatura limite superior exacto (28 ºC) | POST /alerts | Integração | VL | 201 + Informative | `temp: 28` |
| TI-ALERT-10 | RN-PLAN-01: temperatura acima do limite (29 ºC) | POST /alerts | Integração | VL | 201 + Warning | `temp: 29` |
| TI-ALERT-11 | RN-PLAN-02: humidade abaixo do limite (39%) | POST /alerts | Integração | VL | 201 + Warning | `humidity: 39` |
| TI-ALERT-12 | RN-PLAN-02: humidade limite inferior exacto (40%) | POST /alerts | Integração | VL | 201 + Informative | `humidity: 40` |
| TI-ALERT-13 | RN-PLAN-02: humidade limite superior exacto (80%) | POST /alerts | Integração | VL | 201 + Informative | `humidity: 80` |
| TI-ALERT-14 | RN-PLAN-02: humidade acima do limite (81%) | POST /alerts | Integração | VL | 201 + Warning | `humidity: 81` |
| TI-ALERT-15 | RN-ALERT-06: Technician não pode listar alertas | GET /alerts | Integração | PE | 403 | Token `Technician` |
| TI-ALERT-16 | RN-ALERT-06: Technical Manager pode listar alertas | GET /alerts | Integração | PE | 200 + array | Token `Technical Manager` |
| TI-ALERT-17 | RN-ALERT-06: Admin pode listar alertas | GET /alerts | Integração | PE | 200 + array | Token `Admin` |
| TI-ALERT-18 | RN-ALERT-07: resolver alerta sem justificação (válido) | PATCH /alerts/:id | Integração | PE | 200 + `status: resolved` | Alerta pendente criado; token Manager |
| TI-ALERT-19 | RN-ALERT-08: ignorar alerta sem justificação (inválido) | PATCH /alerts/:id | Integração | PE | 422 | Alerta pendente criado |
| TI-ALERT-20 | RN-ALERT-08: justificação de 9 chars (abaixo limite) | PATCH /alerts/:id | Integração | VL | 422 | Alerta pendente |
| TI-ALERT-21 | RN-ALERT-08: justificação de 10 chars (limite inferior) | PATCH /alerts/:id | Integração | VL | 200 + `status: ignored` | Alerta pendente |
| TI-ALERT-22 | RN-ALERT-08: justificação de 250 chars (nominal) | PATCH /alerts/:id | Integração | VL | 200 | Alerta pendente |
| TI-ALERT-23 | RN-ALERT-08: justificação de 500 chars (limite superior) | PATCH /alerts/:id | Integração | VL | 200 | Alerta pendente |
| TI-ALERT-24 | RN-ALERT-08: justificação de 501 chars (acima limite) | PATCH /alerts/:id | Integração | VL | 422 | Alerta pendente |
| TI-ALERT-25 | RN-ALERT-09: acção inválida (delete) | PATCH /alerts/:id | Integração | PE | 422 | Alerta pendente |
| TI-ALERT-26 | RN-ALERT-10: alerta inexistente | PATCH /alerts/9999 | Integração | PE | 404 | Nenhuma |
| TI-ALERT-27 | RN-ALERT-06: Technician não pode resolver alertas | PATCH /alerts/:id | Integração | PE | 403 | Alerta pendente; token `Technician` |

---

## 4. Matriz de Rastreabilidade — /audit

| ID | Requisito / Regra | Endpoint | Nível | Técnica | Resultado Esperado | Pré-condições |
|---|---|---|---|---|---|---|
| TI-AUDIT-01 | RN-AUTH-01: autenticação obrigatória | POST /audit | Integração | PE | 401 sem token | Nenhuma |
| TI-AUDIT-02 | RN-AUDIT-01: acção auditável cria log com user, action, timestamp | POST /audit | Integração | PE | 201 + entrada com todos os campos | Token `Admin`; `action: created_plan` |
| TI-AUDIT-03 | RN-AUDIT-02: acção não auditável rejeitada | POST /audit | Integração | PE | 400 | `action: get_plans` (operação de leitura) |
| TI-AUDIT-04 | RN-AUDIT-02: acção vazia rejeitada | POST /audit | Integração | PE | 400 | `action: ''` |
| TI-AUDIT-05 | RN-AUDIT-03: apenas Admin pode consultar logs | GET /audit | Integração | PE | 403 para Technical Manager | Token `Technical Manager` |
| TI-AUDIT-06 | RN-AUDIT-03: Admin consulta todos os logs | GET /audit | Integração | PE | 200 + array | Token `Admin` |
| TI-AUDIT-07 | RN-AUDIT-04: logs criados por POST visíveis no GET | POST /audit + GET /audit | Integração | PE | Entrada com `action: created_batch` e `meta.batchId: 42` visível | Token `Admin`; auditoria limpa no início |
| TI-AUDIT-08 | RN-AUDIT-05: filtro por action funciona | GET /audit/filter?action=... | Integração | PE | Apenas entradas com action pedida | Dois logs de diferentes acções pré-criados |

---

## 5. Matriz de Rastreabilidade — /users

| ID | Requisito / Regra | Endpoint | Nível | Técnica | Resultado Esperado | Pré-condições |
|---|---|---|---|---|---|---|
| TI-USER-01 | RN-AUTH-01: autenticação obrigatória | POST /users | Integração | PE | 401 sem token | Nenhuma |
| TI-USER-02 | RN-USER-01: Technician não pode criar utilizadores | POST /users | Integração | PE | 403 | Token `Technician` |
| TI-USER-03 | RN-USER-01: Admin pode criar utilizadores | POST /users | Integração | PE | 201 + utilizador criado | Token `Admin`; username único |
| TI-USER-04 | RN-USER-01: Technical Manager pode criar utilizadores | POST /users | Integração | PE | 201 | Token `Technical Manager` |
| TI-USER-05 | RN-USER-02: role inválida rejeitada | POST /users | Integração | PE | 400 | `role: SuperUser` |
| TI-USER-06 | RN-USER-03: campos obrigatórios | POST /users | Integração | PE | 400 | Body sem `username` |
| TI-USER-07 | RN-USER-04: Technician não pode listar utilizadores | GET /users | Integração | PE | 403 | Token `Technician` |
| TI-USER-08 | RN-USER-04: Admin pode listar utilizadores | GET /users | Integração | PE | 200 + array | Token `Admin` |
| TI-USER-09 | RN-USER-05: Admin/Manager podem ver utilizador por ID | GET /users/:id | Integração | PE | 200 + utilizador | Token `Technical Manager`; ID 1 existe |
| TI-USER-10 | RN-USER-05: utilizador inexistente | GET /users/9999 | Integração | PE | 404 | Token `Admin` |
| TI-USER-11 | RN-USER-06: Admin pode actualizar utilizador | PUT /users/:id | Integração | PE | 200 + utilizador actualizado | Token `Admin`; ID 3 existe |
| TI-USER-12 | RN-USER-06: Technical Manager não pode actualizar | PUT /users/:id | Integração | PE | 403 | Token `Technical Manager` |
| TI-USER-13 | RN-USER-07: Admin pode eliminar utilizador | DELETE /users/:id | Integração | PE | 204 | Token `Admin`; utilizador previamente criado |
| TI-USER-14 | RN-USER-07: Technician não pode eliminar | DELETE /users/:id | Integração | PE | 403 | Token `Technician` |
| TI-USER-15 | RN-USER-08: método HTTP não suportado (PATCH /users) | PATCH /users | Integração | PE | 404 | Token `Admin` |

---

## 6. Cobertura Bidirecional — Requisito → Casos de Teste

| Requisito / Regra | Casos de Teste |
|---|---|
| RF-AUTH-01: login emite token JWT | TI-AUTH-01, TI-AUTH-02, TI-AUTH-03 |
| RN-AUTH-01: autenticação obrigatória em endpoints protegidos | TI-AUTH-04…06, TI-BATCH-01, TI-ALERT-01, TI-AUDIT-01, TI-USER-01 |
| RN-AUTH-02: comprimento máximo de username | TI-AUTH-07, TI-AUTH-08 (DEF-02) |
| RN-AUTH-03: Content-Type inválido | TI-AUTH-09 |
| RN-AUTH-04: método HTTP inválido | TI-AUTH-10 |
| RN-AUTH-05: rate limiting | TI-AUTH-11 |
| RN-AUTH-06: token expirado | TI-BATCH-13 |
| RN-BATCH-01: controlo de acesso na criação de lotes | TI-BATCH-01…04 |
| RN-BATCH-02: campos obrigatórios no lote | TI-BATCH-05 |
| RN-BATCH-03: leitura de lotes acessível a autenticados | TI-BATCH-06 |
| RN-BATCH-04: transição de estado (MCC C1..C4) | TI-BATCH-07…11 |
| RN-BATCH-05: transição sem perdas não exige justificação | TI-BATCH-12 |
| RN-ALERT-01..04: classificação de alertas (sensor, limites) | TI-ALERT-02…05 |
| RN-ALERT-05: payload obrigatório | TI-ALERT-06 |
| RN-PLAN-01: limites de temperatura (18–28 ºC) | TI-ALERT-07…10 |
| RN-PLAN-02: limites de humidade (40–80%) | TI-ALERT-11…14 |
| RN-ALERT-06: controlo de acesso em alertas | TI-ALERT-15…17, TI-ALERT-27 |
| RN-ALERT-07: resolver alerta | TI-ALERT-18 |
| RN-ALERT-08: ignorar alerta — justificação obrigatória (10–500 chars) | TI-ALERT-19…24 |
| RN-ALERT-09: acção inválida | TI-ALERT-25 |
| RN-ALERT-10: alerta inexistente | TI-ALERT-26 |
| RN-AUDIT-01: criar log auditável | TI-AUDIT-02 |
| RN-AUDIT-02: acções não auditáveis rejeitadas | TI-AUDIT-03, TI-AUDIT-04 |
| RN-AUDIT-03: controlo de acesso a logs | TI-AUDIT-05, TI-AUDIT-06 |
| RN-AUDIT-04: logs visíveis após criação | TI-AUDIT-07 |
| RN-AUDIT-05: filtro por acção | TI-AUDIT-08 |
| RN-USER-01..07: CRUD de utilizadores com controlo de acesso | TI-USER-01…14 |
| RN-USER-08: método HTTP não suportado | TI-USER-15 |

---

## 7. Resumo da Execução

```
Test Suites: 1 passed, 1 total
Tests:       74 passed, 74 total
Snapshots:   0 total
Tempo total: ~2 s
```

### Distribuição por técnica

| Técnica | Nº de casos |
|---------|-------------|
| Particionamento de Equivalência (PE) | 50 |
| Análise de Valores Limite (VL) | 18 |
| Cobertura de Condições Múltiplas (MCC) | 6 |
| **Total Sprint 4** | **74** |

### Distribuição acumulada por nível

| Nível | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Total |
|-------|----------|----------|----------|----------|-------|
| Unidade | 15 | 31 | ~50 est. | 0 | ~96 |
| Integração | 0 | 0 | 0 | **74** | **74** |
| Sistema | 0 | 0 | 0 | 0 | 0 |
