'use strict';

/**
 * GREENHERB – Batch Service
 * Handles lote (batch) state transitions and related business rules.
 *
 * Valid states:   active → completed | compromised
 * Roles allowed to transition: Technical Manager, Admin
 *
 * Business rules:
 *   BR-1: Only Technical Manager or Admin may call transitionBatch.
 *   BR-2: Transition from a non-active state is forbidden.
 *   BR-3: If losses > 0, a non-empty justification is required.
 *   BR-4: Target state must be 'completed' or 'compromised'.
 */

const ALLOWED_ROLES     = ['Technical Manager', 'Admin'];
const VALID_STATES      = ['active', 'completed', 'compromised'];
const TRANSITIONABLE    = ['active'];           // states FROM which a transition is allowed
const TARGET_STATES     = ['completed', 'compromised'];

/**
 * Transition a batch to a new state.
 *
 * Atomic conditions (used in MCC tests):
 *   C1 : user role is in ALLOWED_ROLES
 *   C2 : batch.state is in TRANSITIONABLE ('active')
 *   C3 : targetState is a valid target ('completed' | 'compromised')
 *   C4 : batch.losses === 0  OR  justification is a non-empty string
 *
 * @param {object} batch         – { state, losses }
 * @param {object} user          – { role }
 * @param {string} targetState   – desired new state
 * @param {string} justification – required when losses > 0
 * @returns {object}             – updated batch object
 */
function transitionBatch(batch, user, targetState, justification) {
    // Guard: inputs must exist
    if (!batch || !user) {
        throw new Error('Batch and user are required.');
    }

    // C1 – role check
    if (!ALLOWED_ROLES.includes(user.role)) {
        throw new Error('Unauthorized: insufficient role to transition batch.');
    }

    // C2 – current state must allow transition
    if (!TRANSITIONABLE.includes(batch.state)) {
        throw new Error(`Invalid transition: batch is already "${batch.state}".`);
    }

    // C3 – target state must be valid
    if (!TARGET_STATES.includes(targetState)) {
        throw new Error(`Invalid target state: "${targetState}". Must be "completed" or "compromised".`);
    }

    // C4 – losses require justification
    if (batch.losses > 0 && (!justification || justification.trim().length === 0)) {
        throw new Error('Justification required for losses.');
    }

    return { ...batch, state: targetState, justification: justification || '' };
}

module.exports = { transitionBatch, ALLOWED_ROLES, TARGET_STATES };