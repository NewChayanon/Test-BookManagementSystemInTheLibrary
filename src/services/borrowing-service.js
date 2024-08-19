const prisma = require("../models/prisma");

const borrowingService = {};

borrowingService.findFirstBorrowingByBookIdAndReturnedAt = (bookId) =>
  prisma.borrowing.findFirst({ where: { bookId, returnedAt: null } });

borrowingService.deleteManyBorrowingByBookId = (bookId) =>
  prisma.borrowing.deleteMany({ where: { bookId } });

module.exports = borrowingService;
