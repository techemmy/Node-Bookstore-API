const http = require("http");
const {
  usersDbPath,
  booksDbPath,
  readDatabase,
  writeToDb,
  getRequestData,
  parseDatabaseStringValue,
  authenticateUser,
} = require("./utils");

const server = http.createServer(serverListener);

async function serverListener(req, res) {
  try {
    const requestData = await getRequestData(req, res);

    res.setHeader("Content-Type", "application/json");
    if (req.url === "/user/create" && req.method === "POST") {
      await createUser(req, res, requestData);
    } else if (req.url === "/users") {
      await authenticateUser(req, res, ["admin"], requestData.userLogin);
      getUsers(req, res);
    } else if (req.url === "/books" && req.method === "GET") {
      await authenticateUser(req, res, ["admin"], requestData.userLogin);
      await getBooks(req, res);
    } else if (req.url === "/book" && req.method === "POST") {
      await authenticateUser(req, res, ["admin"], requestData.userLogin);
      await createBook(req, res, requestData.data);
    } else if (req.url === "/book" && req.method === "PATCH") {
      await authenticateUser(req, res, ["admin"], requestData.userLogin);
      await updateBook(req, res, requestData.data);
    } else if (req.url === "/book" && req.method === "DELETE") {
      await authenticateUser(req, res, ["admin"], requestData.userLogin);
      deleteBook(req, res);
    } else if (req.url === "/book/loan" && req.method === "POST") {
      loanOutBook(req, res);
    } else if (req.url === "/book/return" && req.method === "POST") {
      returnLoanedBook(req, res);
    } else {
      res.statusCode = 404;
      res.end("The route does not exists.");
    }
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    res.end(err);
  }
}

async function getUsers(req, res) {
  try {
    const users = await readDatabase(usersDbPath);
    res.end(users);
  } catch (error) {
    res.end(error);
  }
}

async function createUser(req, res, userData) {
  try {
    const users = parseDatabaseStringValue(await readDatabase(usersDbPath));

    const userExists = users.find((user) => {
      return user.username === userData.username;
    });

    if (userExists) {
      return res.end("User already exists!");
    }

    users.push(userData);
    await writeToDb(users, usersDbPath);
    res.end(
      JSON.stringify({
        message: "User created successfully",
        user: userData,
      })
    );
  } catch (error) {
    console.log(error);
    res.statusCode = 400;
    return res.end("Error creating a new user!");
  }
}

async function getBooks(req, res) {
  try {
    const books = await readDatabase(booksDbPath);
    if (books === "") return res.end(JSON.stringify([]));
    res.end(books);
  } catch (error) {
    res.end(error);
  }
}

async function createBook(req, res, newBook) {
  try {
    const books = parseDatabaseStringValue(await readDatabase(booksDbPath));
    const bookExists = books.find((book) => {
      return book.isbn === newBook.isbn;
    });
    if (bookExists) {
      res.statusCode = 405;
      return res.end("Book already exists!");
    }

    books.push(newBook);
    await writeToDb(books, booksDbPath);

    res.end(
      JSON.stringify({
        message: "Book created succesfully!",
        book: newBook,
      })
    );
  } catch (error) {
    res.statusCode = 500;
    res.end(error);
  }
}

async function updateBook(req, res, queryData) {
  try {
    const books = parseDatabaseStringValue(await readDatabase(booksDbPath));
    const bookToUpdateIndex = books.findIndex(
      (book) => book.isbn === queryData.isbn
    );
    books[bookToUpdateIndex] = { ...books[bookToUpdateIndex], ...queryData };
    await writeToDb(books, booksDbPath);
    res.end(
      JSON.stringify({
        message: "Book updated succesfully",
        book: books[bookToUpdateIndex],
      })
    );
  } catch (error) {
    res.end(error);
  }
}

function deleteBook(req, res) {
  res.end("update existing book");
}

function loanOutBook(req, res) {
  res.end("loan out book");
}

function returnLoanedBook(req, res) {
  res.end("return loaned book");
}

server.listen(3000, "127.0.0.1", () => {
  console.log("Server started.");
});
