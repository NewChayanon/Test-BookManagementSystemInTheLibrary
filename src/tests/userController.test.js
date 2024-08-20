const request = require("supertest");
const express = require("express");
const jestMock = require("jest-mock");
const userController = require("../controllers/user-controller");
const jwtService = require("../services/jwt-service");
const { authenticate } = require("../middlewares/authenticate");
const { errorMiddleware } = require("../middlewares/errorMiddleware");
const userService = require("../services/user-service");
const bookService = require("../services/book-service");
const borrowingService = require("../services/borrowing-service");
const {
  borrowingBookValidator,
  returnBookValidator,
} = require("../middlewares/validator");
const prisma = require("../models/prisma");

const app = express();
app.use(express.json());

// Mock authenticate middleware to attach user to request
jest.mock("../middlewares/authenticate", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
}));
jest.mock("../services/user-service");
jest.mock("../services/book-service");
jest.mock("../services/borrowing-service");

app.get("/users/refresh-token", authenticate, userController.refreshToken);
app.post(
  "/users/borrowings",
  authenticate,
  borrowingBookValidator,
  userController.borrowingBook
);

app.post(
  "/users/borrowings/:bookId/return",
  authenticate,
  returnBookValidator,
  userController.returnBook
);

app.use(errorMiddleware);

describe("GET /users/refresh-token", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and a new access token for an authenticated user", async () => {
    // Mock jwtService.sign to return a new token
    jest.spyOn(jwtService, "sign").mockReturnValue("new.valid.jwt.token");

    const response = await request(app)
      .get("/users/refresh-token")
      .set("Authorization", "Bearer valid.jwt.token");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("accessToken", "new.valid.jwt.token");
  });

  it("should return 500 on any other errors", async () => {
    // Mock jwtService.sign to throw an error
    jest.spyOn(jwtService, "sign").mockImplementation(() => {
      throw new Error("Internal Server Error");
    });

    const response = await request(app)
      .get("/users/refresh-token")
      .set("Authorization", "Bearer valid.jwt.token");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message", "Internal Server Error");
  });
});

describe("POST /users/borrowings", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should borrow a book successfully", async () => {
    const borrowingData = { userId: 1, bookId: 1 };

    jestMock.spyOn(bookService, "findBookById").mockResolvedValue({
      id: 1,
      title: "Test Book",
    });
    jestMock
      .spyOn(borrowingService, "findFirstBorrowingByBookIdAndReturnedAt")
      .mockResolvedValue(null);
    jestMock.spyOn(borrowingService, "createBorrowingByData").mockResolvedValue({
      id: 1,
      userId: 1,
      bookId: 1,
      borrowedAt: new Date(),
      returnedAt: null,
    });

    const response = await request(app)
      .post("/users/borrowings")
      .set("Authorization", "Bearer validToken")
      .send(borrowingData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.bookId).toBe(1);
    expect(response.body.userId).toBe(1);
  });

  it("should return 403 if user tries to borrow a book for another user", async () => {
    const borrowingData = { userId: 2, bookId: 1 };

    const response = await request(app)
      .post("/users/borrowings")
      .set("Authorization", "Bearer validToken")
      .send(borrowingData);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You can't borrow this book");
  });

  it("should return 404 if the book does not exist", async () => {
    const borrowingData = { userId: 1, bookId: 99 };

    jestMock.spyOn(bookService, "findBookById").mockResolvedValue(null);

    const response = await request(app)
      .post("/users/borrowings")
      .set("Authorization", "Bearer validToken")
      .send(borrowingData);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Book not found");
  });

  it("should return 400 if the book is already borrowed", async () => {
    const borrowingData = { userId: 1, bookId: 1 };

    jestMock.spyOn(bookService, "findBookById").mockResolvedValue({
      id: 1,
      title: "Test Book",
    });
    jestMock
      .spyOn(borrowingService, "findFirstBorrowingByBookIdAndReturnedAt")
      .mockResolvedValue({ id: 1, bookId: 1, userId: 1, returnedAt: null });

    const response = await request(app)
      .post("/users/borrowings")
      .set("Authorization", "Bearer validToken")
      .send(borrowingData);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Book is already borrowed");
  });

  it("should return 500 on any other errors", async () => {
    const borrowingData = { userId: 1, bookId: 1 };

    jestMock
      .spyOn(bookService, "findBookById")
      .mockRejectedValue(new Error("Database error"));

    const response = await request(app)
      .post("/users/borrowings")
      .set("Authorization", "Bearer validToken")
      .send(borrowingData);

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});

describe("POST /users/borrowings/:bookId/return", () => {
  const userId = 1;
  const bookId = 1;

  const user = { id: userId };
  const borrowingData = {
    id: 1,
    userId,
    bookId,
    returnedAt: null,
  };

  // beforeEach(() => {
  //   authenticate.mockImplementation((req, res, next) => {
  //     req.user = user;
  //     next();
  //   });
  // });

  it("should return the book successfully", async () => {
    bookService.findBookById.mockResolvedValue({ id: bookId, title: "Test Book"})

    borrowingService.findFirstBorrowingByBookIdAndReturnedAt.mockResolvedValue(
      borrowingData
    );
    borrowingService.updateReturnedAtById.mockResolvedValue({
      ...borrowingData,
      returnedAt: new Date(),
    });

    const response = await request(app)
      .post(`/users/borrowings/${bookId}/return`)
      .send({ userId, bookId });

    expect(response.status).toBe(200);
    expect(response.body.returnedAt).not.toBeNull();
  });

  it("should return 403 if the user is not allowed to return the book", async () => {
    const anotherUserId = 2;
    const borrowingDataForAnotherUser = { ...borrowingData, userId: anotherUserId };
    borrowingService.findFirstBorrowingByBookIdAndReturnedAt.mockResolvedValue(
      borrowingDataForAnotherUser
    );

    const response = await request(app)
      .post(`/users/borrowings/${bookId}/return`)
      .send({ userId, bookId });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("You can't return this book");
  });

  it("should return 404 if the book is not found", async () => {
    bookService.findBookById.mockResolvedValue(null);

    const response = await request(app)
      .post(`/users/borrowings/${bookId}/return`)
      .send({ userId, bookId });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Book not found");
  });

  it("should return 400 if the book is not borrowed yet", async () => {
    bookService.findBookById.mockResolvedValue({ id: bookId, title: "Test Book"})

    borrowingService.findFirstBorrowingByBookIdAndReturnedAt.mockResolvedValue(null);

    const response = await request(app)
      .post(`/users/borrowings/${bookId}/return`)
      .send({ userId, bookId });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Book is not borrowed yet");
  });

  it("should return 500 on any other errors", async () => {
    borrowingService.findFirstBorrowingByBookIdAndReturnedAt.mockRejectedValue(
      new Error("Database error")
    );

    const response = await request(app)
      .post(`/users/borrowings/${bookId}/return`)
      .send({ userId, bookId });

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});
