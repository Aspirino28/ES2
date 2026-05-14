const { validatePlan } = require("../src/services/planService");

describe("Testes de unidade - Criação de planos de cultivo", () => {
  test("Plano regular válido deve ser aceite", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("Tipo de plano inválido deve ser rejeitado", () => {
    const plan = {
      type: "experimental",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Tipo de plano inválido");
  });

  test.each([
    [17, false],
    [18, true],
    [23, true],
    [28, true],
    [29, false],
  ])(
    "Valores limite da temperatura mínima: %i",
    (temperature, expectedValidForTemperature) => {
      const plan = {
        type: "regular",
        minTemperature: temperature,
        maxTemperature: 28,
        minHumidity: 40,
        maxHumidity: 80,
        minLight: 5000,
        maxLight: 25000,
        durationDays: 90,
      };

      const result = validatePlan(plan);

      if (expectedValidForTemperature) {
        expect(result.errors).not.toContain(
          "Temperatura mínima fora do intervalo permitido",
        );
      } else {
        expect(result.errors).toContain(
          "Temperatura mínima fora do intervalo permitido",
        );
      }
    },
  );

  test.each([
    [39, false],
    [40, true],
    [60, true],
    [80, true],
    [81, false],
  ])(
    "Valores limite da humidade mínima: %i",
    (humidity, expectedValidForHumidity) => {
      const plan = {
        type: "regular",
        minTemperature: 18,
        maxTemperature: 28,
        minHumidity: humidity,
        maxHumidity: 80,
        minLight: 5000,
        maxLight: 25000,
        durationDays: 90,
      };

      const result = validatePlan(plan);

      if (expectedValidForHumidity) {
        expect(result.errors).not.toContain(
          "Humidade mínima fora do intervalo permitido",
        );
      } else {
        expect(result.errors).toContain(
          "Humidade mínima fora do intervalo permitido",
        );
      }
    },
  );

  test.each([
    [4999, false],
    [5000, true],
    [15000, true],
    [25000, true],
    [25001, false],
  ])(
    "Valores limite da luminosidade mínima: %i",
    (light, expectedValidForLight) => {
      const plan = {
        type: "regular",
        minTemperature: 18,
        maxTemperature: 28,
        minHumidity: 40,
        maxHumidity: 80,
        minLight: light,
        maxLight: 25000,
        durationDays: 90,
      };

      const result = validatePlan(plan);

      if (expectedValidForLight) {
        expect(result.errors).not.toContain(
          "Luminosidade mínima fora do intervalo permitido",
        );
      } else {
        expect(result.errors).toContain(
          "Luminosidade mínima fora do intervalo permitido",
        );
      }
    },
  );

  test.each([
    [0, false],
    [1, true],
    [90, true],
    [365, true],
    [366, false],
  ])(
    "Valores limite da duração do plano: %i dias",
    (duration, expectedValidForDuration) => {
      const plan = {
        type: "regular",
        minTemperature: 18,
        maxTemperature: 28,
        minHumidity: 40,
        maxHumidity: 80,
        minLight: 5000,
        maxLight: 25000,
        durationDays: duration,
      };

      const result = validatePlan(plan);

      if (expectedValidForDuration) {
        expect(result.errors).not.toContain(
          "Duração fora do intervalo permitido",
        );
      } else {
        expect(result.errors).toContain("Duração fora do intervalo permitido");
      }
    },
  );

  test("Plano pontual sem autorização deve ser rejeitado", () => {
    const plan = {
      type: "pontual",
      authorizedByResponsible: false,
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Plano pontual exige autorização do Responsável Técnico",
    );
  });

  test("Plano pontual com autorização e parâmetros válidos deve ser aceite", () => {
    const plan = {
      type: "pontual",
      authorizedByResponsible: true,
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("Temperatura mínima superior à máxima deve ser rejeitada", () => {
    const plan = {
      type: "regular",
      minTemperature: 28,
      maxTemperature: 18,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Temperatura mínima não pode ser superior à máxima",
    );
  });
  test("Plano sem temperatura deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Temperatura obrigatória");
  });
  test("Plano sem humidade deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 28,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Humidade obrigatória");
  });
  test("Plano sem luminosidade deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Luminosidade obrigatória");
  });
  test("Plano sem duração deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Duração obrigatória");
  });

  test("Plano sem tipo deve ser rejeitado", () => {
    const plan = {
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Tipo de plano inválido");
  });

  test("Plano com temperatura máxima fora do intervalo deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 29,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Temperatura máxima fora do intervalo permitido",
    );
  });

  test("Plano com humidade máxima fora do intervalo deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 81,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Humidade máxima fora do intervalo permitido",
    );
  });

  test("Plano com luminosidade máxima fora do intervalo deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 5000,
      maxLight: 25001,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Luminosidade máxima fora do intervalo permitido",
    );
  });

  test("Plano com humidade mínima superior à máxima deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 80,
      maxHumidity: 40,
      minLight: 5000,
      maxLight: 25000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Humidade mínima não pode ser superior à máxima",
    );
  });

  test("Plano com luminosidade mínima superior à máxima deve ser rejeitado", () => {
    const plan = {
      type: "regular",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
      minLight: 25000,
      maxLight: 5000,
      durationDays: 90,
    };

    const result = validatePlan(plan);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Luminosidade mínima não pode ser superior à máxima",
    );
  });
});
