"use strict";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sequelize = require("sequelize");

var info = {
  revision: 2,
  name: "migration",
  created: "2021-02-02T19:25:18.000Z",
  comment: "",
};

var migrationCommands = [
  {
    fn: "addColumn",
    params: [
      "RecipientIssuances",
      "issuanceId",
      {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: "Issuances",
          key: "id",
        },
        primaryKey: true,
        unique: "RecipientIssuances_recipientId_issuanceId_unique",
        type: Sequelize.INTEGER,
      },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "RecipientIssuances",
      "recipientId",
      {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: "Recipients",
          key: "id",
        },
        primaryKey: true,
        unique: "RecipientIssuances_recipientId_issuanceId_unique",
        type: Sequelize.INTEGER,
      },
    ],
  },
  {
    fn: "removeColumn",
    params: ["RecipientIssuances", "issuance", {}],
  },
  {
    fn: "removeColumn",
    params: ["RecipientIssuances", "recipient", {}],
  },
];

var rollbackCommands = [
  {
    fn: "addColumn",
    params: [
      "RecipientIssuances",
      "issuance",
      {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: "Issuances",
          key: "id",
        },
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
    ],
  },
  {
    fn: "addColumn",
    params: [
      "RecipientIssuances",
      "recipient",
      {
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
        references: {
          model: "Recipients",
          key: "id",
        },
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
    ],
  },
  {
    fn: "removeColumn",
    params: ["RecipientIssuances", "issuanceId", {}],
  },
  {
    fn: "removeColumn",
    params: ["RecipientIssuances", "recipientId", {}],
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
