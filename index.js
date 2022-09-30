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

async function getRequestData(req, res) {
  return new Promise((resolve, reject) => {
    const data = [];
    req.on('data', chunk => {
      data.push(chunk);
    }).on('end', () => {
      const dataDecoded = Buffer.concat(data).toString()
      const parsedData = JSON.parse(dataDecoded)
      resolve(parsedData);
    }).on('error', error => {
      reject(error);
    })
  })
}

function parseUsersData(databaseReturnValue) {
  let parsedUsersData;
  if (databaseReturnValue === "") {
    parsedUsersData = []
  } else {
    parsedUsersData = JSON.parse(databaseReturnValue);
  }
  return parsedUsersData;
}

function authenticateUser(req, res, roles) {
  return new Promise(async (resolve, reject) => {
    try {
      const receivedData = await getRequestData(req, res);
      const userLoginData = receivedData.userLogin;

      if (!userLoginData) {
        return reject("You need to be authenticated to continue");
      }

      const allRegisteredUsers = await getUsersFromDb();

      const users = parseUsersData(allRegisteredUsers)

      const userFound = users.find((user) => {
        return (
          user.username === userLoginData.username &&
          user.password === userLoginData.password
        );
      });

      if (userFound && roles.includes(userFound.role)) {
        resolve(userFound);
      } else if (userFound && !roles.includes(userFound.role)){
        res.writeHead(401, {"content-type": "application/json"});
        reject("You don't have the required permission to perform this operation.");
      }else {
        res.writeHead(404, {"content-type": "application/json"});
        reject("Your user account doesn't exist! Create a new user.");
      }
    } catch (error) {
      reject(error);
    }

    // })
  });
}

async function serverListener(req, res) {
  try {
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/user/create" && req.method === "POST") {
      await createUser(req, res);
    } else if (req.url === "/users") {
      await authenticateUser(req, res, ["admin", "visitor"])
      getAllUsers(req, res); 
    } else if (req.url === "/book" && req.method === "POST") {
      await authenticateUser(req, res, ["admin"])
      createBook(req, res);
    } else if (req.url === "/book" && req.method === "PATCH") {
      await authenticateUser(req, res, ["admin"])
      updateBook(req, res);
    } else if (req.url === "/book" && req.method === "DELETE") {
      await authenticateUser(req, res, ["admin"])
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
    res.end(err);
  };
  // });
}

async function getAllUsers(req, res) {
  try {
    const users = await getUsersFromDb();
    res.end(users);
  } catch (error) {
    res.end(error)
  }
}

async function createUser(req, res) {
  try {
    const userData = await getRequestData(req, res);
    const allRegisteredUsers = await getUsersFromDb();

    const users = parseUsersData(allRegisteredUsers)

    const userExists = users.find((user) => {
      return user.username === userData.username;
    });

    if (userExists) {
      return res.end("User already exists!");
    }

    users.push(userData);
    fs.writeFile(usersDbPath, JSON.stringify(users), (error) => {
      if (error) {
        return res.end(error);
      }
      return res.end(JSON.stringify(userData));
    });

  } catch (error) {
    console.log(error);
    res.statusCode = 400;
    return res.end("Error creating a new user!");
  }
}

async function createBook(req, res) {
  const newBook = await getRequestData(req, res);
  console.log(newBook);
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
