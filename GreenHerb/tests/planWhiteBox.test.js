/**
 * ============================================================================
 * Sprint 5 — Testes White-Box para a criação de planos de cultivo
 * ============================================================================
 *
 * Componente sob teste: `validatePlan()` em `src/services/planService.js`.
 *
 * Os testes deste ficheiro foram desenhados a partir da inspecção do código
 * produtivo e mapeiam-se directamente às 16 estruturas `if`/`else if`
 * presentes na função. A função não contém ciclos `while` nem `for`, pelo
 * que a cobertura de ciclos é Não-Aplicável e está assinalada como tal na
 * matriz de rastreabilidade (Extras/matriz-sprint5.md).
 *
 * Identificação das estruturas:
 *
 *   IF-01  linha  6  !plan.type || !VALID_PLAN_TYPES.includes(plan.type)
 *   IF-02  linha 10  plan.minTemperature === undefined ||
 *                    plan.maxTemperature === undefined
 *   IF-03  linha 13  Number(plan.minTemperature) < 18 ||
 *                    Number(plan.minTemperature) > 28
 *   IF-04  linha 17  Number(plan.maxTemperature) < 18 ||
 *                    Number(plan.maxTemperature) > 28
 *   IF-05  linha 21  Number(plan.minTemperature) >
 *                    Number(plan.maxTemperature)
 *   IF-06  linha 26  plan.minHumidity === undefined ||
 *                    plan.maxHumidity === undefined
 *   IF-07  linha 29  Number(plan.minHumidity) < 40 ||
 *                    Number(plan.minHumidity) > 80
 *   IF-08  linha 33  Number(plan.maxHumidity) < 40 ||
 *                    Number(plan.maxHumidity) > 80
 *   IF-09  linha 37  Number(plan.minHumidity) > Number(plan.maxHumidity)
 *   IF-10  linha 42  plan.minLight === undefined ||
 *                    plan.maxLight === undefined
 *   IF-11  linha 45  Number(plan.minLight) < 5000 ||
 *                    Number(plan.minLight) > 25000
 *   IF-12  linha 49  Number(plan.maxLight) < 5000 ||
 *                    Number(plan.maxLight) > 25000
 *   IF-13  linha 53  Number(plan.minLight) > Number(plan.maxLight)
 *   IF-14  linha 58  plan.durationDays === undefined
 *   IF-15  linha 60  Number(plan.durationDays) < 1 ||
 *                    Number(plan.durationDays) > 365            (else if)
 *   IF-16  linha 64  plan.type === 'pontual' &&
 *                    plan.authorizedByResponsible !== true
 *   D-RET  linha 69  errors.length === 0  (decisão implícita do return)
 *
 * Convenções:
 *  • Cada bloco `describe` corresponde a uma estrutura `if`.
 *  • Os IDs dos casos de teste (TU-WB-01 .. TU-WB-50) seguem a ordem das
 *    estruturas e mapeiam-se 1-para-1 com a matriz de rastreabilidade.
 *  • As tabelas C1/C2 referem-se às condições atómicas tal como aparecem
 *    na expressão lógica original (esquerda → C1, direita → C2).
 *  • Em JavaScript o operador `||`/`&&` é curto-circuito: combinações em
 *    que C1 mascararia C2 são assinaladas como "infeasible" e justificadas
 *    na matriz.
 */

const { validatePlan } = require("../src/services/planService");

// ----- Plano base válido reutilizado nos testes -----
const VALID_BASE_PLAN = Object.freeze({
  type: "regular",
  minTemperature: 18,
  maxTemperature: 28,
  minHumidity: 40,
  maxHumidity: 80,
  minLight: 5000,
  maxLight: 25000,
  durationDays: 90,
});

const buildPlan = (overrides = {}) => ({ ...VALID_BASE_PLAN, ...overrides });

