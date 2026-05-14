const VALID_PLAN_TYPES = ['regular', 'emergencia', 'pontual'];

function validatePlan(plan) {
    const errors = [];

    if (!plan.type || !VALID_PLAN_TYPES.includes(plan.type)) {
        errors.push('Tipo de plano inválido');
    }

    if (plan.minTemperature === undefined || plan.maxTemperature === undefined) {
        errors.push('Temperatura obrigatória');
    } else {
        if (Number(plan.minTemperature) < 18 || Number(plan.minTemperature) > 28) {
            errors.push('Temperatura mínima fora do intervalo permitido');
        }

        if (Number(plan.maxTemperature) < 18 || Number(plan.maxTemperature) > 28) {
            errors.push('Temperatura máxima fora do intervalo permitido');
        }

        if (Number(plan.minTemperature) > Number(plan.maxTemperature)) {
            errors.push('Temperatura mínima não pode ser superior à máxima');
        }
    }

    if (plan.minHumidity === undefined || plan.maxHumidity === undefined) {
        errors.push('Humidade obrigatória');
    } else {
        if (Number(plan.minHumidity) < 40 || Number(plan.minHumidity) > 80) {
            errors.push('Humidade mínima fora do intervalo permitido');
        }

        if (Number(plan.maxHumidity) < 40 || Number(plan.maxHumidity) > 80) {
            errors.push('Humidade máxima fora do intervalo permitido');
        }

        if (Number(plan.minHumidity) > Number(plan.maxHumidity)) {
            errors.push('Humidade mínima não pode ser superior à máxima');
        }
    }

    if (plan.minLight === undefined || plan.maxLight === undefined) {
        errors.push('Luminosidade obrigatória');
    } else {
        if (Number(plan.minLight) < 5000 || Number(plan.minLight) > 25000) {
            errors.push('Luminosidade mínima fora do intervalo permitido');
        }

        if (Number(plan.maxLight) < 5000 || Number(plan.maxLight) > 25000) {
            errors.push('Luminosidade máxima fora do intervalo permitido');
        }

        if (Number(plan.minLight) > Number(plan.maxLight)) {
            errors.push('Luminosidade mínima não pode ser superior à máxima');
        }
    }

    if (plan.durationDays === undefined) {
        errors.push('Duração obrigatória');
    } else if (Number(plan.durationDays) < 1 || Number(plan.durationDays) > 365) {
        errors.push('Duração fora do intervalo permitido');
    }

    if (plan.type === 'pontual' && plan.authorizedByResponsible !== true) {
        errors.push('Plano pontual exige autorização do Responsável Técnico');
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

module.exports = {
    validatePlan
};