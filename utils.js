const fs = require("fs");
const path = require("path");

const usersDbPath = path.join(__dirname, "db", "user.json");
const booksDbPath = path.join(__dirname, "db", "book.json");

function readDatabase(pathToDatabase) {
  return new Promise((resolve, reject) => {
    fs.readFile(pathToDatabase, "utf-8", (err, data) => {
      if (err) {
        reject("Error reading from file");
      }
      resolve(data);
    });
  });
}

function writeToDb(newObjArray, Db) {
  return new Promise((resolve, reject) => {
    fs.writeFile(Db, JSON.stringify(newObjArray), (error) => {
      if (error) {
        reject(error);
      }
      resolve(newObjArray);
    });
  })
}

function getRequestData(req, res) {
  return new Promise((resolve, reject) => {
    const data = [];
    req
      .on("data", (chunk) => {
        data.push(chunk);
      })
      .on("end", () => {
        const dataDecoded = Buffer.concat(data).toString();
        const parsedData = JSON.parse(dataDecoded);
        resolve(parsedData);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
}

function parseDatabaseStringValue(databaseReturnValue) {
  let parsedData;
  if (databaseReturnValue === "") {
    parsedData = [];
  } else {
    parsedData = JSON.parse(databaseReturnValue);
  }
  return parsedData;
}

function authenticateUser(req, res, roles, userLoginData) {
  return new Promise(async (resolve, reject) => {
    try {

      if (!userLoginData) {
        return reject("You need to be authenticated to continue");
      }

      const allRegisteredUsers = await readDatabase(usersDbPath);
      const users = parseDatabaseStringValue(allRegisteredUsers);

      const userFound = users.find((user) => {
        return (
          user.username === userLoginData.username &&
          user.password === userLoginData.password
        );
      });

      if (userFound && roles.includes(userFound.role)) {
        resolve(userFound);
      } else if (userFound && !roles.includes(userFound.role)) {
        res.statusCode = 401;
        reject(
          "You don't have the required permission to perform this operation."
        );
      } else {
        res.statusCode = 404;
        reject("Your user account doesn't exist! Create a new user.");
      }
    } catch (error) {
      reject(error);
    }
  });
}

module.exports = {
    usersDbPath,
    booksDbPath,
    readDatabase,
    writeToDb,
    getRequestData,
    parseDatabaseStringValue,
    authenticateUser
}