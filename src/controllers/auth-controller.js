const prisma = require("../models/prisma");
const hashService = require("../services/hash-service");
const jwtService = require("../services/jwt-service");
const userService = require("../services/user-service");
const { createError } = require("../utils/createError");
const mapper = require("../utils/mapper");

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

module.exports = authController;
