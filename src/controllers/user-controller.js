const prisma = require("../models/prisma");
const bookService = require("../services/book-service");
const borrowingService = require("../services/borrowing-service");
const jwtService = require("../services/jwt-service");
const { createError } = require("../utils/createError");

const userController = {};

userController.refreshToken = async (req, res, next) => {
  try {
    
    const accessToken = jwtService.sign({ id: req.user.id });
    res.json({ accessToken });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

userController.borrowingBook = async (req, res, next) => {
  try {
    const user = req.user;
    const { userId, bookId } = req.borrowing;
    const data = req.borrowing;

    if (userId !== user.id) createError(403, "You can't borrow this book");

    const existingBook = await bookService.findBookById(bookId);
    if (!existingBook) createError(404, "Book not found");

    const existingBorrowing =
      await borrowingService.findFirstBorrowingByBookIdAndReturnedAt(bookId);
    if (existingBorrowing) createError(400, "Book is already borrowed");

    const borrowedBook = await borrowingService.createBorrowingByData(data);

    res.status(201).json(borrowedBook);
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

userController.returnBook = async (req, res, next) => {
  try {
    // return res.json({msg:"ss"})
    const user = req.user;
    const { userId, bookId } = req.borrowing;

    if (userId !== user.id) createError(403, "You can't return this book");
    
    const existingBook = await bookService.findBookById(bookId);
    if (!existingBook) createError(404, "Book not found");

    const existingBorrowing =
      await borrowingService.findFirstBorrowingByBookIdAndReturnedAt(bookId);

    if (!existingBorrowing) createError(400, "Book is not borrowed yet");

    if (existingBorrowing.userId !== user.id)
      createError(403, "You can't return this book");

    const returnedBook = await borrowingService.updateReturnedAtById(existingBorrowing.id)

    res.json(returnedBook)
  } catch (error) {
    console.log(error)
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = userController;
