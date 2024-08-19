const request = require("supertest");
const express = require("express");
const jestMock = require("jest-mock");
const { authenticate } = require("../middlewares/authenticate");
const { isAdmin } = require("../middlewares/isAdmin");
const { createBookValidator } = require("../middlewares/validator");
const adminController = require("../controllers/admin-controller");
const { errorMiddleware } = require("../middlewares/errorMiddleware");
const bookService = require("../services/book-service");
const borrowingService = require("../services/borrowing-service");

const app = express();
app.use(express.json());

jest.mock("../services/book-service");
jest.mock("../services/borrowing-service");
jest.mock("../middlewares/authenticate");
jest.mock("../middlewares/isAdmin");

app.post(
  "/admin/books",
  authenticate,
  isAdmin,
  createBookValidator,
  adminController.createBook
);

app.put(
  "/admin/books/:bookId",
  authenticate,
  isAdmin,
  createBookValidator,
  adminController.editBook
);

app.delete("/admin/books/:bookId", authenticate, isAdmin, adminController.deleteBook);

app.use(errorMiddleware);

describe("POST /admin/books", () => {
  it("should create a new book successfully if the user is authenticated and an admin", async () => {
    const bookData = {
      title: "Test Book",
      detail: "This is a test book.",
      author: "Test Author",
      category: "Test Category",
    };

    // Mock authenticate middleware to pass the authentication
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 1, roleId: 1 }; // Assume roleId 1 is for ADMIN
      next();
    });

    // Mock isAdmin middleware to pass the authorization
    isAdmin.mockImplementation((req, res, next) => {
      next();
    });

    // Mock createBookByData to return the created book
    bookService.createBookByData.mockResolvedValue({
      id: 1,
      ...bookData,
    });

    const response = await request(app).post("/admin/books").send(bookData);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: 1,
      ...bookData,
    });
  });

  it("should return 403 if the user is not an admin", async () => {
    const bookData = {
      title: "Test Book",
      detail: "This is a test book.",
      author: "Test Author",
      category: "Test Category",
    };

    // Mock authenticate middleware to pass the authentication
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 1, roleId: 2 }; // Assume roleId 2 is for USER, not ADMIN
      next();
    });

    // Mock isAdmin middleware to fail the authorization
    isAdmin.mockImplementation((req, res, next) => {
      const error = new Error("You are not authorized to access this resource.");
      error.statusCode = 403;
      next(error);
    });

    const response = await request(app).post("/admin/books").send(bookData);
    expect(response.status).toBe(403);
    expect(response.body).toHaveProperty(
      "message",
      "You are not authorized to access this resource."
    );
  });

  it("should return 500 on any other errors", async () => {
    const bookData = {
      title: "Test Book",
      detail: "This is a test book.",
      author: "Test Author",
      category: "Test Category",
    };

    // Mock authenticate middleware to pass the authentication
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 1, roleId: 1 }; // Assume roleId 1 is for ADMIN
      next();
    });

    // Mock isAdmin middleware to pass the authorization
    isAdmin.mockImplementation((req, res, next) => {
      next();
    });

    // Mock createBookByData to throw an error
    bookService.createBookByData.mockRejectedValue(new Error("Database error"));

    const response = await request(app).post("/admin/books").send(bookData);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});

