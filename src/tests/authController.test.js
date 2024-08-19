const request = require("supertest");
const express = require("express");
const jestMock = require("jest-mock");
const userService = require("../services/user-service");
const hashService = require("../services/hash-service");
const authController = require("../controllers/auth-controller");
const mapper = require("../utils/mapper");
const { registerValidator, loginValidator } = require("../middlewares/validator");
const { errorMiddleware } = require("../middlewares/errorMiddleware");
const jwtService = require("../services/jwt-service");

const app = express();
app.use(express.json());

jest.mock("../services/user-service");
jest.mock("../services/hash-service");
jest.mock("../services/jwt-service");

app.post("/auth/register", registerValidator, authController.register);
app.post("/auth/login", loginValidator, authController.login);

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