// ============================================================================
// IF-01 — Validação de tipo: !plan.type || !VALID_PLAN_TYPES.includes(plan.type)
// Tabela de Verdade MCC (OR de 2 condições atómicas)
// | C1: !plan.type | C2: !INCLUDES | Resultado | Caso de teste     |
// |     F (def)    |   F (válido)  |     F     | TU-WB-01          |
// |     F (def)    |   T (inv.)    |     T     | TU-WB-02          |
// |     T (falsy)  |   T (∗)       |     T     | TU-WB-03          |
// |     T (falsy)  |   F           |   infeasi.|  N/A — ver matriz |
// (∗) Qualquer valor falsy de plan.type também NÃO está no array de tipos
//     válidos, pelo que C1=T implica logicamente C2=T.
// ============================================================================
describe("IF-01 — Validação do tipo de plano", () => {
  test("TU-WB-01: C1=F, C2=F (tipo definido e válido) — sem erro", () => {
    const result = validatePlan(buildPlan({ type: "regular" }));
    expect(result.errors).not.toContain("Tipo de plano inválido");
  });

  test("TU-WB-02: C1=F, C2=T (tipo definido mas fora da enumeração) — erro", () => {
    const result = validatePlan(buildPlan({ type: "experimental" }));
    expect(result.errors).toContain("Tipo de plano inválido");
  });

  test("TU-WB-03: C1=T (tipo undefined → cai no ramo true) — erro", () => {
    const plan = buildPlan();
    delete plan.type;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Tipo de plano inválido");
  });

  test("TU-WB-03b: C1=T com type='' (string vazia também é falsy) — erro", () => {
    const result = validatePlan(buildPlan({ type: "" }));
    expect(result.errors).toContain("Tipo de plano inválido");
  });
});

// ============================================================================
// IF-02 — Temperatura obrigatória: min === undefined || max === undefined
// Tabela de Verdade MCC (OR, todas as 4 combinações são exequíveis)
// | C1: minTemp===undefined | C2: maxTemp===undefined | Result | Caso     |
// |          F              |          F              |   F    | TU-WB-04 |
// |          F              |          T              |   T    | TU-WB-05 |
// |          T              |          F              |   T    | TU-WB-06 |
// |          T              |          T              |   T    | TU-WB-07 |
// ============================================================================
describe("IF-02 — Presença obrigatória de temperatura", () => {
  test("TU-WB-04: C1=F, C2=F (ambas definidas) — entra no else, sem 'Temperatura obrigatória'", () => {
    const result = validatePlan(buildPlan());
    expect(result.errors).not.toContain("Temperatura obrigatória");
  });

  test("TU-WB-05: C1=F, C2=T (apenas máxima omissa) — erro", () => {
    const plan = buildPlan();
    delete plan.maxTemperature;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Temperatura obrigatória");
  });

  test("TU-WB-06: C1=T, C2=F (apenas mínima omissa) — erro", () => {
    const plan = buildPlan();
    delete plan.minTemperature;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Temperatura obrigatória");
  });

  test("TU-WB-07: C1=T, C2=T (ambas omissas) — erro", () => {
    const plan = buildPlan();
    delete plan.minTemperature;
    delete plan.maxTemperature;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Temperatura obrigatória");
  });
});

// ============================================================================
// IF-03 — Range minTemperature: minTemp < 18 || minTemp > 28
// Tabela de Verdade (OR de 2 condições, combinação T/T infeasible)
// | C1: minTemp<18 | C2: minTemp>28 | Result | Caso       |
// |       F        |       F        |   F    | TU-WB-08   |
// |       T        |       F        |   T    | TU-WB-09   |
// |       F        |       T        |   T    | TU-WB-10   |
// |       T        |       T        | infeas.| impossível |
// ============================================================================
describe("IF-03 — Range da temperatura mínima [18, 28]", () => {
  test("TU-WB-08: C1=F, C2=F (minTemp=23 dentro do intervalo) — sem erro", () => {
    const result = validatePlan(buildPlan({ minTemperature: 23 }));
    expect(result.errors).not.toContain(
      "Temperatura mínima fora do intervalo permitido",
    );
  });

  test("TU-WB-09: C1=T, C2=F (minTemp=17 abaixo do intervalo) — erro", () => {
    const result = validatePlan(buildPlan({ minTemperature: 17 }));
    expect(result.errors).toContain(
      "Temperatura mínima fora do intervalo permitido",
    );
  });

  test("TU-WB-10: C1=F, C2=T (minTemp=29 acima do intervalo) — erro", () => {
    const result = validatePlan(
      buildPlan({ minTemperature: 29, maxTemperature: 28 }),
    );
    // Nota: minTemp=29 → IF-03 dispara. IF-05 (min>max) também dispara —
    // isso é correctamente esperado e não invalida o assert deste teste.
    expect(result.errors).toContain(
      "Temperatura mínima fora do intervalo permitido",
    );
  });
});

