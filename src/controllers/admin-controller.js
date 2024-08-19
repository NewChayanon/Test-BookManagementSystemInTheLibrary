const prisma = require("../models/prisma");
const bookService = require("../services/book-service");
const { createError } = require("../utils/createError");

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

adminController.editBook = async (req, res, next) => {
  try {
    const data = req.book;
    const bookId = +req.params.bookId;
    if (!bookId) {
      createError(400, "Book id is required");
    }

    // Check if the book exists
    const existingBook = await bookService.findBookById(bookId);

    if (!existingBook) {
      createError(404, "Book not found");
    }

    // Update the book
    const updatedBook = await bookService.updateBookByIdAndData(bookId, data);

    res.json(updatedBook);
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = adminController;
