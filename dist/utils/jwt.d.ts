export interface JwtPayload {
    userId: number;
    email: string;
    role: 'owner' | 'employee';
    storeId: number | null;
}
export declare function signAccessToken(payload: JwtPayload): string;
export declare function signRefreshToken(payload: JwtPayload): string;
export declare function verifyToken(token: string): JwtPayload;
export declare function decodeToken(token: string): JwtPayload | null;
//# sourceMappingURL=jwt.d.ts.map