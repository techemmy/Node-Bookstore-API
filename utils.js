const fs = require("fs");
const path = require("path");

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

function writeUsersToDb(usersArray) {
  return new Promise((resolve, reject) => {
    fs.writeFile(usersDbPath, JSON.stringify(usersArray), (error) => {
      if (error) {
        reject(error);
      }
      resolve(usersArray);
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

function parseUsersData(databaseReturnValue) {
  let parsedUsersData;
  if (databaseReturnValue === "") {
    parsedUsersData = [];
  } else {
    parsedUsersData = JSON.parse(databaseReturnValue);
  }
  return parsedUsersData;
}

function authenticateUser(req, res, roles, requestData) {
  return new Promise(async (resolve, reject) => {
    try {
      const userLoginData = requestData.userLogin;

      if (!userLoginData) {
        return reject("You need to be authenticated to continue");
      }

      const allRegisteredUsers = await getUsersFromDb();

      const users = parseUsersData(allRegisteredUsers);

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
    getUsersFromDb,
    writeUsersToDb,
    getRequestData,
    parseUsersData,
    authenticateUser
}