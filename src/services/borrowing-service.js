const prisma = require("../models/prisma");

const borrowingService = {};

borrowingService.createBorrowingByData = (data) => prisma.borrowing.create({ data });

borrowingService.findFirstBorrowingByBookIdAndReturnedAt = (bookId) =>
  prisma.borrowing.findFirst({ where: { bookId, returnedAt: null } });

borrowingService.updateReturnedAtById = (id) =>
  prisma.borrowing.update({ where: { id }, data: { returnedAt: new Date() } });

borrowingService.deleteManyBorrowingByBookId = (bookId) =>
  prisma.borrowing.deleteMany({ where: { bookId } });

borrowingService.groupByBorrowingAndCountByBookId = () =>
  prisma.borrowing.groupBy({
    by: ["bookId"],
    _count: {
      bookId: true,
    },
  
  });

module.exports = borrowingService;
