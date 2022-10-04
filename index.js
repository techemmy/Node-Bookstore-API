const http = require("http");
const fs = require("fs");
const { getUsersFromDb, writeUsersToDb, getRequestData, parseUsersData, authenticateUser } = require('./utils');

const server = http.createServer(serverListener);

async function serverListener(req, res) {
  try {
    const requestData = await getRequestData(req, res);

    res.setHeader("Content-Type", "application/json");
    if (req.url === "/user/create" && req.method === "POST") {
      await createUser(req, res, requestData);
    } else if (req.url === "/users") {
      await authenticateUser(req, res, ["admin"], requestData)
      getAllUsers(req, res);
    } else if (req.url === "/book" && req.method === "POST") {
      await authenticateUser(req, res, ["admin"], requestData)
      createBook(req, res, requestData);
    } else if (req.url === "/book" && req.method === "PATCH") {
      await authenticateUser(req, res, ["admin"], requestData)
      updateBook(req, res);
    } else if (req.url === "/book" && req.method === "DELETE") {
      await authenticateUser(req, res, ["admin"], requestData)
      deleteBook(req, res);
    } else if (req.url === "/book/loan" && req.method === "POST") {
      loanOutBook(req, res);
    } else if (req.url === "/book/return" && req.method === "POST") {
      returnLoanedBook(req, res);
    } else {
        res.statusCode = 404;
        res.end("The route does not exists.")
    }
  } catch(err) {
    console.log(err);
    res.statusCode = 500;
    res.end(err);
  };
}

async function getAllUsers(req, res) {
  try {
    const users = await getUsersFromDb();
    res.end(users);
  } catch (error) {
    res.end(error)
  }
}

async function createUser(req, res, userData) {
  try {
    const allRegisteredUsers = await getUsersFromDb();

    const users = parseUsersData(allRegisteredUsers)

    const userExists = users.find((user) => {
      return user.username === userData.username;
    });

    if (userExists) {
      return res.end("User already exists!");
    }

    users.push(userData);
    await writeUsersToDb(users);
    res.end(JSON.stringify({
      message: "User created successfully",
      user: userData
    }))

  } catch (error) {
    console.log(error);
    res.statusCode = 400;
    return res.end("Error creating a new user!");
  }
}

function createBook(req, res, newBook) {
  try {
    console.log(newBook);
    res.end("Create new book");
  } catch (error) {
    res.statusCode = 500;
    res.end(error);
  }
}

function updateBook(req, res) {
  res.end("update existing book");
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