describe("PUT /admin/books/:bookId", () => {
  it("should update the book successfully if the user is authenticated and an admin", async () => {
    const bookId = 1;
    const bookData = {
      title: "Updated Book",
      detail: "This is an updated test book.",
      author: "Updated Author",
      category: "Updated Category",
    };

    // Mock authenticate middleware to pass the authentication
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 1, roleId: 1 }; // Assume roleId 1 is for ADMIN
      next();
    });

    // Mock isAdmin middleware to pass the authorization
    isAdmin.mockImplementation((req, res, next) => {
      next();
    });

    // Mock findBookById to return an existing book
    bookService.findBookById.mockResolvedValue({ id: bookId });

    // Mock updateBookByIdAndData to return the updated book
    bookService.updateBookByIdAndData.mockResolvedValue({
      id: bookId,
      ...bookData,
    });

    const response = await request(app).put(`/admin/books/${bookId}`).send(bookData);
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      id: bookId,
      ...bookData,
    });
  });

  it("should return 404 if the book is not found", async () => {
    const bookId = 1;
    const bookData = {
      title: "Updated Book",
      detail: "This is an updated test book.",
      author: "Updated Author",
      category: "Updated Category",
    };

    // Mock authenticate middleware to pass the authentication
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 1, roleId: 1 }; // Assume roleId 1 is for ADMIN
      next();
    });

    // Mock isAdmin middleware to pass the authorization
    isAdmin.mockImplementation((req, res, next) => {
      next();
    });

    // Mock findBookById to return null, meaning the book is not found
    bookService.findBookById.mockResolvedValue(null);

    const response = await request(app).put(`/admin/books/${bookId}`).send(bookData);
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("message", "Book not found");
  });

  it("should return 400 if the bookId is not provided", async () => {
    const bookId = undefined; // Not provided
    const bookData = {
      title: "Updated Book",
      detail: "This is an updated test book.",
      author: "Updated Author",
      category: "Updated Category",
    };

    // Mock authenticate middleware to pass the authentication
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 1, roleId: 1 }; // Assume roleId 1 is for ADMIN
      next();
    });

    // Mock isAdmin middleware to pass the authorization
    isAdmin.mockImplementation((req, res, next) => {
      next();
    });

    const response = await request(app).put(`/admin/books/${bookId}`).send(bookData); // No bookId provided
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message", "Book id is required");
  });

  it("should return 500 on any other errors", async () => {
    const bookId = 1;
    const bookData = {
      title: "Updated Book",
      detail: "This is an updated test book.",
      author: "Updated Author",
      category: "Updated Category",
    };

    // Mock authenticate middleware to pass the authentication
    authenticate.mockImplementation((req, res, next) => {
      req.user = { id: 1, roleId: 1 }; // Assume roleId 1 is for ADMIN
      next();
    });

    // Mock isAdmin middleware to pass the authorization
    isAdmin.mockImplementation((req, res, next) => {
      next();
    });

    // Mock findBookById to return an existing book
    bookService.findBookById.mockResolvedValue({ id: bookId });

    // Mock updateBookByIdAndData to throw an error
    bookService.updateBookByIdAndData.mockRejectedValue(new Error("Database error"));

    const response = await request(app).put(`/admin/books/${bookId}`).send(bookData);
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
  });
});

describe("DELETE /admin/books/:bookId", () => {
    it("should delete a book successfully", async () => {
      const bookId = 1;
  
      // Mocking the book and borrowing services
      bookService.findBookById.mockResolvedValue({ id: bookId, title: "Test Book" });
      borrowingService.findFirstBorrowingByBookIdAndReturnedAt.mockResolvedValue(null);
      bookService.deleteBookById.mockResolvedValue();
      borrowingService.deleteManyBorrowingByBookId.mockResolvedValue();
  
      const response = await request(app)
        .delete(`/admin/books/${bookId}`)
        .set("Authorization", "Bearer validAdminToken");
  
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Book deleted successfully");
    });
  
    it("should return 400 if bookId is not provided", async () => {
      const response = await request(app)
        .delete(`/admin/books/${undefined}`)
        .set("Authorization", "Bearer validAdminToken");
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Book id is required");
    });
  
    it("should return 404 if the book does not exist", async () => {
      const bookId = 1;
  
      // Mocking findBookById to return null
      bookService.findBookById.mockResolvedValue(null);
  
      const response = await request(app)
        .delete(`/admin/books/${bookId}`)
        .set("Authorization", "Bearer validAdminToken");
  
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Book not found");
    });
  
    it("should return 400 if the book is currently borrowed", async () => {
      const bookId = 1;
  
      // Mocking the book and borrowing services
      bookService.findBookById.mockResolvedValue({ id: bookId, title: "Test Book" });
      borrowingService.findFirstBorrowingByBookIdAndReturnedAt.mockResolvedValue({ id: 1 });
  
      const response = await request(app)
        .delete(`/admin/books/${bookId}`)
        .set("Authorization", "Bearer validAdminToken");
  
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Book is borrowed, cannot delete");
    });
  
    it("should return 500 on any other errors", async () => {
      const bookId = 1;
  
      // Mocking findBookById to throw an error
      bookService.findBookById.mockRejectedValue(new Error("Internal Server Error"));
        
      const response = await request(app)
        .delete(`/admin/books/${bookId}`)
        .set("Authorization", "Bearer validAdminToken");
  
      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message", "Internal Server Error");
    });
  });