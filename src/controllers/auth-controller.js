const hashService = require("../services/hash-service");
const userService = require("../services/user-service");
const { createError } = require("../utils/createError");
const mapper = require("../utils/mapper");

const authController = {};

authController.register = async (req, res, next) => {
  try {
    const data = req.input;

    const existingUser  = await userService.findUserByEmail(data.email);
    if (existingUser ) createError(409, "Email already exists!");

    data.password = await hashService.hash(data.password)
    const user = await userService.createUserByData(data)

    const registerResponse = mapper.registerMapper(user)

    res.status(200).json(registerResponse);
  } catch (error) {
    next(error);
  }
};

module.exports = authController;
