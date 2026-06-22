import { CreateExpenseInput, UpdateExpenseInput, ExpenseQueryInput } from './expenses.schema.js';
declare class ExpensesService {
    list(query: ExpenseQueryInput): Promise<{
        data: ({
            store: {
                id: number;
                name: string;
            };
            creator: {
                fullName: string;
                id: number;
            } | null;
        } & {
            storeId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            source: string | null;
            category: string;
            expenseDate: Date;
            amount: number;
            description: string | null;
            isRecurring: boolean;
            campaignName: string | null;
            channel: string | null;
            createdBy: number | null;
        })[];
        meta: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
    getById(id: number): Promise<{
        store: {
            id: number;
            name: string;
        };
        creator: {
            fullName: string;
            id: number;
        } | null;
    } & {
        storeId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        category: string;
        expenseDate: Date;
        amount: number;
        description: string | null;
        isRecurring: boolean;
        campaignName: string | null;
        channel: string | null;
        createdBy: number | null;
    }>;
    create(input: CreateExpenseInput, userId: number): Promise<{
        store: {
            id: number;
            name: string;
        };
    } & {
        storeId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        category: string;
        expenseDate: Date;
        amount: number;
        description: string | null;
        isRecurring: boolean;
        campaignName: string | null;
        channel: string | null;
        createdBy: number | null;
    }>;
    update(id: number, input: UpdateExpenseInput): Promise<{
        store: {
            id: number;
            name: string;
        };
    } & {
        storeId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        source: string | null;
        category: string;
        expenseDate: Date;
        amount: number;
        description: string | null;
        isRecurring: boolean;
        campaignName: string | null;
        channel: string | null;
        createdBy: number | null;
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
export declare const expensesService: ExpensesService;
export {};
//# sourceMappingURL=expenses.service.d.ts.map