// ============================================================================
// IF-04 — Range maxTemperature: maxTemp < 18 || maxTemp > 28
// Análoga a IF-03; T/T infeasible.
// ============================================================================
describe("IF-04 — Range da temperatura máxima [18, 28]", () => {
  test("TU-WB-11: C1=F, C2=F (maxTemp=23) — sem erro", () => {
    const result = validatePlan(buildPlan({ maxTemperature: 23 }));
    expect(result.errors).not.toContain(
      "Temperatura máxima fora do intervalo permitido",
    );
  });

  test("TU-WB-12: C1=T, C2=F (maxTemp=17 abaixo do intervalo) — erro", () => {
    const result = validatePlan(
      buildPlan({ minTemperature: 18, maxTemperature: 17 }),
    );
    expect(result.errors).toContain(
      "Temperatura máxima fora do intervalo permitido",
    );
  });

  test("TU-WB-13: C1=F, C2=T (maxTemp=29 acima do intervalo) — erro", () => {
    const result = validatePlan(buildPlan({ maxTemperature: 29 }));
    expect(result.errors).toContain(
      "Temperatura máxima fora do intervalo permitido",
    );
  });
});

// ============================================================================
// IF-05 — Coerência: minTemperature > maxTemperature (decisão simples)
// | Condição | Result | Caso     |
// |    F     |   F    | TU-WB-14 |
// |    T     |   T    | TU-WB-15 |
// ============================================================================
describe("IF-05 — Coerência minTemp ≤ maxTemp", () => {
  test("TU-WB-14: F (min=18, max=28) — sem erro de coerência", () => {
    const result = validatePlan(buildPlan());
    expect(result.errors).not.toContain(
      "Temperatura mínima não pode ser superior à máxima",
    );
  });

  test("TU-WB-15: T (min=28, max=18) — erro de coerência", () => {
    const result = validatePlan(
      buildPlan({ minTemperature: 28, maxTemperature: 18 }),
    );
    expect(result.errors).toContain(
      "Temperatura mínima não pode ser superior à máxima",
    );
  });
});

// ============================================================================
// IF-06 — Humidade obrigatória: análoga a IF-02 (4 combinações exequíveis)
// ============================================================================
describe("IF-06 — Presença obrigatória de humidade", () => {
  test("TU-WB-16: C1=F, C2=F — entra no else, sem 'Humidade obrigatória'", () => {
    const result = validatePlan(buildPlan());
    expect(result.errors).not.toContain("Humidade obrigatória");
  });

  test("TU-WB-17: C1=F, C2=T (maxHumidity omissa) — erro", () => {
    const plan = buildPlan();
    delete plan.maxHumidity;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Humidade obrigatória");
  });

  test("TU-WB-18: C1=T, C2=F (minHumidity omissa) — erro", () => {
    const plan = buildPlan();
    delete plan.minHumidity;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Humidade obrigatória");
  });

  test("TU-WB-19: C1=T, C2=T (ambas omissas) — erro", () => {
    const plan = buildPlan();
    delete plan.minHumidity;
    delete plan.maxHumidity;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Humidade obrigatória");
  });
});

// ============================================================================
// IF-07 — Range minHumidity [40, 80] (análoga a IF-03)
// ============================================================================
describe("IF-07 — Range da humidade mínima [40, 80]", () => {
  test("TU-WB-20: C1=F, C2=F (minHum=60) — sem erro", () => {
    const result = validatePlan(buildPlan({ minHumidity: 60 }));
    expect(result.errors).not.toContain(
      "Humidade mínima fora do intervalo permitido",
    );
  });

  test("TU-WB-21: C1=T, C2=F (minHum=39 abaixo) — erro", () => {
    const result = validatePlan(buildPlan({ minHumidity: 39 }));
    expect(result.errors).toContain(
      "Humidade mínima fora do intervalo permitido",
    );
  });

  test("TU-WB-22: C1=F, C2=T (minHum=81 acima) — erro", () => {
    const result = validatePlan(
      buildPlan({ minHumidity: 81, maxHumidity: 80 }),
    );
    expect(result.errors).toContain(
      "Humidade mínima fora do intervalo permitido",
    );
  });
});

