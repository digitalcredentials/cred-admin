"use strict";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sequelize = require("sequelize");

var info = {
  revision: 4,
  name: "migration",
  created: "2021-09-29T19:37:25.000Z",
  comment: "",
};

var migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "Credentials",
      "templatePath",
      {
        unique: false,
        allowNull: false,
        defaultValue: `default.json`,
        type: Sequelize.STRING,
      },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "Credentials",
      "templateValues",
      {
        unique: false,
        allowNull: false,
        defaultValue: {},
        type: Sequelize.JSONB,
      },
    ],
  },
];

var rollbackCommands = [
  {
    fn: "removeColumn",
    params: ["Credentials", "template", {}],
  },
  {
    fn: "removeColumn",
    params: ["Credentials", "templateValues", {}],
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
