import { CreateVisitorInput, UpdateVisitorInput, VisitorQueryInput } from './visitors.schema.js';
declare class VisitorsService {
    list(query: VisitorQueryInput): Promise<{
        data: ({
            store: {
                id: number;
                name: string;
            };
            enterer: {
                fullName: string;
                id: number;
            } | null;
        } & {
            storeId: number;
            id: number;
            createdAt: Date;
            updatedAt: Date;
            visitDate: Date;
            count: number;
            buyersCount: number;
            enteredBy: number | null;
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
        enterer: {
            fullName: string;
            id: number;
        } | null;
    } & {
        storeId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        visitDate: Date;
        count: number;
        buyersCount: number;
        enteredBy: number | null;
    }>;
    upsert(input: CreateVisitorInput, userId: number): Promise<{
        store: {
            id: number;
            name: string;
        };
    } & {
        storeId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        visitDate: Date;
        count: number;
        buyersCount: number;
        enteredBy: number | null;
    }>;
    update(id: number, input: UpdateVisitorInput): Promise<{
        store: {
            id: number;
            name: string;
        };
    } & {
        storeId: number;
        id: number;
        createdAt: Date;
        updatedAt: Date;
        visitDate: Date;
        count: number;
        buyersCount: number;
        enteredBy: number | null;
    }>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
export declare const visitorsService: VisitorsService;
export {};
//# sourceMappingURL=visitors.service.d.ts.map