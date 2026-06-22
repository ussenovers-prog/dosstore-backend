export interface DateRange {
  from: Date;
  to: Date;
}

export function parseDate(dateStr: string): Date {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  return date;
}

export function parseDateRange(
  fromStr?: string,
  toStr?: string
): DateRange {
  const to = toStr ? parseDate(toStr) : new Date();
  const from = fromStr
    ? parseDate(fromStr)
    : new Date(to.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days

  return { from, to };
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getStartOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function getStartOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getEndOfMonth(date: Date): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function daysBetween(start: Date, end: Date): number {
  const diff = end.getTime() - start.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
