const prisma = require("../models/prisma");

const bookService = {};

bookService.findBookById = (id) => prisma.book.findUnique({ where: { id } });
bookService.findBookAndBorrowingWhereReturnedAtIsNullByFilter = (filter) =>
  prisma.book.findMany({
    where: filter,
    include: { borrowing: { where: { returnedAt: null } } },
  });
bookService.findManyBookAndBorrowingWhereBorrowedAtIsLessThanNow = () =>
  prisma.book.findMany({
    where: { borrowing: { some: { borrowedAt: { lt: new Date() } } } },
    include: { borrowing: true },
  });

bookService.createBookByData = (data) => prisma.book.create({ data });

bookService.updateBookByIdAndData = (id, data) =>
  prisma.book.update({ where: { id }, data });

bookService.deleteBookById = (id) => prisma.book.delete({ where: { id } });

module.exports = bookService;
