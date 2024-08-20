exports.popularBook = (books) =>
  books.reduce((acc, book) => {
    const bookTitle = book.title;

    const existingBook = acc.findIndex((item) => item.title === bookTitle);

    if (existingBook !== -1) {
      acc[existingBook].borrowCount += 1;
      acc[existingBook].popular = acc[existingBook].popular + book.borrowing.length;
    } else {
      acc.push({
        title: bookTitle,
        detail: book.detail,
        author: book.author,
        category: book.category,
        borrowCount: 1,
        popular: book.borrowing.length,
      });
    }
    return acc;
  }, []);

exports.sortPopularBook = (books) => books.sort((a, b) => b.popular - a.popular);
