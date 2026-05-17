const VALID_ROLES = ['Technician', 'Technical Manager', 'Admin'];

const PERMISSIONS = {
    Technician: {
        canApprovePlans:      false,
        canSwitchMode:        false,
        canTransitionBatches: false,
        canManageUsers:       false,
        canViewAudit:         false,
        canImportHerbs:       false,
        canExportReports:     false,
    },
    'Technical Manager': {
        canApprovePlans:      true,
        canSwitchMode:        true,
        canTransitionBatches: true,
        canManageUsers:       false,
        canViewAudit:         true,
        canImportHerbs:       false,
        canExportReports:     true,
    },
    Admin: {
        canApprovePlans:      true,
        canSwitchMode:        true,
        canTransitionBatches: true,
        canManageUsers:       true,
        canViewAudit:         true,
        canImportHerbs:       true,
        canExportReports:     true,
    },
};

function validateUserRole(user, requiredRoles) {
    // C1: user must exist and be an object
    const hasUser = user !== null && user !== undefined && typeof user === 'object';

    // C2: role must be a non-empty, non-whitespace string
    const hasRole = hasUser
        && typeof user.role === 'string'
        && user.role.trim().length > 0;

    if (!hasUser || !hasRole) {
        throw new Error('User is required and must have a role.');
    }

    // C3: role is allowed
    const allowed = Array.isArray(requiredRoles)
        ? requiredRoles.includes(user.role)
        : user.role === requiredRoles;

    if (!allowed) {
        throw new Error(
            `Unauthorized: User role "${user.role}" is not allowed for this action.`
        );
    }

    return true;
}

function getUserPermissions(role) {
    if (!VALID_ROLES.includes(role)) {
        throw new Error(`Invalid role: ${role}`);
    }
    return { ...PERMISSIONS[role] };
}

module.exports = { validateUserRole, getUserPermissions, VALID_ROLES, PERMISSIONS };