const http = require("http");
const path = require("path");
const fs = require("fs");

const server = http.createServer(serverListener);
const usersDbPath = path.join(__dirname, "db", "user.json");

function getUsersFromDb() {
  return new Promise((resolve, reject) => {
    fs.readFile(usersDbPath, "utf-8", (err, data) => {
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
        return reject("You need to be authenticated to continue");
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

async function serverListener(req, res) {
  res.setHeader("Content-Type", "application/json");

  if (req.url === "/user/create" && req.method === "POST") {
    await createUser(req, res);
  }

  let sentData = "";
  req.on("data", (chunk) => {
    sentData += chunk;
  });

  req.on("end", async () => {
    sentData = JSON.parse(sentData);

    authenticateUser(req, res, sentData.userLogin)
      .then((user) => {
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

async function createUser(req, res) {
  try {
    let userData = "";
    const usersDB = await getUsersFromDb();
    if (!usersDB) {
      return res.end("Couldn't read anything from the DB");
    }

    let allUsers = JSON.parse(usersDB);

    req.on("data", (chunk) => {
      userData += chunk.toString();
    });

    req.on("end", () => {
      const parsedUser = JSON.parse(userData);

      const userExists = allUsers.find((user) => {
        return user.username === parsedUser.username;
      });

      if (userExists) {
        return res.end("User already exists!");
      }
      allUsers.push(parsedUser);
      console.log("allUs: ", allUsers);

      fs.writeFile(usersDbPath, JSON.stringify(allUsers), (error) => {
        if (error) {
          return res.end(error);
        }
      });

      return res.end(JSON.stringify(parsedUser));
    });
  } catch (error) {
    console.log(error);
    res.statusCode = 400;
    return res.end("Error creating a new user!");
  }
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
