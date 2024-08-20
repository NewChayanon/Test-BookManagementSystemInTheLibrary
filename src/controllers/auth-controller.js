const prisma = require("../models/prisma");
const bookService = require("../services/book-service");
const borrowingService = require("../services/borrowing-service");
const hashService = require("../services/hash-service");
const jwtService = require("../services/jwt-service");
const userService = require("../services/user-service");
const { createError } = require("../utils/createError");
const mapper = require("../utils/mapper");
const { popularBook, sortPopularBook } = require("../utils/mostBorrowed");

const authController = {};

authController.register = async (req, res, next) => {
  try {
    const data = req.input;

    const existingUser = await userService.findUserByEmail(data.email);
    if (existingUser) createError(409, "Email already exists!");

    data.password = await hashService.hash(data.password);
    const user = await userService.createUserByData(data);

    const registerResponse = mapper.registerMapper(user);

    res.status(201).json(registerResponse);
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

authController.login = async (req, res, next) => {
  try {
    const data = req.input;
    const existingUser = await userService.findUserByEmail(data.email);
    if (!existingUser) createError(401, "Invalid email or password");

    const isMatch = await hashService.compare(data.password, existingUser.password);
    if (!isMatch) createError(401, "Invalid email or password");

    const accessToken = jwtService.sign({ id: existingUser.id });
    res.json({ accessToken });
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

authController.getBook = async (req, res, next) => {
  try {
    const bookId = +req.params.bookId;
    if (!bookId) {
      createError(400, "Book id is required");
    }

    // Check if the book exists
    const existingBook = await bookService.findBookById(bookId);

    if (!existingBook) {
      createError(404, "Book not found");
    }

    res.json(existingBook);
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

authController.searchBooks = async (req, res, next) => {
  try {
    const { title, author, category } = req.book;

    if (!title && !author && !category)
      createError(400, "Please provide a search query!");

    const filter = {};
    if (title) filter.title = { contains: title };
    if (author) filter.author = { contains: author };
    if (category) filter.category = { contains: category };

    const books = await bookService.findBookAndBorrowingWhereReturnedAtIsNullByFilter(
      filter
    );

    const booksDTO = await mapper.searchBooksMapper(books);

    res.json(booksDTO);
  } catch (error) {
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

authController.mostBorrowed = async (req, res, next) => {
  try {
    const books =
      await bookService.findManyBookAndBorrowingWhereBorrowedAtIsLessThanNow();

      if (!books.length) createError(404, "No books found!")
    
    const popularBooks = popularBook(books);
    
    const mostBorrowedBooks = sortPopularBook(popularBooks);
    
    res.json(mostBorrowedBooks[0]);
  } catch (error) {
    // console.log(error);
    next(error);
  } finally {
    await prisma.$disconnect();
  }
};

module.exports = authController;
