import { RegisterInput, LoginInput } from './auth.schema.js';
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface AuthResponse {
    user: {
        id: number;
        email: string;
        fullName: string;
        role: string;
        storeId: number | null;
    };
    tokens: AuthTokens;
}
declare class AuthService {
    register(input: RegisterInput): Promise<AuthResponse>;
    login(input: LoginInput): Promise<AuthResponse>;
    refresh(refreshToken: string): Promise<AuthTokens>;
    private generateTokens;
}
export declare const authService: AuthService;
export {};
//# sourceMappingURL=auth.service.d.ts.map