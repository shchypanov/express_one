import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  createRefreshToken,
} from '../services/auth.service';
import { config } from '../config/env';
import { BadRequest, Unauthorized, Conflict } from '../middleware/error.middleware';

// ========== TYPES ==========
interface SignupBody {
  email: string;
  password: string;
  name: string;
}

interface SigninBody {
  email: string;
  password: string;
}

// ========== CONTROLLERS ==========

// POST /auth/signup
export async function signup(req: Request<{}, {}, SignupBody>, res: Response) {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    throw BadRequest('Missing email, name or password');
  }

  const userExists = await prisma.user.findUnique({where: {email}});
  if (userExists) {
    throw Conflict('User already exists');
  }

  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
    }
  })

  const refreshToken = await createRefreshToken(user.id);
  const accessToken = generateAccessToken(user.id);
  
  res.cookie('refreshToken', refreshToken.token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(201).json({accessToken, user: {id: user.id, email, name}});
}

// POST /auth/signin
export async function signin(req: Request<{}, {}, SigninBody>, res: Response) {
  const {email, password} = req.body;

  if (!email || !password) {
    throw BadRequest('Wrong email or password');
  }

  const user = await prisma.user.findUnique({where: {email}});

  if (!user) {
    throw Unauthorized('Invalid credentials');
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    throw Unauthorized('Invalid credentials');
  }
  const refreshToken = await createRefreshToken(user.id);
  const accessToken = generateAccessToken(user.id);
  res.cookie('refreshToken', refreshToken.token, {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({accessToken, user: {id: user.id, email, name: user.name}});
}

// POST /auth/refresh
export async function refresh(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw Unauthorized('Unauthorized');
  }

  const decoded = verifyRefreshToken(refreshToken);

  if (!decoded) {
    throw Unauthorized('Unauthorized');
  }

  const refreshTokenExists = await prisma.refreshToken.findUnique({where: {token: refreshToken}});

  if (!refreshTokenExists) {
    throw Unauthorized('Unauthorized');
  }

  if (refreshTokenExists.expiresAt < new Date()) {
    await prisma.refreshToken.delete({where: {id: refreshTokenExists.id}})
    res.clearCookie('refreshToken');
    throw Unauthorized('Unauthorized');
  }

  const accessToken = generateAccessToken(decoded.userId);
  return res.status(200).json({accessToken});
}

// POST /auth/signout
export async function signout(req: Request, res: Response) {
  const refreshToken = req.cookies.refreshToken;

  if (refreshToken) {
    // Просто пробуємо видалити, ігноруємо помилки
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    });
  }

  res.clearCookie('refreshToken');
  return res.status(200).json({ message: 'Signed out successfully' });
}