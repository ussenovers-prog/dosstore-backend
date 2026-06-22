export interface DateFilter {
    storeId?: number;
    dateFrom?: string;
    dateTo?: string;
}
export declare function getRevenue(filter: DateFilter): Promise<number>;
export declare function getGrossProfit(filter: DateFilter): Promise<number>;
export declare function getNetProfit(filter: DateFilter): Promise<number>;
export declare function getAvgCheck(filter: DateFilter): Promise<number>;
export declare function getMargin(filter: DateFilter): Promise<number>;
export declare function getAdSpend(filter: DateFilter): Promise<number>;
export declare function getCAC(filter: DateFilter): Promise<number>;
export declare function getAdROI(filter: DateFilter): Promise<number>;
export declare function getDRR(filter: DateFilter): Promise<number>;
export declare function getTotalVisitors(filter: DateFilter): Promise<number>;
export declare function getTotalBuyers(filter: DateFilter): Promise<number>;
export declare function getConversion(filter: DateFilter): Promise<number>;
export declare function getInventorySummary(filter: DateFilter): Promise<{
    totalValue: number;
    totalItems: number;
    snapshotDate: null;
} | {
    totalValue: any;
    totalItems: number;
    snapshotDate: Date;
}>;
export declare function getNoMovementProducts(filter: DateFilter, days?: number): Promise<{
    id: number;
    name: string;
    article: string | null;
    brand: string | null;
}[]>;
export declare function getLowStockProducts(filter: DateFilter, threshold?: number): Promise<{
    productId: number;
    productName: string;
    article: string | null;
    brand: string | null;
    quantity: number;
    totalValue: any;
}[]>;
export declare function getInventoryTurnover(filter: DateFilter): Promise<number>;
export declare function getTopProducts(filter: DateFilter & {
    limit?: number;
}): Promise<{
    productId: number;
    productName: string;
    article: string | null | undefined;
    brand: string | null | undefined;
    totalAmount: any;
    quantity: number;
}[]>;
export declare function getAbcAnalysis(filter: DateFilter): Promise<{
    a: never[];
    b: never[];
    c: never[];
} | {
    a: {
        items: {
            productId: number;
            productName: string;
            article: string | null | undefined;
            brand: string | null | undefined;
            totalAmount: any;
            quantity: number;
        }[];
        revenueShare: number;
    };
    b: {
        items: {
            productId: number;
            productName: string;
            article: string | null | undefined;
            brand: string | null | undefined;
            totalAmount: any;
            quantity: number;
        }[];
        revenueShare: number;
    };
    c: {
        items: {
            productId: number;
            productName: string;
            article: string | null | undefined;
            brand: string | null | undefined;
            totalAmount: any;
            quantity: number;
        }[];
        revenueShare: number;
    };
}>;
export declare function getStoresComparison(filter: DateFilter): Promise<{
    storeId: number;
    storeName: string;
    revenue: number;
    grossProfit: number;
    netProfit: number;
    adSpend: number;
    visitors: number;
    buyers: number;
    conversion: number;
    avgCheck: number;
}[]>;
export declare function getSalesDynamic(filter: DateFilter & {
    granularity?: string;
}): Promise<{
    date: string;
    revenue: number;
    storeId: number;
}[]>;
export declare function getExpenseBreakdown(filter: DateFilter): Promise<{
    category: string;
    total: any;
}[]>;
//# sourceMappingURL=dashboard.queries.d.ts.map