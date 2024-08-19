const prisma = require("../models/prisma");

const bookService = {};

bookService.findBookById = (id) => prisma.book.findUnique({ where: { id } });

bookService.createBookByData = (data) => prisma.book.create({ data });

bookService.updateBookByIdAndData = (id, data) =>
  prisma.book.update({ where: { id }, data });

bookService.deleteBookById = (id) => prisma.book.delete({ where: { id } });

module.exports = bookService;
