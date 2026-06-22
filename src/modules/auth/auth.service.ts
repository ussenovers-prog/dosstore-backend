import prisma from '../../utils/prisma.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import { signAccessToken, signRefreshToken, verifyToken, JwtPayload } from '../../utils/jwt.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { AppError } from '../../middleware/errorHandler.js';

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

class AuthService {
  async register(input: RegisterInput): Promise<AuthResponse> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new AppError('Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Only owner can create owner accounts
    if (input.role === 'owner') {
      const ownerCount = await prisma.user.count({
        where: { role: 'owner' },
      });
      if (ownerCount > 0) {
        throw new AppError('Only one owner is allowed', 403, 'OWNER_EXISTS');
      }
    }

    // Validate store exists if storeId provided
    if (input.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: input.storeId },
      });
      if (!store) {
        throw new AppError('Store not found', 404, 'STORE_NOT_FOUND');
      }
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        fullName: input.fullName,
        role: input.role,
        storeId: input.storeId,
      },
    });

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        storeId: user.storeId,
      },
      tokens,
    };
  }

  async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 403, 'ACCOUNT_INACTIVE');
    }

    const isValidPassword = await comparePassword(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const tokens = this.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        storeId: user.storeId,
      },
      tokens,
    };
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = verifyToken(refreshToken);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user || !user.isActive) {
        throw new AppError('User not found or inactive', 401, 'INVALID_TOKEN');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_TOKEN');
    }
  }

  private generateTokens(user: {
    id: number;
    email: string;
    role: string;
    storeId: number | null;
  }): AuthTokens {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role as 'owner' | 'employee',
      storeId: user.storeId,
    };

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    };
  }
}

export const authService = new AuthService();
