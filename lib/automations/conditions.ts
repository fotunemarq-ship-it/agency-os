import { Condition, ConditionGroup } from "./types";

export function evaluateConditions(snapshot: any, conditions: ConditionGroup): boolean {
    if (!conditions) return true;

    // Evaluate 'all' (AND)
    if (conditions.all && conditions.all.length > 0) {
        const allMatch = conditions.all.every(cond => checkCondition(snapshot, cond));
        if (!allMatch) return false;
    }

    // Evaluate 'any' (OR)
    if (conditions.any && conditions.any.length > 0) {
        const anyMatch = conditions.any.some(cond => checkCondition(snapshot, cond));
        if (!anyMatch) return false;
    }

    return true;
}

function checkCondition(snapshot: any, cond: Condition): boolean {
    const val = getField(snapshot, cond.field);
    const target = cond.value;

    switch (cond.op) {
        case 'eq': return val == target; // loose equality for string/number match
        case 'neq': return val != target;
        case 'in': return Array.isArray(target) && target.includes(val);
        case 'nin': return Array.isArray(target) && !target.includes(val);
        case 'contains': return typeof val === 'string' && val.includes(target);
        case 'gte': return val >= target;
        case 'lte': return val <= target;
        case 'is_null': return val === null || val === undefined;
        case 'not_null': return val !== null && val !== undefined;
        case 'between':
            return Array.isArray(target) && target.length === 2 && val >= target[0] && val <= target[1];
        default: return false;
    }
}

function getField(obj: any, field: string): any {
    if (!obj) return null;
    return obj[field]; // Simple depth for now. Could support dot notation later.
}
