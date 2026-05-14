const {
  validateHerbRow,
  importHerbs,
} = require("../src/services/herbImportService");

describe("Testes de unidade - Importação de ervas aromáticas", () => {
  test("Linha válida deve ser aceite", () => {
    const row = {
      name: "Manjericão",
      scientificName: "Ocimum basilicum",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
    };

    const result = validateHerbRow(row);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  test("Linha sem nome deve ser rejeitada", () => {
    const row = {
      name: "",
      scientificName: "Ocimum basilicum",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
    };

    const result = validateHerbRow(row);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nome obrigatório");
  });

  test("Linha com temperatura mínima superior à máxima deve ser rejeitada", () => {
    const row = {
      name: "Alecrim",
      scientificName: "Salvia rosmarinus",
      minTemperature: 30,
      maxTemperature: 20,
      minHumidity: 40,
      maxHumidity: 80,
    };

    const result = validateHerbRow(row);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Temperatura mínima não pode ser superior à máxima",
    );
  });

  test("Linha com humidade fora do intervalo deve ser rejeitada", () => {
    const row = {
      name: "Hortelã",
      scientificName: "Mentha",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: -1,
      maxHumidity: 120,
    };

    const result = validateHerbRow(row);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Humidade mínima inválida");
    expect(result.errors).toContain("Humidade máxima inválida");
  });

  test("Importação com linhas válidas e inválidas deve devolver totais corretos", () => {
    const rows = [
      {
        name: "Manjericão",
        scientificName: "Ocimum basilicum",
        minTemperature: 18,
        maxTemperature: 28,
        minHumidity: 40,
        maxHumidity: 80,
      },
      {
        name: "",
        scientificName: "Mentha",
        minTemperature: 18,
        maxTemperature: 28,
        minHumidity: 40,
        maxHumidity: 80,
      },
      {
        name: "Alecrim",
        scientificName: "Salvia rosmarinus",
        minTemperature: 30,
        maxTemperature: 20,
        minHumidity: 40,
        maxHumidity: 80,
      },
    ];

    const result = importHerbs(rows);

    expect(result.imported).toBe(1);
    expect(result.invalid).toBe(2);
    expect(result.partial).toBe(2);
    expect(result.details).toHaveLength(2);
  });

  test("Importação de ficheiro vazio deve devolver erro", () => {
    const result = importHerbs([]);

    expect(result.imported).toBe(0);
    expect(result.invalid).toBe(0);
    expect(result.partial).toBe(0);
    expect(result.errors).toContain("Ficheiro vazio ou inválido");
  });

  test("Linha sem nome científico deve ser rejeitada", () => {
    const row = {
      name: "Salsa",
      scientificName: "",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
    };

    const result = validateHerbRow(row);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Nome científico obrigatório");
  });

  test("Linha com temperatura mínima em falta deve ser rejeitada", () => {
    const row = {
      name: "Coentros",
      scientificName: "Coriandrum sativum",
      maxTemperature: 28,
      minHumidity: 40,
      maxHumidity: 80,
    };

    const result = validateHerbRow(row);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Temperatura mínima inválida");
  });

  test("Linha com temperatura máxima em falta deve ser rejeitada", () => {
    const row = {
      name: "Tomilho",
      scientificName: "Thymus vulgaris",
      minTemperature: 18,
      minHumidity: 40,
      maxHumidity: 80,
    };

    const result = validateHerbRow(row);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Temperatura máxima inválida");
  });

  test("Linha com humidade mínima superior à máxima deve ser rejeitada", () => {
    const row = {
      name: "Orégãos",
      scientificName: "Origanum vulgare",
      minTemperature: 18,
      maxTemperature: 28,
      minHumidity: 90,
      maxHumidity: 40,
    };

    const result = validateHerbRow(row);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "Humidade mínima não pode ser superior à máxima",
    );
  });

  test("Importação inválida quando os dados não são um array", () => {
    const result = importHerbs(null);

    expect(result.imported).toBe(0);
    expect(result.invalid).toBe(0);
    expect(result.partial).toBe(0);
    expect(result.errors).toContain("Ficheiro vazio ou inválido");
  });

  test("Linha inválida sem nome e sem nome científico não deve contar como parcial", () => {
    const rows = [
      {
        name: "",
        scientificName: "",
        minTemperature: 18,
        maxTemperature: 28,
        minHumidity: 40,
        maxHumidity: 80,
      },
    ];

    const result = importHerbs(rows);

    expect(result.imported).toBe(0);
    expect(result.invalid).toBe(1);
    expect(result.partial).toBe(0);
    expect(result.details).toHaveLength(1);
  });
});
