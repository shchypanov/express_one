import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import prisma from '../lib/prisma';
import { RefreshToken } from '../../generated/prisma/client';

const SALT_ROUNDS = 10;

interface TokenPayload {
  userId: number;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: number): string {
  return jwt.sign(
    { userId },
    config.jwtAccessSecret,
    { expiresIn: config.jwtAccessExpiresIn }
  );
}

export function generateRefreshToken(userId: number): string {
  return jwt.sign(
    { userId },
    config.jwtRefreshSecret,
    { expiresIn: config.jwtRefreshExpiresIn }
  );
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtAccessSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as TokenPayload;
  } catch (error) {
    return null;
  }
}

export async function createRefreshToken(userId: number): Promise<RefreshToken> {
  const token = generateRefreshToken(userId);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  return prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });
}