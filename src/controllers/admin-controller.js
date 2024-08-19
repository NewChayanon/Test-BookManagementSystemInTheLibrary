const prisma = require("../models/prisma");
const bookService = require("../services/book-service");

const adminController = {};

adminController.createBook = async (req, res, next) => {
  try {
    const data = req.book;

    // Create a new book
    const book = await bookService.createBookByData(data);

    res.json(book);
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = adminController;
