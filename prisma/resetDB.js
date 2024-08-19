require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function run() {
  await prisma.$executeRawUnsafe(`DROP Database bookManagementSystemInTheLibrary`);
  await prisma.$executeRawUnsafe(`CREATE Database bookManagementSystemInTheLibrary`);
}
console.log("Reset DB..");
run();

/* 

pnpm run resetDB
pnpm exec prisma db push
pnpm exec prisma db seed

*/