// ============================================================================
// IF-08 — Range maxHumidity [40, 80] (análoga a IF-04)
// ============================================================================
describe("IF-08 — Range da humidade máxima [40, 80]", () => {
  test("TU-WB-23: C1=F, C2=F (maxHum=60) — sem erro", () => {
    const result = validatePlan(buildPlan({ maxHumidity: 60 }));
    expect(result.errors).not.toContain(
      "Humidade máxima fora do intervalo permitido",
    );
  });

  test("TU-WB-24: C1=T, C2=F (maxHum=39 abaixo) — erro", () => {
    const result = validatePlan(
      buildPlan({ minHumidity: 40, maxHumidity: 39 }),
    );
    expect(result.errors).toContain(
      "Humidade máxima fora do intervalo permitido",
    );
  });

  test("TU-WB-25: C1=F, C2=T (maxHum=81 acima) — erro", () => {
    const result = validatePlan(buildPlan({ maxHumidity: 81 }));
    expect(result.errors).toContain(
      "Humidade máxima fora do intervalo permitido",
    );
  });
});

// ============================================================================
// IF-09 — Coerência: minHumidity > maxHumidity (decisão simples)
// ============================================================================
describe("IF-09 — Coerência minHum ≤ maxHum", () => {
  test("TU-WB-26: F (min=40, max=80) — sem erro de coerência", () => {
    const result = validatePlan(buildPlan());
    expect(result.errors).not.toContain(
      "Humidade mínima não pode ser superior à máxima",
    );
  });

  test("TU-WB-27: T (min=80, max=40) — erro de coerência", () => {
    const result = validatePlan(
      buildPlan({ minHumidity: 80, maxHumidity: 40 }),
    );
    expect(result.errors).toContain(
      "Humidade mínima não pode ser superior à máxima",
    );
  });
});

// ============================================================================
// IF-10 — Luminosidade obrigatória: análoga a IF-02 (4 combinações)
// ============================================================================
describe("IF-10 — Presença obrigatória de luminosidade", () => {
  test("TU-WB-28: C1=F, C2=F — entra no else, sem 'Luminosidade obrigatória'", () => {
    const result = validatePlan(buildPlan());
    expect(result.errors).not.toContain("Luminosidade obrigatória");
  });

  test("TU-WB-29: C1=F, C2=T (maxLight omissa) — erro", () => {
    const plan = buildPlan();
    delete plan.maxLight;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Luminosidade obrigatória");
  });

  test("TU-WB-30: C1=T, C2=F (minLight omissa) — erro", () => {
    const plan = buildPlan();
    delete plan.minLight;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Luminosidade obrigatória");
  });

  test("TU-WB-31: C1=T, C2=T (ambas omissas) — erro", () => {
    const plan = buildPlan();
    delete plan.minLight;
    delete plan.maxLight;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Luminosidade obrigatória");
  });
});

// ============================================================================
// IF-11 — Range minLight [5000, 25000]
// ============================================================================
describe("IF-11 — Range da luminosidade mínima [5000, 25000]", () => {
  test("TU-WB-32: C1=F, C2=F (minLight=15000) — sem erro", () => {
    const result = validatePlan(buildPlan({ minLight: 15000 }));
    expect(result.errors).not.toContain(
      "Luminosidade mínima fora do intervalo permitido",
    );
  });

  test("TU-WB-33: C1=T, C2=F (minLight=4999 abaixo) — erro", () => {
    const result = validatePlan(buildPlan({ minLight: 4999 }));
    expect(result.errors).toContain(
      "Luminosidade mínima fora do intervalo permitido",
    );
  });

  test("TU-WB-34: C1=F, C2=T (minLight=25001 acima) — erro", () => {
    const result = validatePlan(
      buildPlan({ minLight: 25001, maxLight: 25000 }),
    );
    expect(result.errors).toContain(
      "Luminosidade mínima fora do intervalo permitido",
    );
  });
});

