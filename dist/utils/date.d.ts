export interface DateRange {
    from: Date;
    to: Date;
}
export declare function parseDate(dateStr: string): Date;
export declare function parseDateRange(fromStr?: string, toStr?: string): DateRange;
export declare function formatDate(date: Date): string;
export declare function getStartOfDay(date: Date): Date;
export declare function getEndOfDay(date: Date): Date;
export declare function getStartOfMonth(date: Date): Date;
export declare function getEndOfMonth(date: Date): Date;
export declare function daysBetween(start: Date, end: Date): number;
//# sourceMappingURL=date.d.ts.map