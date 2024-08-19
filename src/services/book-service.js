const prisma = require("../models/prisma")

const bookService = {}

bookService.createBookByData = (data) => prisma.book.create({ data }),

module.exports = bookService