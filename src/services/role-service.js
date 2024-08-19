const prisma = require("../models/prisma");

const roleService = {};

roleService.findRoleById = (id) => prisma.role.findUnique({ where: { id } });

module.exports = roleService;
