import { DashboardQueryInput, TopProductsQueryInput, AbcAnalysisQueryInput } from './dashboard.schema.js';
declare class DashboardService {
    getKPIs(query: DashboardQueryInput): Promise<{
        revenue: number;
        grossProfit: number;
        netProfit: number;
        avgCheck: number;
        margin: number;
        adSpend: number;
        cac: number;
        adROI: number;
        drr: number;
        visitors: number;
        buyers: number;
        conversion: number;
        inventoryValue: any;
        inventoryItems: number;
    }>;
    getSalesDynamic(query: DashboardQueryInput): Promise<{
        date: string;
        revenue: number;
        storeId: number;
    }[]>;
    getStoresComparison(query: DashboardQueryInput): Promise<{
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
    getTopProducts(query: TopProductsQueryInput): Promise<{
        productId: number;
        productName: string;
        article: string | null | undefined;
        brand: string | null | undefined;
        totalAmount: any;
        quantity: number;
    }[]>;
    getAbcAnalysis(query: AbcAnalysisQueryInput): Promise<{
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
    getExpenseBreakdown(query: DashboardQueryInput): Promise<{
        category: string;
        total: any;
    }[]>;
    getInventorySummary(query: DashboardQueryInput): Promise<{
        totalValue: number;
        totalItems: number;
        snapshotDate: null;
    } | {
        totalValue: any;
        totalItems: number;
        snapshotDate: Date;
    }>;
    getNoMovementProducts(query: DashboardQueryInput): Promise<{
        id: number;
        name: string;
        article: string | null;
        brand: string | null;
    }[]>;
    getLowStockProducts(query: DashboardQueryInput): Promise<{
        productId: number;
        productName: string;
        article: string | null;
        brand: string | null;
        quantity: number;
        totalValue: any;
    }[]>;
    getInventoryTurnover(query: DashboardQueryInput): Promise<number>;
}
export declare const dashboardService: DashboardService;
export {};
//# sourceMappingURL=dashboard.service.d.ts.map