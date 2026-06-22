"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDate = parseDate;
exports.parseDateRange = parseDateRange;
exports.formatDate = formatDate;
exports.getStartOfDay = getStartOfDay;
exports.getEndOfDay = getEndOfDay;
exports.getStartOfMonth = getStartOfMonth;
exports.getEndOfMonth = getEndOfMonth;
exports.daysBetween = daysBetween;
function parseDate(dateStr) {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${dateStr}`);
    }
    return date;
}
function parseDateRange(fromStr, toStr) {
    const to = toStr ? parseDate(toStr) : new Date();
    const from = fromStr
        ? parseDate(fromStr)
        : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    return { from, to };
}
function formatDate(date) {
    return date.toISOString().split('T')[0];
}
function getStartOfDay(date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
}
function getEndOfDay(date) {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
}
function getStartOfMonth(date) {
    const d = new Date(date);
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
}
function getEndOfMonth(date) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
}
function daysBetween(start, end) {
    const diff = end.getTime() - start.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
//# sourceMappingURL=date.js.map