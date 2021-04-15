"use strict";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sequelize = require("sequelize");

var info = {
  revision: 3,
  name: "migration",
  created: "2021-04-12T20:11:12.000Z",
  comment: "",
};

var migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "Groups",
      "didKeyId",
      {
        unique: true,
        allowNull: false,
        type: Sequelize.STRING,
      },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "Groups",
      "didDoc",
      {
        unique: false,
        allowNull: false,
        type: Sequelize.JSONB,
      },
    ],
  },
];

var rollbackCommands = [
  {
    fn: "removeColumn",
    params: ["Groups", "didKeyId", {}],
  },
  {
    fn: "removeColumn",
    params: ["Groups", "didDoc", {}],
  },
];

module.exports = {
  pos: 0,
  up: function (queryInterface) {
    var index = this.pos;
    return new Promise(function (resolve, reject) {
      function next() {
        if (index < migrationCommands.length) {
          let command = migrationCommands[index];
          console.log("[#" + index + "] execute: " + command.fn);
          index++;
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject);
        } else resolve();
      }
      next();
    });
  },
  down: function (queryInterface) {
    var index = this.pos;
    return new Promise(function (resolve, reject) {
      function next() {
        if (index < rollbackCommands.length) {
          let command = rollbackCommands[index];
          console.log("[#" + index + "] execute: " + command.fn);
          index++;
          queryInterface[command.fn]
            .apply(queryInterface, command.params)
            .then(next, reject);
        } else resolve();
      }
      next();
    });
  },
  info: info,
};
