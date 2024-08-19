const request = require("supertest");
const express = require("express");
const jestMock = require("jest-mock");
const userController = require("../controllers/user-controller");
const jwtService = require("../services/jwt-service");
const { authenticate } = require("../middlewares/authenticate");
const { errorMiddleware } = require("../middlewares/errorMiddleware");

const app = express();
app.use(express.json());

// Mock authenticate middleware to attach user to request
jest.mock("../middlewares/authenticate", () => ({
  authenticate: (req, res, next) => {
    req.user = { id: 1 };
    next();
  },
}));

app.get("/users/refresh-token", authenticate, userController.refreshToken);
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
