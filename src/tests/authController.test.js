const request = require("supertest");
const express = require("express");
const userService = require("../services/user-service");
const hashService = require("../services/hash-service");
const authController = require("../controllers/auth-controller");
const mapper = require("../utils/mapper");
const {
  registerValidator,
  loginValidator,
  searchBookValidator,
} = require("../middlewares/validator");
const { errorMiddleware } = require("../middlewares/errorMiddleware");
const jwtService = require("../services/jwt-service");
const bookService = require("../services/book-service");
const prisma = require("../models/prisma");

const app = express();
app.use(express.json());

jest.mock("../services/user-service");
jest.mock("../services/hash-service");
jest.mock("../services/jwt-service");
jest.mock("../services/book-service");

app.post("/auth/register", registerValidator, authController.register);
app.post("/auth/login", loginValidator, authController.login);
app.get("/auth/books", searchBookValidator, authController.searchBooks);
app.get("/auth/books/most-borrowed", authController.mostBorrowed);
app.get("/auth/books/:bookId", authController.getBook);

app.use(errorMiddleware);

describe("POST /auth/register", () => {
  it("should register a new user successfully", async () => {
    const inputData = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };
    // Mock findUserByEmail to return null (no existing user)
    userService.findUserByEmail.mockResolvedValue(null);

    // Mock hash to return a hashed password
    hashService.hash.mockResolvedValue("hashedPassword123");

    // Mock createUserByData to return the created user
    userService.createUserByData.mockResolvedValue({
      id: 1,
      email: inputData.email,
      password: "hashedPassword123",
    });

    // Mock registerMapper to return a mapped response
    const registerResponse = {
      id: 1,
      email: inputData.email,
    };
    jest.spyOn(mapper, "registerMapper").mockReturnValue(registerResponse);

    const response = await request(app).post("/auth/register").send(inputData);
    expect(response.status).toBe(201);
    expect(response.body).toEqual(registerResponse);
  });

  it("should return 409 if email already exists", async () => {
    const inputData = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    // Mock findUserByEmail to return an existing user
    userService.findUserByEmail.mockResolvedValue({
      id: 1,
      email: inputData.email,
      password: "existingHashedPassword",
    });

    const response = await request(app).post("/auth/register").send(inputData);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("message", "Email already exists!");
  });

  it("should return 500 on any other errors", async () => {
    const inputData = {
      email: "test@example.com",
      password: "password123",
      confirmPassword: "password123",
    };

    // Mock findUserByEmail to throw an error
    userService.findUserByEmail.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/auth/register").send(inputData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});

describe("POST /auth/login", () => {
  it("should login a user successfully and return an access token", async () => {
    const inputData = {
      email: "test@example.com",
      password: "password123",
    };

    // Mock findUserByEmail to return an existing user
    userService.findUserByEmail.mockResolvedValue({
      id: 1,
      email: inputData.email,
      password: "existingHashedPassword",
    });

    // Mock compare to return true (passwords match)
    hashService.compare.mockResolvedValue(true);

    // Mock sign to return a JWT token
    jwtService.sign.mockReturnValue("valid.jwt.token");

    const response = await request(app).post("/auth/login").send(inputData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken", "valid.jwt.token");
  });

  it("should return 401 if email does not exist", async () => {
    const inputData = {
      email: "nonexistent@example.com",
      password: "password123",
    };

    // Mock findUserByEmail to return null (no existing user)
    userService.findUserByEmail.mockResolvedValue(null);

    const response = await request(app).post("/auth/login").send(inputData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid email or password");
  });

  it("should return 401 if password does not match", async () => {
    const inputData = {
      email: "test@example.com",
      password: "wrongpassword",
    };

    // Mock findUserByEmail to return an existing user
    userService.findUserByEmail.mockResolvedValue({
      id: 1,
      email: inputData.email,
      password: "existingHashedPassword",
    });

    // Mock compare to return false (passwords do not match)
    hashService.compare.mockResolvedValue(false);

    const response = await request(app).post("/auth/login").send(inputData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("message", "Invalid email or password");
  });

  it("should return 500 on any other errors", async () => {
    const inputData = {
      email: "test@example.com",
      password: "password123",
    };

    // Mock findUserByEmail to throw an error
    userService.findUserByEmail.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/auth/login").send(inputData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});

describe("GET /auth/books/:bookId", () => {
  it("should return a book successfully when the book exists", async () => {
    const bookId = 1;

    const existingBook = {
      id: bookId,
      title: "Sample Book",
      detail: "Sample detail",
      author: "Sample Author",
      category: "Sample Category",
    };

    // Mock findBookById to return an existing book
    bookService.findBookById.mockResolvedValue(existingBook);

    const response = await request(app).get(`/auth/books/${bookId}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(existingBook);
  });

  it("should return 404 if the book is not found", async () => {
    const bookId = 1;

    // Mock findBookById to return null (no book found)
    bookService.findBookById.mockResolvedValue(null);

    const response = await request(app).get(`/auth/books/${bookId}`);

    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Book not found");
  });

  it("should return 400 if the bookId is not provided", async () => {
    const response = await request(app).get(`/auth/books/${undefined}`);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Book id is required");
  });

  it("should return 500 on any other errors", async () => {
    const bookId = 1;

    // Mock findBookById to throw an error
    bookService.findBookById.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get(`/auth/books/${bookId}`);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});

describe("GET /auth/books", () => {
  it("should return 400 if no search query is provided", async () => {
    const response = await request(app).get("/auth/books");

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Please provide a search query!");
  });

  it("should return books based on the title", async () => {
    const mockBooks = [
      {
        title: "Harry Potter",
        detail: "Harry Potter",
        author: "J.K. Rowling",
        category: "Fantasy",
      },
    ];
    const mockBooksMapper = [
      {
        title: "Harry Potter",
        detail: "Harry Potter",
        author: "J.K. Rowling",
        category: "Fantasy",
        statusbar: "Available",
      },
    ];
    bookService.findBookAndBorrowingWhereReturnedAtIsNullByFilter.mockResolvedValue(
      mockBooks
    );

    jest.spyOn(mapper, "searchBooksMapper").mockReturnValue(mockBooksMapper);

    const response = await request(app).get("/auth/books").query({ title: "Harry" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].title).toBe("Harry Potter");
  });
  it("should return books based on the author", async () => {
    const mockBooks = [
      { title: "The Great Gatsby", author: "F. Scott Fitzgerald", category: "Classic" },
    ];
    const mockBooksMapper = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        category: "Classic",
        statusbar: "Available",
      },
    ];
    bookService.findBookAndBorrowingWhereReturnedAtIsNullByFilter.mockResolvedValue(
      mockBooks
    );

    jest.spyOn(mapper, "searchBooksMapper").mockReturnValue(mockBooksMapper);

    const response = await request(app)
      .get("/auth/books")
      .query({ author: "Fitzgerald" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].author).toBe("F. Scott Fitzgerald");
  });
  it("should return books based on the category", async () => {
    const mockBooks = [
      { title: "Harry Potter", author: "J.K. Rowling", category: "Fantasy" },
    ];
    const mockBooksMapper = [
      {
        title: "Harry Potter",
        detail: "Harry Potter",
        author: "J.K. Rowling",
        category: "Fantasy",
        statusbar: "Available",
      },
    ];
    bookService.findBookAndBorrowingWhereReturnedAtIsNullByFilter.mockResolvedValue(
      mockBooks
    );

    jest.spyOn(mapper, "searchBooksMapper").mockReturnValue(mockBooksMapper);

    const response = await request(app).get("/auth/books").query({ category: "Fantasy" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(response.body[0].category).toBe("Fantasy");
  });
  it("should return an empty array if no books match the query", async () => {
    bookService.findBookAndBorrowingWhereReturnedAtIsNullByFilter.mockResolvedValue([]);

    jest.spyOn(mapper, "searchBooksMapper").mockReturnValue([]);

    const response = await request(app)
      .get("/auth/books")
      .query({ title: "Nonexistent" });

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(0);
  });
  it("should return 500 on any other errors", async () => {
    bookService.findBookAndBorrowingWhereReturnedAtIsNullByFilter.mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app).get("/auth/books").query({ title: "Harry" });

    expect(response.statusCode).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});

describe("GET /auth/books/most-borrowed", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should return the most borrowed book", async () => {
    const books = [
      {
        id: 1,
        title: "Book A",
        detail: "Details of Book A",
        author: "Author A",
        category: "Category A",
        borrowing: [{ id: 1, borrowedAt: new Date(), returnedAt: null }],
      },
      {
        id: 2,
        title: "Book A",
        detail: "Details of Book A",
        author: "Author A",
        category: "Category A",
        borrowing: [{ id: 2, borrowedAt: new Date(), returnedAt: null }],
      },
      {
        id: 3,
        title: "Book B",
        detail: "Details of Book B",
        author: "Author B",
        category: "Category B",
        borrowing: [{ id: 3, borrowedAt: new Date(), returnedAt: null }],
      },
    ];

    bookService.findManyBookAndBorrowingWhereBorrowedAtIsLessThanNow.mockResolvedValue(books);

    const response = await request(app).get("/auth/books/most-borrowed").expect(200);

    expect(response.body).toEqual({
      title: "Book A",
      detail: "Details of Book A",
      author: "Author A",
      category: "Category A",
      borrowCount: 2,
      popular: 2,
    });
  });

  it("should return an empty object when there are no books", async () => {
    bookService.findManyBookAndBorrowingWhereBorrowedAtIsLessThanNow.mockResolvedValue([]);

    const response = await request(app).get("/auth/books/most-borrowed").expect(404);

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toBe("No books found!");
    expect(response.body).toHaveProperty("message", "No books found!");
  });

  it("should handle errors gracefully", async () => {
    bookService.findManyBookAndBorrowingWhereBorrowedAtIsLessThanNow.mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app).get("/auth/books/most-borrowed").expect(500);

    expect(response.body).toHaveProperty("message", "Database error");
  });
});