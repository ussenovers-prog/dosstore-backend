import { Request } from 'express';

export interface AuthUser {
  userId: number;
  email: string;
  role: 'owner' | 'employee';
  storeId: number | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}
