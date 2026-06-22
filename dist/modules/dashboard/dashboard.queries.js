"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRevenue = getRevenue;
exports.getGrossProfit = getGrossProfit;
exports.getNetProfit = getNetProfit;
exports.getAvgCheck = getAvgCheck;
exports.getMargin = getMargin;
exports.getAdSpend = getAdSpend;
exports.getCAC = getCAC;
exports.getAdROI = getAdROI;
exports.getDRR = getDRR;
exports.getTotalVisitors = getTotalVisitors;
exports.getTotalBuyers = getTotalBuyers;
exports.getConversion = getConversion;
exports.getInventorySummary = getInventorySummary;
exports.getNoMovementProducts = getNoMovementProducts;
exports.getLowStockProducts = getLowStockProducts;
exports.getInventoryTurnover = getInventoryTurnover;
exports.getTopProducts = getTopProducts;
exports.getAbcAnalysis = getAbcAnalysis;
exports.getStoresComparison = getStoresComparison;
exports.getSalesDynamic = getSalesDynamic;
exports.getExpenseBreakdown = getExpenseBreakdown;
const prisma_js_1 = __importDefault(require("../../utils/prisma.js"));
function buildDateFilter(dateFrom, dateTo) {
    if (!dateFrom && !dateTo)
        return undefined;
    const filter = {};
    if (dateFrom)
        filter.gte = new Date(dateFrom);
    if (dateTo)
        filter.lte = new Date(dateTo);
    return filter;
}
// ============================================================
// FINANCIAL KPIs
// ============================================================
async function getRevenue(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.saleDate = dateFilter;
    const result = await prisma_js_1.default.sale.aggregate({
        where,
        _sum: { totalAmount: true },
    });
    return result._sum.totalAmount?.toNumber() || 0;
}
async function getGrossProfit(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.periodDate = dateFilter;
    const result = await prisma_js_1.default.grossProfit.aggregate({
        where,
        _sum: { grossProfit: true },
    });
    return result._sum.grossProfit?.toNumber() || 0;
}
async function getNetProfit(filter) {
    const grossProfit = await getGrossProfit(filter);
    const expenseDateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const expenseWhere = {};
    if (filter.storeId)
        expenseWhere.storeId = filter.storeId;
    if (expenseDateFilter)
        expenseWhere.expenseDate = expenseDateFilter;
    const expensesResult = await prisma_js_1.default.expense.aggregate({
        where: expenseWhere,
        _sum: { amount: true },
    });
    const totalExpenses = expensesResult._sum.amount?.toNumber() || 0;
    return grossProfit - totalExpenses;
}
async function getAvgCheck(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.saleDate = dateFilter;
    const result = await prisma_js_1.default.sale.groupBy({
        by: ['beksarDocId'],
        where,
        _sum: { totalAmount: true },
    });
    if (result.length === 0)
        return 0;
    const totalRevenue = result.reduce((sum, r) => sum + (r._sum.totalAmount?.toNumber() || 0), 0);
    return totalRevenue / result.length;
}
async function getMargin(filter) {
    const revenue = await getRevenue(filter);
    if (revenue === 0)
        return 0;
    const grossProfit = await getGrossProfit(filter);
    return (grossProfit / revenue) * 100;
}
// ============================================================
// MARKETING KPIs
// ============================================================
async function getAdSpend(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = { category: 'target_ads' };
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.expenseDate = dateFilter;
    const result = await prisma_js_1.default.expense.aggregate({
        where,
        _sum: { amount: true },
    });
    return result._sum.amount?.toNumber() || 0;
}
async function getCAC(filter) {
    const adSpend = await getAdSpend(filter);
    const buyers = await getTotalBuyers(filter);
    if (buyers === 0)
        return 0;
    return adSpend / buyers;
}
async function getAdROI(filter) {
    const revenue = await getRevenue(filter);
    const adSpend = await getAdSpend(filter);
    if (adSpend === 0)
        return 0;
    return (revenue - adSpend) / adSpend;
}
async function getDRR(filter) {
    const revenue = await getRevenue(filter);
    if (revenue === 0)
        return 0;
    const adSpend = await getAdSpend(filter);
    return (adSpend / revenue) * 100;
}
// ============================================================
// OPERATIONAL KPIs
// ============================================================
async function getTotalVisitors(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.visitDate = dateFilter;
    const result = await prisma_js_1.default.visitor.aggregate({
        where,
        _sum: { count: true },
    });
    return result._sum.count || 0;
}
async function getTotalBuyers(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.visitDate = dateFilter;
    const result = await prisma_js_1.default.visitor.aggregate({
        where,
        _sum: { buyersCount: true },
    });
    return result._sum.buyersCount || 0;
}
async function getConversion(filter) {
    const visitors = await getTotalVisitors(filter);
    if (visitors === 0)
        return 0;
    const buyers = await getTotalBuyers(filter);
    return (buyers / visitors) * 100;
}
// ============================================================
// INVENTORY KPIs
// ============================================================
async function getInventorySummary(filter) {
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    // Get latest snapshot
    const latestSnapshot = await prisma_js_1.default.inventory.findFirst({
        where,
        orderBy: { snapshotDate: 'desc' },
        select: { snapshotDate: true },
    });
    if (!latestSnapshot) {
        return { totalValue: 0, totalItems: 0, snapshotDate: null };
    }
    const result = await prisma_js_1.default.inventory.aggregate({
        where: {
            ...where,
            snapshotDate: latestSnapshot.snapshotDate,
        },
        _sum: { totalValue: true, quantity: true },
    });
    return {
        totalValue: result._sum.totalValue?.toNumber() || 0,
        totalItems: result._sum.quantity || 0,
        snapshotDate: latestSnapshot.snapshotDate,
    };
}
async function getNoMovementProducts(filter, days = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    const products = await prisma_js_1.default.product.findMany({
        where,
        select: {
            id: true,
            name: true,
            article: true,
            brand: true,
            _count: {
                select: {
                    sales: {
                        where: {
                            saleDate: { gte: cutoffDate },
                        },
                    },
                },
            },
        },
    });
    return products.filter((p) => p._count.sales === 0).map((p) => ({
        id: p.id,
        name: p.name,
        article: p.article,
        brand: p.brand,
    }));
}
async function getLowStockProducts(filter, threshold = 5) {
    const where = {
        quantity: { lte: threshold },
    };
    if (filter.storeId)
        where.storeId = filter.storeId;
    const latestSnapshot = await prisma_js_1.default.inventory.findFirst({
        where: { storeId: filter.storeId },
        orderBy: { snapshotDate: 'desc' },
        select: { snapshotDate: true },
    });
    if (!latestSnapshot)
        return [];
    const items = await prisma_js_1.default.inventory.findMany({
        where: {
            ...where,
            snapshotDate: latestSnapshot.snapshotDate,
        },
        include: {
            product: { select: { id: true, name: true, article: true, brand: true } },
        },
        orderBy: { quantity: 'asc' },
    });
    return items.map((item) => ({
        productId: item.productId,
        productName: item.product.name,
        article: item.product.article,
        brand: item.product.brand,
        quantity: item.quantity,
        totalValue: item.totalValue.toNumber(),
    }));
}
async function getInventoryTurnover(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const cogsWhere = {};
    if (filter.storeId)
        cogsWhere.storeId = filter.storeId;
    if (dateFilter)
        cogsWhere.periodDate = dateFilter;
    const cogsResult = await prisma_js_1.default.grossProfit.aggregate({
        where: cogsWhere,
        _sum: { costOfGoods: true },
    });
    const cogs = cogsResult._sum.costOfGoods?.toNumber() || 0;
    const invSummary = await getInventorySummary(filter);
    if (invSummary.totalValue === 0)
        return 0;
    return cogs / invSummary.totalValue;
}
// ============================================================
// TOP PRODUCTS
// ============================================================
async function getTopProducts(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.saleDate = dateFilter;
    const results = await prisma_js_1.default.sale.groupBy({
        by: ['productId'],
        where,
        _sum: { totalAmount: true, quantity: true },
        orderBy: { _sum: { totalAmount: 'desc' } },
        take: filter.limit || 20,
    });
    const productIds = results.map((r) => r.productId);
    const products = await prisma_js_1.default.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, article: true, brand: true },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));
    return results.map((r) => ({
        productId: r.productId,
        productName: productMap.get(r.productId)?.name || 'Unknown',
        article: productMap.get(r.productId)?.article,
        brand: productMap.get(r.productId)?.brand,
        totalAmount: r._sum.totalAmount?.toNumber() || 0,
        quantity: r._sum.quantity || 0,
    }));
}
// ============================================================
// ABC ANALYSIS
// ============================================================
async function getAbcAnalysis(filter) {
    const products = await getTopProducts({ ...filter, limit: 1000 });
    const totalRevenue = products.reduce((sum, p) => sum + p.totalAmount, 0);
    if (totalRevenue === 0)
        return { a: [], b: [], c: [] };
    let cumulative = 0;
    const a = [];
    const b = [];
    const c = [];
    for (const product of products) {
        cumulative += product.totalAmount;
        const share = (cumulative / totalRevenue) * 100;
        if (share <= 80) {
            a.push(product);
        }
        else if (share <= 95) {
            b.push(product);
        }
        else {
            c.push(product);
        }
    }
    return {
        a: { items: a, revenueShare: a.reduce((s, p) => s + p.totalAmount, 0) / totalRevenue * 100 },
        b: { items: b, revenueShare: b.reduce((s, p) => s + p.totalAmount, 0) / totalRevenue * 100 },
        c: { items: c, revenueShare: c.reduce((s, p) => s + p.totalAmount, 0) / totalRevenue * 100 },
    };
}
// ============================================================
// STORES COMPARISON
// ============================================================
async function getStoresComparison(filter) {
    const stores = await prisma_js_1.default.store.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
    });
    const comparisons = await Promise.all(stores.map(async (store) => {
        const storeFilter = { ...filter, storeId: store.id };
        const [revenue, grossProfit, netProfit, adSpend, visitors, buyers] = await Promise.all([
            getRevenue(storeFilter),
            getGrossProfit(storeFilter),
            getNetProfit(storeFilter),
            getAdSpend(storeFilter),
            getTotalVisitors(storeFilter),
            getTotalBuyers(storeFilter),
        ]);
        return {
            storeId: store.id,
            storeName: store.name,
            revenue,
            grossProfit,
            netProfit,
            adSpend,
            visitors,
            buyers,
            conversion: visitors > 0 ? (buyers / visitors) * 100 : 0,
            avgCheck: buyers > 0 ? revenue / buyers : 0,
        };
    }));
    return comparisons;
}
// ============================================================
// SALES DYNAMIC
// ============================================================
async function getSalesDynamic(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.saleDate = dateFilter;
    const sales = await prisma_js_1.default.sale.findMany({
        where,
        select: { saleDate: true, totalAmount: true, storeId: true },
        orderBy: { saleDate: 'asc' },
    });
    // Group by date
    const grouped = new Map();
    for (const sale of sales) {
        const dateKey = sale.saleDate.toISOString().split('T')[0];
        const existing = grouped.get(dateKey);
        if (existing) {
            existing.revenue += sale.totalAmount.toNumber();
        }
        else {
            grouped.set(dateKey, {
                date: dateKey,
                revenue: sale.totalAmount.toNumber(),
                storeId: sale.storeId,
            });
        }
    }
    return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
}
// ============================================================
// EXPENSE BREAKDOWN
// ============================================================
async function getExpenseBreakdown(filter) {
    const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
    const where = {};
    if (filter.storeId)
        where.storeId = filter.storeId;
    if (dateFilter)
        where.expenseDate = dateFilter;
    const results = await prisma_js_1.default.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
    });
    return results.map((r) => ({
        category: r.category,
        total: r._sum.amount?.toNumber() || 0,
    }));
}
//# sourceMappingURL=dashboard.queries.js.map