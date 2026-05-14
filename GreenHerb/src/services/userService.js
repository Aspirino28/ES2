function validateUserRole(user, requiredRoles) {
    if (!user || !user.role) {
        throw new Error('User is required and must have a role.');
    }

    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    if (!roles.includes(user.role)) {
        throw new Error(`Unauthorized: User role "${user.role}" is not allowed for this action.`);
    }

    return true;
}

function getUserPermissions(role) {
    const permissions = {
        Technician: {
            canApprovePlans: false,
            canSwitchMode: false,
            canTransitionBatches: false,
        },
        'Technical Manager': {
            canApprovePlans: true,
            canSwitchMode: true,
            canTransitionBatches: true,
        },
        Admin: {
            canApprovePlans: true,
            canSwitchMode: true,
            canTransitionBatches: true,
        },
    };

    if (!permissions[role]) {
        throw new Error(`Invalid role: ${role}`);
    }

    return permissions[role];
}

module.exports = { validateUserRole, getUserPermissions };