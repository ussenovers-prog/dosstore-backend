import { CreateStoreInput, UpdateStoreInput } from './stores.schema.js';
declare class StoresService {
    list(): Promise<{
        data: {
            code: string;
            id: number;
            isActive: boolean;
            createdAt: Date;
            name: string;
            address: string | null;
            _count: {
                users: number;
                products: number;
            };
        }[];
    }>;
    getById(id: number): Promise<{
        code: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
        _count: {
            users: number;
            products: number;
        };
    }>;
    create(input: CreateStoreInput): Promise<{
        code: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
    }>;
    update(id: number, input: UpdateStoreInput): Promise<{
        code: string;
        id: number;
        isActive: boolean;
        createdAt: Date;
        name: string;
        address: string | null;
    }>;
    deactivate(id: number): Promise<{
        message: string;
    }>;
}
export declare const storesService: StoresService;
export {};
//# sourceMappingURL=stores.service.d.ts.map