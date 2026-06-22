import { CreateUserInput, UpdateUserInput, UserQueryInput } from './users.schema.js';
declare class UsersService {
    list(query: UserQueryInput): Promise<{
        data: {
            store: {
                id: number;
                name: string;
            } | null;
            email: string;
            fullName: string;
            role: string;
            storeId: number | null;
            id: number;
            isActive: boolean;
            createdAt: Date;
        }[];
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
        } | null;
        email: string;
        fullName: string;
        role: string;
        storeId: number | null;
        id: number;
        isActive: boolean;
        createdAt: Date;
    }>;
    create(input: CreateUserInput): Promise<{
        email: string;
        fullName: string;
        role: string;
        storeId: number | null;
        id: number;
        isActive: boolean;
        createdAt: Date;
    }>;
    update(id: number, input: UpdateUserInput): Promise<{
        email: string;
        fullName: string;
        role: string;
        storeId: number | null;
        id: number;
        isActive: boolean;
        createdAt: Date;
    }>;
    deactivate(id: number): Promise<{
        message: string;
    }>;
}
export declare const usersService: UsersService;
export {};
//# sourceMappingURL=users.service.d.ts.map