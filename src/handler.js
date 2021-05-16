const { nanoid } = require('nanoid');
const { parseBool } = require('./utils');
const books = require('./books');

const addBookHandler = (request, h) => {
  let resMessage;
  let resStatus;
  let resCode;

  try {
    const {
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
    } = request.payload;
    const id = nanoid(16);
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;
    const finished = pageCount === readPage;

    if (name === undefined) {
      resStatus = 'fail';
      resMessage = 'Gagal menambahkan buku. Mohon isi nama buku';
      resCode = 400;
    } else if (readPage > pageCount) {
      resStatus = 'fail';
      resMessage = 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount';
      resCode = 400;
    } else {
      const aBook = {
        id,
        name,
        year,
        author,
        summary,
        publisher,
        pageCount,
        readPage,
        finished,
        reading,
        insertedAt,
        updatedAt,
      };

      books.push(aBook);
      const isSuccess = books.filter((book) => book.id === id).length > 0;

      if (isSuccess) {
        const okResponse = h.response({
          status: 'success',
          message: 'Buku berhasil ditambahkan',
          data: {
            bookId: id,
          },
        });
        okResponse.code(201);
        return okResponse;
      }

      throw new Error('');
    }
  } catch (error) {
    resMessage = 'Buku gagal ditambahkan';
    resStatus = 'error';
    resCode = 500;
  }

  const response = h.response({
    status: resStatus,
    message: resMessage,
  });
  response.code(resCode);
  return response;
};

const getAllBooksHandler = (request) => {
  const getTheBooks = (aShelf) => {
    const theBooks = [];
    aShelf.forEach((book) => {
      const { id, name, publisher } = book;
      const aBook = { id, name, publisher };
      theBooks.push(aBook);
    });
    return theBooks;
  };

  const { name, reading, finished } = request.query;

  const emptyShelf = {
    status: 'success',
    data: {
      books: [],
    },
  };

  const fullShelf = {
    status: 'success',
    data: {
      books: getTheBooks(books),
    },
  };

  if (!books.length) {
    return emptyShelf;
  }

  if (name !== undefined) {
    const eqBooks = books.filter((book) => book.name.toUpperCase().indexOf(name.toUpperCase()) !== -1);

    if (eqBooks !== -1) {
      return {
        status: 'success',
        data: {
          books: getTheBooks(eqBooks),
        },
      };
    }

    return emptyShelf;
  }

  if (reading !== undefined) {
    const readingBooks = books.filter((book) => (parseBool(book.reading) === parseBool(reading)));

    if (readingBooks !== -1) {
      return {
        status: 'success',
        data: {
          books: getTheBooks(readingBooks),
        },
      };
    }

    return fullShelf;
  }

  if (finished !== undefined) {
    const finishedBooks = books.filter((book) => (parseBool(book.finished) === parseBool(finished)));

    if (finishedBooks !== -1) {
      return {
        status: 'success',
        data: {
          books: getTheBooks(finishedBooks),
        },
      };
    }
    return fullShelf;
  }

  return fullShelf;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((n) => n.id === id)[0];

  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        book,
      },
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  return response;
};

const editBookByIdHandler = (request, h) => {
  let resStatus;
  let resMessage;
  let resCode;

  const { id } = request.params;
  const {
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    reading,
  } = request.payload;

  const updatedAt = new Date().toISOString();

  const index = books.findIndex((book) => book.id === id);

  if (name === undefined) {
    resStatus = 'fail';
    resMessage = 'Gagal memperbarui buku. Mohon isi nama buku';
    resCode = 400;
  } else if (readPage > pageCount) {
    resStatus = 'fail';
    resMessage = 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount';
    resCode = 400;
  } else if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    resStatus = 'success';
    resMessage = 'Buku berhasil diperbarui';
    resCode = 200;
  } else {
    resStatus = 'fail';
    resMessage = 'Gagal memperbarui buku. Id tidak ditemukan';
    resCode = 404;
  }

  const response = h.response({
    status: resStatus,
    message: resMessage,
  });
  response.code(resCode);
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
