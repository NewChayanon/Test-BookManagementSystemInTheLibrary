const request = require("supertest");
const express = require("express");
const jestMock = require("jest-mock");
const { authenticate } = require("../middlewares/authenticate");
const { isAdmin } = require("../middlewares/isAdmin");
const { createBookValidator } = require("../middlewares/validator");
const adminController = require("../controllers/admin-controller");
const { errorMiddleware } = require("../middlewares/errorMiddleware");
const bookService = require("../services/book-service");

const app = express();
app.use(express.json());

jest.mock("../services/book-service");
jest.mock("../middlewares/authenticate");
jest.mock("../middlewares/isAdmin");

app.use(
  "/admin/books",
  authenticate,
  isAdmin,
  createBookValidator,
  adminController.createBook
);

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