// ============================================================================
// IF-12 — Range maxLight [5000, 25000]
// ============================================================================
describe("IF-12 — Range da luminosidade máxima [5000, 25000]", () => {
  test("TU-WB-35: C1=F, C2=F (maxLight=15000) — sem erro", () => {
    const result = validatePlan(buildPlan({ maxLight: 15000 }));
    expect(result.errors).not.toContain(
      "Luminosidade máxima fora do intervalo permitido",
    );
  });

  test("TU-WB-36: C1=T, C2=F (maxLight=4999 abaixo) — erro", () => {
    const result = validatePlan(
      buildPlan({ minLight: 5000, maxLight: 4999 }),
    );
    expect(result.errors).toContain(
      "Luminosidade máxima fora do intervalo permitido",
    );
  });

  test("TU-WB-37: C1=F, C2=T (maxLight=25001 acima) — erro", () => {
    const result = validatePlan(buildPlan({ maxLight: 25001 }));
    expect(result.errors).toContain(
      "Luminosidade máxima fora do intervalo permitido",
    );
  });
});

// ============================================================================
// IF-13 — Coerência: minLight > maxLight
// ============================================================================
describe("IF-13 — Coerência minLight ≤ maxLight", () => {
  test("TU-WB-38: F (min=5000, max=25000) — sem erro de coerência", () => {
    const result = validatePlan(buildPlan());
    expect(result.errors).not.toContain(
      "Luminosidade mínima não pode ser superior à máxima",
    );
  });

  test("TU-WB-39: T (min=25000, max=5000) — erro de coerência", () => {
    const result = validatePlan(
      buildPlan({ minLight: 25000, maxLight: 5000 }),
    );
    expect(result.errors).toContain(
      "Luminosidade mínima não pode ser superior à máxima",
    );
  });
});

// ============================================================================
// IF-14 e IF-15 — Encadeamento if/else if sobre `durationDays`
//
//   if (plan.durationDays === undefined) { ... }       // IF-14 (simples)
//   else if (durationDays < 1 || durationDays > 365)  // IF-15 (OR composto)
//
// Cobertura combinada:
//   • IF-14=T   → IF-15 não é avaliado (curto-circuito de else).
//   • IF-14=F   → IF-15 é avaliado com 3 combinações exequíveis
//                 (T/T infeasible: um número não pode ser <1 E >365).
// ============================================================================
describe("IF-14 / IF-15 — Duração do plano (cadeia if/else if)", () => {
  test("TU-WB-40: IF-14=T (durationDays omisso) — erro 'Duração obrigatória'", () => {
    const plan = buildPlan();
    delete plan.durationDays;
    const result = validatePlan(plan);
    expect(result.errors).toContain("Duração obrigatória");
    // Quando IF-14 dispara, IF-15 não pode disparar.
    expect(result.errors).not.toContain("Duração fora do intervalo permitido");
  });

  test("TU-WB-41: IF-14=F, IF-15 (F,F) (durationDays=90) — sem erro", () => {
    const result = validatePlan(buildPlan({ durationDays: 90 }));
    expect(result.errors).not.toContain("Duração obrigatória");
    expect(result.errors).not.toContain("Duração fora do intervalo permitido");
  });

  test("TU-WB-42: IF-14=F, IF-15 (T,F) (durationDays=0 abaixo) — erro", () => {
    const result = validatePlan(buildPlan({ durationDays: 0 }));
    expect(result.errors).toContain("Duração fora do intervalo permitido");
  });

  test("TU-WB-43: IF-14=F, IF-15 (F,T) (durationDays=366 acima) — erro", () => {
    const result = validatePlan(buildPlan({ durationDays: 366 }));
    expect(result.errors).toContain("Duração fora do intervalo permitido");
  });
});

