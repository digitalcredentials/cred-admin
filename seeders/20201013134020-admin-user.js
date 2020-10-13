"use strict";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require("uuid");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require("jsonwebtoken");

module.exports = {
  up: async (queryInterface) => {
    const apiToken = uuidv4();
    await queryInterface.bulkInsert("Users", [
      {
        name: "Admin",
        isAdmin: true,
        apiToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    return console.log(
      `Created Admin user with token: ${jwt.sign(
        apiToken,
        process.env.CA_JWT_TOKEN || "secret"
      )}`
    );
  },

  down: async (queryInterface) => {
    return await queryInterface.bulkDelete("Users", {
      where: { name: "Admin" },
    });
  },
};
