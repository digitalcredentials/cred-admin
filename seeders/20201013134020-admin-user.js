"use strict";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { v4: uuidv4 } = require("uuid");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const jwt = require("jsonwebtoken");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const bcrypt = require("bcrypt");

module.exports = {
  up: async (queryInterface) => {
    const uuid = uuidv4();
    const apiToken = bcrypt.hashSync(uuid, 10);
    const name = "Admin";
    await queryInterface.bulkInsert("Users", [
      {
        name,
        isAdmin: true,
        apiToken,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    return console.log(
      `Created Admin user with token: ${jwt.sign(
        { name, apiToken: uuid },
        process.env.CA_JWT_SECRET || "secret"
      )}`
    );
  },

  down: async (queryInterface) => {
    return await queryInterface.bulkDelete("Users", {
      where: { name: "Admin" },
    });
  },
};
