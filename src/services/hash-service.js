const bcrypt = require("bcryptjs");
const hashService = {};

hashService.hash = (plainText) => bcrypt.hash(plainText, 12);

hashService.compare = (inputPassword, dbPassword) => bcrypt.compare(inputPassword, dbPassword);

module.exports = hashService;