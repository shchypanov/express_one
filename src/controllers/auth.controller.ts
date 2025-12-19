import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  createRefreshToken,
} from '../services/auth.service';
import { config } from '../config/env';

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
    return res.status(422).json({error: 'Missing email, name or password'});
  }

  const userExists = await prisma.user.findUnique({where: {email}});
  if (userExists) {
    return res.status(409).json({error: 'User already exists'});
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
    return res.status(422).json({error: 'Wrong email or password'});
  }

  const user = await prisma.user.findUnique({where: {email}});

  if (!user) {
    return res.status(401).json({error: "Invalid credentials"});
  }

  const isPasswordValid = await comparePassword(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({error: 'Invalid credentials'});
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