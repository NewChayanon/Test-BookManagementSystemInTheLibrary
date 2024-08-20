const borrowingService = require("../services/borrowing-service");

const mapper = {};

mapper.registerMapper = (data) => ({ id: data.id, email: data.email });

mapper.searchBooksMapper = (data) =>
  data.map((book) => ({
    id: book.id,
    title: book.title,
    detail: book.detail,
    author: book.author,
    pubishedAt: book.pubishedAt,
    updatedAt: book.updatedAt,
    status: book.borrowing.length > 0 ? "borrowed" : "available",
  }));

module.exports = mapper;
