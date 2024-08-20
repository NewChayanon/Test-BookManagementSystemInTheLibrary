const prisma = require("../models/prisma");

const userService = {};

userService.findUserByEmail = (email) => prisma.user.findUnique({ where: { email } });
userService.findUserById = (id) => prisma.user.findUnique({ where: { id } });

userService.createUserByData = (data) => prisma.user.create({ data });

module.exports = userService;