// ============================================================================
// IF-16 — Plano pontual exige autorização:
//   plan.type === 'pontual' && plan.authorizedByResponsible !== true
//
// Tabela de Verdade MCC completa (AND, todas as 4 combinações exequíveis):
// | C1: type==='pontual' | C2: authorizedByResponsible!==true | Result | Caso     |
// |          F           |                F                   |   F    | TU-WB-44 |
// |          F           |                T                   |   F    | TU-WB-45 |
// |          T           |                F                   |   F    | TU-WB-46 |
// |          T           |                T                   |   T    | TU-WB-47 |
//
// MC/DC: o par {TU-WB-46, TU-WB-47} mostra que C2 afecta o resultado isolando
//        C1=T; o par {TU-WB-45, TU-WB-47} mostra que C1 afecta o resultado
//        isolando C2=T. Cobertura MC/DC satisfeita.
// ============================================================================
describe("IF-16 — Plano pontual exige autorização do Responsável", () => {
  test("TU-WB-44: C1=F, C2=F (regular + authorized=true) — sem erro", () => {
    const result = validatePlan(
      buildPlan({ type: "regular", authorizedByResponsible: true }),
    );
    expect(result.errors).not.toContain(
      "Plano pontual exige autorização do Responsável Técnico",
    );
  });

  test("TU-WB-45: C1=F, C2=T (regular + authorized=false) — sem erro (C1 curto-circuita AND)", () => {
    const result = validatePlan(
      buildPlan({ type: "regular", authorizedByResponsible: false }),
    );
    expect(result.errors).not.toContain(
      "Plano pontual exige autorização do Responsável Técnico",
    );
  });

  test("TU-WB-46: C1=T, C2=F (pontual + authorized=true) — sem erro", () => {
    const result = validatePlan(
      buildPlan({ type: "pontual", authorizedByResponsible: true }),
    );
    expect(result.errors).not.toContain(
      "Plano pontual exige autorização do Responsável Técnico",
    );
    expect(result.valid).toBe(true);
  });

  test("TU-WB-47: C1=T, C2=T (pontual + authorized=false) — erro", () => {
    const result = validatePlan(
      buildPlan({ type: "pontual", authorizedByResponsible: false }),
    );
    expect(result.errors).toContain(
      "Plano pontual exige autorização do Responsável Técnico",
    );
  });

  test("TU-WB-47b: C1=T, C2=T (pontual + authorized omisso) — erro (undefined !== true)", () => {
    const plan = buildPlan({ type: "pontual" });
    delete plan.authorizedByResponsible;
    const result = validatePlan(plan);
    expect(result.errors).toContain(
      "Plano pontual exige autorização do Responsável Técnico",
    );
  });
});

// ============================================================================
// D-RET — Decisão implícita do return: `valid: errors.length === 0`
//   • Caminho true:  pelo menos uma combinação sem erros (TU-WB-46 já cobre).
//   • Caminho false: pelo menos uma combinação com erros (TU-WB-47 já cobre).
// Cobertura adicional explícita:
// ============================================================================
describe("D-RET — Decisão de retorno (errors.length === 0)", () => {
  test("TU-WB-48: errors vazio → valid=true (plano regular completo)", () => {
    const result = validatePlan(buildPlan());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("TU-WB-49: errors não-vazio → valid=false (tipo inválido)", () => {
    const result = validatePlan(buildPlan({ type: "experimental" }));
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test("TU-WB-50: acumulação de múltiplos erros — todos reportados (não há early-return)", () => {
    // Plano com 4 violações distintas: tipo, temperatura, humidade,
    // luminosidade, duração e pontual sem autorização. Validação NÃO
    // aborta no primeiro erro — todos os ramos `errors.push` são
    // exercitados na mesma execução.
    const plan = {
      type: "pontual",
      authorizedByResponsible: false,
      minTemperature: 17,
      maxTemperature: 29,
      minHumidity: 39,
      maxHumidity: 81,
      minLight: 4999,
      maxLight: 25001,
      durationDays: 0,
    };
    const result = validatePlan(plan);
    expect(result.valid).toBe(false);
    // Verifica que múltiplos pushes ocorreram (sem early-return).
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "Temperatura mínima fora do intervalo permitido",
        "Temperatura máxima fora do intervalo permitido",
        "Humidade mínima fora do intervalo permitido",
        "Humidade máxima fora do intervalo permitido",
        "Luminosidade mínima fora do intervalo permitido",
        "Luminosidade máxima fora do intervalo permitido",
        "Duração fora do intervalo permitido",
        "Plano pontual exige autorização do Responsável Técnico",
      ]),
    );
  });
});
