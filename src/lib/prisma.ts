import { PrismaClient } from "../../generated/prisma";

const prisma = new PrismaClient({
  log: ["query", "warn", "error"],
});

export default prisma;