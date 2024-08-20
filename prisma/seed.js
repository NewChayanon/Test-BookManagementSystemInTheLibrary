const { PrismaClient } = require("@prisma/client");
const hashService = require("../src/services/hash-service");
const prisma = new PrismaClient();

async function main() {
  try {
    // Seed Roles
    const adminRole = await prisma.role.create({
      data: {
        name: "ADMIN",
      },
    });

    const userRole = await prisma.role.create({
      data: {
        name: "USER",
      },
    });

    // Seed Users
    const setPassword = "123456789"
    const password = await hashService.hash(setPassword);
    const users = await prisma.user.createMany({
      data: [
        { email: "admin@example.com", password, roleId: adminRole.id },
        { email: "user1@example.com", password, roleId: userRole.id },
        { email: "user2@example.com", password, roleId: userRole.id },
      ],
    });

    // Seed Books
    const categories = ["Fiction", "Non-Fiction", "Science", "History"];
    const books = await prisma.book.createMany({
      data: [
        {
          title: "Book 1",
          detail: "Detail for book 1",
          author: "Author 1",
          category: categories[0],
        },
        {
          title: "Book 1",
          detail: "Detail for book 1",
          author: "Author 1",
          category: categories[0],
        },
        {
          title: "Book 1",
          detail: "Detail for book 1",
          author: "Author 1",
          category: categories[0],
        },
        {
          title: "Book 2",
          detail: "Detail for book 2",
          author: "Author 2",
          category: categories[1],
        },
        {
          title: "Book 2",
          detail: "Detail for book 2",
          author: "Author 2",
          category: categories[1],
        },
        {
          title: "Book 3",
          detail: "Detail for book 3",
          author: "Author 3",
          category: categories[2],
        },
        {
          title: "Book 4",
          detail: "Detail for book 4",
          author: "Author 4",
          category: categories[3],
        },
        {
          title: "Book 4",
          detail: "Detail for book 4",
          author: "Author 4",
          category: categories[3],
        },
        {
          title: "Book 4",
          detail: "Detail for book 4",
          author: "Author 4",
          category: categories[3],
        },
        {
          title: "Book 5",
          detail: "Detail for book 5",
          author: "Author 5",
          category: categories[0],
        },
        {
          title: "Book 6",
          detail: "Detail for book 6",
          author: "Author 6",
          category: categories[1],
        },
        {
          title: "Book 7",
          detail: "Detail for book 7",
          author: "Author 7",
          category: categories[2],
        },
        {
          title: "Book 8",
          detail: "Detail for book 8",
          author: "Author 8",
          category: categories[3],
        },
        {
          title: "Book 9",
          detail: "Detail for book 9",
          author: "Author 9",
          category: categories[0],
        },
        {
          title: "Book 10",
          detail: "Detail for book 10",
          author: "Author 10",
          category: categories[1],
        },
        {
          title: "Book 11",
          detail: "Detail for book 11",
          author: "Author 11",
          category: categories[2],
        },
        {
          title: "Book 12",
          detail: "Detail for book 12",
          author: "Author 12",
          category: categories[3],
        },
        {
          title: "Book 13",
          detail: "Detail for book 13",
          author: "Author 13",
          category: categories[0],
        },
        {
          title: "Book 14",
          detail: "Detail for book 14",
          author: "Author 14",
          category: categories[1],
        },
        {
          title: "Book 15",
          detail: "Detail for book 15",
          author: "Author 15",
          category: categories[2],
        },
        {
          title: "Book 16",
          detail: "Detail for book 16",
          author: "Author 16",
          category: categories[3],
        },
        {
          title: "Book 17",
          detail: "Detail for book 17",
          author: "Author 17",
          category: categories[0],
        },
        {
          title: "Book 18",
          detail: "Detail for book 18",
          author: "Author 18",
          category: categories[1],
        },
        {
          title: "Book 19",
          detail: "Detail for book 19",
          author: "Author 19",
          category: categories[2],
        },
        {
          title: "Book 20",
          detail: "Detail for book 20",
          author: "Author 20",
          category: categories[3],
        },
      ],
    });

    // Seed Borrowing Records
    const borrowings = await prisma.borrowing.createMany({
      data: [
        { userId: 2, bookId: 1 },
        { userId: 2, bookId: 2 },
        { userId: 3, bookId: 3 },
        { userId: 3, bookId: 4 },
        { userId: 2, bookId: 5 },
      ],
    });

    console.log("Database has been seeded.");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await prisma.$disconnect();
    console.log("Seeding finished.");
  }
}

main();
