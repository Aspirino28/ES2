function validateHerbRow(row) {
    const errors = [];

    if (!row.name || typeof row.name !== 'string' || row.name.trim() === '') {
        errors.push('Nome obrigatório');
    }

    if (!row.scientificName || typeof row.scientificName !== 'string' || row.scientificName.trim() === '') {
        errors.push('Nome científico obrigatório');
    }

    if (!row.minTemperature || Number(row.minTemperature) < 0) {
        errors.push('Temperatura mínima inválida');
    }

    if (!row.maxTemperature || Number(row.maxTemperature) < 0) {
        errors.push('Temperatura máxima inválida');
    }

    if (Number(row.minTemperature) > Number(row.maxTemperature)) {
        errors.push('Temperatura mínima não pode ser superior à máxima');
    }

    if (!row.minHumidity || Number(row.minHumidity) < 0 || Number(row.minHumidity) > 100) {
        errors.push('Humidade mínima inválida');
    }

    if (!row.maxHumidity || Number(row.maxHumidity) < 0 || Number(row.maxHumidity) > 100) {
        errors.push('Humidade máxima inválida');
    }

    if (Number(row.minHumidity) > Number(row.maxHumidity)) {
        errors.push('Humidade mínima não pode ser superior à máxima');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

function importHerbs(rows) {
    if (!Array.isArray(rows) || rows.length === 0) {
        return {
            imported: 0,
            invalid: 0,
            partial: 0,
            errors: ['Ficheiro vazio ou inválido']
        };
    }

    let imported = 0;
    let invalid = 0;
    let partial = 0;
    const details = [];

    rows.forEach((row, index) => {
        const validation = validateHerbRow(row);

        if (validation.valid) {
            imported++;
        } else {
            invalid++;

            if (row.name || row.scientificName) {
                partial++;
            }

            details.push({
                line: index + 1,
                errors: validation.errors
            });
        }
    });

    return {
        imported,
        invalid,
        partial,
        details
    };
}

module.exports = {
    validateHerbRow,
    importHerbs
};