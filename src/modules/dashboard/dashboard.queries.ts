import prisma from '../../utils/prisma.js';
import { Prisma } from '@prisma/client';

export interface DateFilter {
  storeId?: number;
  dateFrom?: string;
  dateTo?: string;
}

function buildDateFilter(dateFrom?: string, dateTo?: string): Prisma.DateTimeFilter | undefined {
  if (!dateFrom && !dateTo) return undefined;
  const filter: Prisma.DateTimeFilter = {};
  if (dateFrom) filter.gte = new Date(dateFrom);
  if (dateTo) filter.lte = new Date(dateTo);
  return filter;
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) return 0;
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
  if (typeof value === 'object' && 'toNumber' in value) {
    const decimal = value as { toNumber?: () => number };
    if (typeof decimal.toNumber === 'function') return decimal.toNumber();
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function buildInventoryWhere(filter: DateFilter): Prisma.InventoryWhereInput {
  const where: Prisma.InventoryWhereInput = {};
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.snapshotDate = dateFilter;
  return where;
}

async function getLatestInventorySnapshot(filter: DateFilter): Promise<Date | null> {
  const latestSnapshot = await prisma.inventory.findFirst({
    where: buildInventoryWhere(filter),
    orderBy: { snapshotDate: 'desc' },
    select: { snapshotDate: true },
  });

  return latestSnapshot?.snapshotDate ?? null;
}

// ============================================================
// FINANCIAL KPIs
// ============================================================

export async function getRevenue(filter: DateFilter): Promise<number> {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.SaleWhereInput = {};
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.saleDate = dateFilter;

  const result = await prisma.sale.aggregate({
    where,
    _sum: { totalAmount: true },
  });

  return toNumber(result._sum.totalAmount);
}

export async function getGrossProfit(filter: DateFilter): Promise<number> {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.GrossProfitWhereInput = {};
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.periodDate = dateFilter;

  const result = await prisma.grossProfit.aggregate({
    where,
    _sum: { grossProfit: true },
  });

  return toNumber(result._sum.grossProfit);
}

export async function getNetProfit(filter: DateFilter): Promise<number> {
  const grossProfit = await getGrossProfit(filter);

  const expenseDateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const expenseWhere: Prisma.ExpenseWhereInput = {};
  if (filter.storeId) expenseWhere.storeId = filter.storeId;
  if (expenseDateFilter) expenseWhere.expenseDate = expenseDateFilter;

  const expensesResult = await prisma.expense.aggregate({
    where: expenseWhere,
    _sum: { amount: true },
  });

  const totalExpenses = toNumber(expensesResult._sum.amount);
  return grossProfit - totalExpenses;
}

export async function getAvgCheck(filter: DateFilter): Promise<number> {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.SaleWhereInput = {};
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.saleDate = dateFilter;

  const result = await prisma.sale.groupBy({
    by: ['beksarDocId'],
    where,
    _sum: { totalAmount: true },
  });

  if (result.length === 0) return 0;
  const totalRevenue = result.reduce((sum, r) => sum + toNumber(r._sum.totalAmount), 0);
  return totalRevenue / result.length;
}

export async function getMargin(filter: DateFilter): Promise<number> {
  const revenue = await getRevenue(filter);
  if (revenue === 0) return 0;
  const grossProfit = await getGrossProfit(filter);
  return (grossProfit / revenue) * 100;
}

// ============================================================
// MARKETING KPIs
// ============================================================

export async function getAdSpend(filter: DateFilter): Promise<number> {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.ExpenseWhereInput = { category: 'target_ads' };
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.expenseDate = dateFilter;

  const result = await prisma.expense.aggregate({
    where,
    _sum: { amount: true },
  });

  return toNumber(result._sum.amount);
}

export async function getCAC(filter: DateFilter): Promise<number> {
  const adSpend = await getAdSpend(filter);
  const buyers = await getTotalBuyers(filter);
  if (buyers === 0) return 0;
  return adSpend / buyers;
}

export async function getAdROI(filter: DateFilter): Promise<number> {
  const revenue = await getRevenue(filter);
  const adSpend = await getAdSpend(filter);
  if (adSpend === 0) return 0;
  return (revenue - adSpend) / adSpend;
}

export async function getDRR(filter: DateFilter): Promise<number> {
  const revenue = await getRevenue(filter);
  if (revenue === 0) return 0;
  const adSpend = await getAdSpend(filter);
  return (adSpend / revenue) * 100;
}

// ============================================================
// OPERATIONAL KPIs
// ============================================================

export async function getTotalVisitors(filter: DateFilter): Promise<number> {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.VisitorWhereInput = {};
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.visitDate = dateFilter;

  const result = await prisma.visitor.aggregate({
    where,
    _sum: { count: true },
  });

  return result._sum.count || 0;
}

export async function getTotalBuyers(filter: DateFilter): Promise<number> {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.VisitorWhereInput = {};
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.visitDate = dateFilter;

  const result = await prisma.visitor.aggregate({
    where,
    _sum: { buyersCount: true },
  });

  return result._sum.buyersCount || 0;
}

export async function getConversion(filter: DateFilter): Promise<number> {
  const visitors = await getTotalVisitors(filter);
  if (visitors === 0) return 0;
  const buyers = await getTotalBuyers(filter);
  return (buyers / visitors) * 100;
}

// ============================================================
// INVENTORY KPIs
// ============================================================

export async function getInventorySummary(filter: DateFilter) {
  const where = buildInventoryWhere(filter);
  const latestSnapshot = await getLatestInventorySnapshot(filter);

  if (!latestSnapshot) {
    return { totalValue: 0, totalItems: 0, snapshotDate: null };
  }

  const result = await prisma.inventory.aggregate({
    where: {
      ...where,
      snapshotDate: latestSnapshot,
    },
    _sum: { totalValue: true, quantity: true },
  });

  return {
    totalValue: toNumber(result._sum.totalValue),
    totalItems: result._sum.quantity || 0,
    snapshotDate: latestSnapshot,
  };
}

export async function getNoMovementProducts(filter: DateFilter, days: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const latestSnapshot = await getLatestInventorySnapshot(filter);
  if (!latestSnapshot) return [];

  const items = await prisma.inventory.findMany({
    where: {
      ...buildInventoryWhere(filter),
      snapshotDate: latestSnapshot,
    },
    include: {
      product: { select: { id: true, name: true, article: true, brand: true } },
    },
  });

  const productIds = items.map((item) => item.productId);
  const soldProducts = await prisma.sale.findMany({
    where: {
      productId: { in: productIds },
      saleDate: { gte: cutoffDate },
      ...(filter.storeId ? { storeId: filter.storeId } : {}),
    },
    select: { productId: true },
    distinct: ['productId'],
  });
  const soldProductIds = new Set(soldProducts.map((sale) => sale.productId));

  return items.filter((item) => !soldProductIds.has(item.productId)).map((item) => ({
    id: item.product.id,
    name: item.product.name,
    article: item.product.article,
    brand: item.product.brand,
  }));
}

export async function getLowStockProducts(filter: DateFilter, threshold: number = 5) {
  const where: Prisma.InventoryWhereInput = {
    ...buildInventoryWhere(filter),
    quantity: { lte: threshold },
  };
  const latestSnapshot = await getLatestInventorySnapshot(filter);

  if (!latestSnapshot) return [];

  const items = await prisma.inventory.findMany({
    where: {
      ...where,
      snapshotDate: latestSnapshot,
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
    totalValue: toNumber(item.totalValue),
  }));
}

export async function getInventoryTurnover(filter: DateFilter): Promise<number> {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const cogsWhere: Prisma.GrossProfitWhereInput = {};
  if (filter.storeId) cogsWhere.storeId = filter.storeId;
  if (dateFilter) cogsWhere.periodDate = dateFilter;

  const cogsResult = await prisma.grossProfit.aggregate({
    where: cogsWhere,
    _sum: { costOfGoods: true },
  });

  const cogs = toNumber(cogsResult._sum.costOfGoods);

  const invSummary = await getInventorySummary(filter);
  if (invSummary.totalValue === 0) return 0;

  return cogs / invSummary.totalValue;
}

// ============================================================
// TOP PRODUCTS
// ============================================================

export async function getTopProducts(filter: DateFilter & { limit?: number }) {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.SaleWhereInput = {};
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.saleDate = dateFilter;

  const results = await prisma.sale.groupBy({
    by: ['productId'],
    where,
    _sum: { totalAmount: true, quantity: true },
    orderBy: { _sum: { totalAmount: 'desc' } },
    take: filter.limit || 20,
  });

  const productIds = results.map((r) => r.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, article: true, brand: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  return results.map((r) => ({
    productId: r.productId,
    productName: productMap.get(r.productId)?.name || 'Unknown',
    article: productMap.get(r.productId)?.article,
    brand: productMap.get(r.productId)?.brand,
    totalAmount: toNumber(r._sum.totalAmount),
    quantity: r._sum.quantity || 0,
  }));
}

// ============================================================
// ABC ANALYSIS
// ============================================================

export async function getAbcAnalysis(filter: DateFilter) {
  const products = await getTopProducts({ ...filter, limit: 1000 });

  const totalRevenue = products.reduce((sum, p) => sum + p.totalAmount, 0);
  if (totalRevenue === 0) return { a: [], b: [], c: [] };

  let cumulative = 0;
  const a: typeof products = [];
  const b: typeof products = [];
  const c: typeof products = [];

  for (const product of products) {
    cumulative += product.totalAmount;
    const share = (cumulative / totalRevenue) * 100;

    if (share <= 80) {
      a.push(product);
    } else if (share <= 95) {
      b.push(product);
    } else {
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

export async function getStoresComparison(filter: DateFilter) {
  const stores = await prisma.store.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  const comparisons = await Promise.all(
    stores.map(async (store) => {
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
    })
  );

  return comparisons;
}

// ============================================================
// SALES DYNAMIC
// ============================================================

export async function getSalesDynamic(filter: DateFilter & { granularity?: string }) {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.SaleWhereInput = {};
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.saleDate = dateFilter;

  const sales = await prisma.sale.findMany({
    where,
    select: { saleDate: true, totalAmount: true, storeId: true },
    orderBy: { saleDate: 'asc' },
  });

  // Group by date
  const grouped = new Map<string, { date: string; revenue: number; storeId: number }>();

  for (const sale of sales) {
    const dateKey = sale.saleDate.toISOString().split('T')[0];
    const existing = grouped.get(dateKey);
    if (existing) {
      existing.revenue += toNumber(sale.totalAmount);
    } else {
      grouped.set(dateKey, {
        date: dateKey,
        revenue: toNumber(sale.totalAmount),
        storeId: sale.storeId,
      });
    }
  }

  return Array.from(grouped.values()).sort((a, b) => a.date.localeCompare(b.date));
}

// ============================================================
// EXPENSE BREAKDOWN
// ============================================================

export async function getExpenseBreakdown(filter: DateFilter) {
  const dateFilter = buildDateFilter(filter.dateFrom, filter.dateTo);
  const where: Prisma.ExpenseWhereInput = {};
  if (filter.storeId) where.storeId = filter.storeId;
  if (dateFilter) where.expenseDate = dateFilter;

  const results = await prisma.expense.groupBy({
    by: ['category'],
    where,
    _sum: { amount: true },
  });

  return results.map((r) => ({
    category: r.category,
    total: toNumber(r._sum.amount),
  }));
}
