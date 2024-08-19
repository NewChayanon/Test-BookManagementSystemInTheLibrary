const prisma = require("../models/prisma");
const jwtService = require("../services/jwt-service");

const userController = {};

userController.refreshToken = async (req, res, next) => {
  try {
    const accessToken = jwtService.sign({ id: req.user.id });
    res.json({ accessToken });
  } catch (error) {
    next(error);
  }finally {
    await prisma.$disconnect();
  }
};

module.exports = userController;
