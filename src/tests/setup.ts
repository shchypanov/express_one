import { afterAll, beforeEach } from 'vitest';
import prisma from '../lib/prisma';

// Set test environment
process.env.NODE_ENV = 'test';

// Clean database before each test
beforeEach(async () => {
  // Delete in order respecting foreign keys
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

// Close database connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
});
