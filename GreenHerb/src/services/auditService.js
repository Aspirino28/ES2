'use strict';

/**
 * GREENHERB – Audit Service
 * Records every relevant platform operation with user, action and timestamp.
 *
 * Auditable actions (write operations):
 *   created_plan, updated_plan, deleted_plan,
 *   created_batch, transitioned_batch, divided_batch,
 *   created_task, completed_task,
 *   registered_measurement,
 *   resolved_alert, ignored_alert,
 *   switched_mode,
 *   created_user, updated_user, deleted_user,
 *   imported_herbs,
 *   exported_report
 *
 * Non-auditable actions (read operations):
 *   Any action not in the list above — e.g. get_*, list_*, view_*
 *
 * Atomic conditions (used in MCC tests):
 *   C1 : user is a non-null object with id and role
 *   C2 : action is a non-empty string
 *   C3 : action is in AUDITABLE_ACTIONS
 */

const AUDITABLE_ACTIONS = new Set([
    'created_plan',
    'updated_plan',
    'deleted_plan',
    'created_batch',
    'transitioned_batch',
    'divided_batch',
    'created_task',
    'completed_task',
    'registered_measurement',
    'resolved_alert',
    'ignored_alert',
    'switched_mode',
    'created_user',
    'updated_user',
    'deleted_user',
    'imported_herbs',
    'exported_report',
]);

/**
 * In-memory audit log store (exported so tests can inspect and reset it).
 * In production this would be persisted to the database /audit table.
 */
const auditLogs = [];

/**
 * Returns true when the action string is in the auditable set.
 *
 * @param {string} action
 * @returns {boolean}
 */
function isAuditable(action) {
    if (typeof action !== 'string' || action.trim().length === 0) return false;
    return AUDITABLE_ACTIONS.has(action);
}

/**
 * Records an audit entry for a write operation.
 *
 * @param {object} user   – { id, role }
 * @param {string} action – must be an auditable action string
 * @param {object} [meta] – optional extra context (e.g. entity id)
 * @returns {object}      – the log entry that was stored
 */
function logAction(user, action, meta = {}) {
    // C1 – user must exist with id and role
    if (!user || user.id === undefined || user.id === null || !user.role) {
        throw new Error('Valid user with id and role is required to log an action.');
    }

    // C2 – action must be a non-empty string
    if (typeof action !== 'string' || action.trim().length === 0) {
        throw new Error('Action must be a non-empty string.');
    }

    // C3 – action must be auditable
    if (!AUDITABLE_ACTIONS.has(action)) {
        throw new Error(`Action "${action}" is not auditable.`);
    }

    const entry = {
        userId:    user.id,
        userRole:  user.role,
        action,
        timestamp: new Date().toISOString(),
        meta:      { ...meta },
    };

    auditLogs.push(entry);
    return entry;
}

/**
 * Returns a snapshot of all stored audit log entries.
 * Optionally filtered by userId or action.
 *
 * @param {object} [filters] – { userId?, action? }
 * @returns {object[]}
 */
function getAuditLogs(filters = {}) {
    return auditLogs.filter(entry => {
        if (filters.userId !== undefined && entry.userId !== filters.userId) return false;
        if (filters.action !== undefined && entry.action !== filters.action) return false;
        return true;
    });
}

module.exports = { logAction, isAuditable, getAuditLogs, auditLogs, AUDITABLE_ACTIONS };