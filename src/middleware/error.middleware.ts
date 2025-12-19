import {Request, Response, NextFunction} from 'express';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const BadRequest = (message: string) => new AppError(400, message);
export const Unauthorized = (message: string) => new AppError(401, message);
export const Forbidden = (message: string) => new AppError(403, message);
export const NotFound = (message: string) => new AppError(404, message);
export const Conflict = (message: string) => new AppError(409, message);

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
  });
}

export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}