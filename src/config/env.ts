export const config = {
  // JWT
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
  jwtAccessExpiresIn: '15m',
  jwtRefreshExpiresIn: '7d',

  // Server
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Cookies
  cookieSecure: process.env.NODE_ENV === 'production',
}