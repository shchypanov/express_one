export const config = {
  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtAccessExpiresIn: 900,    // 15 хвилин в секундах
  jwtRefreshExpiresIn: 604800, // 7 днів в секундах

  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Cookies
  cookieSecure: process.env.NODE_ENV === 'production',
};