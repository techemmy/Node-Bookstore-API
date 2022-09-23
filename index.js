const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer(serverListener);
const userDbPath = path.join(__dirname, "db", "user.json");

function getUsersFromDb() {
  return new Promise((resolve, reject) => {
    fs.readFile(userDbPath, "utf-8", (err, data) => {
      if (err) {
        reject("Error reading from file");
      }
      resolve(data);
    });
  });
}

function authenticateUser(req, res, userData) {
  return new Promise(async (resolve, reject) => {
    try {
      if (!userData) {
        return reject("Invalid input!");
      }

      const allUsers = await getUsersFromDb();

      const parsedAllUsers = JSON.parse(allUsers);
      const userFound = parsedAllUsers.find((user) => {
        return (
          user.username === userData.username &&
          user.password === userData.password
        );
      });

      if (userFound) {
        return resolve(userFound);
      } else {
        return reject("Invalid User! Try again!");
      }
    } catch (error) {
      reject(error);
    }

    // })
  });
}

function serverListener(req, res) {
  res.setHeader("Content-Type", "application/json");

  let sentData = "";
  req.on("data", (chunk) => {
    sentData += chunk.toString();
  });

  req.on("end", async () => {
    sentData = JSON.parse(sentData);

    if (req.url === "/user/create" && req.method === "POST") {
      createUser(req, res);
    }

    authenticateUser(req, res, sentData.userLogin)
      .then(() => {
        if (req.url === "/users") {
          getAllUsers(req, res);
        } else if (req.url === "/book" && req.method === "POST") {
          createBook(req, res);
        } else if (req.url === "/book" && req.method === "PATCH") {
          updateBook(req, res);
        } else if (req.url === "/book" && req.method === "DELETE") {
          deleteBook(req, res);
        } else if (req.url === "/book/loan" && req.method === "POST") {
          loanOutBook(req, res);
        } else if (req.url === "/book/return" && req.method === "POST") {
          returnLoanedBook(req, res);
        }
        // TODO: create handler for invalid route
      })
      .catch((err) => {
        res.statusCode = 400;
        res.end(err);
      });
  });
}

function createUser(req, res) {
  res.end("Create User");
}

function getAllUsers(req, res) {
  getUsersFromDb()
    .then((data) => {
      res.end(data);
    })
    .catch((err) => {
      res.end(err);
    });
}

function createBook(req, res) {
  res.end("Create new book");
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
