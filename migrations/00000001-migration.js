"use strict";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sequelize = require("sequelize");

/**
 * Actions summary:
 *
 * createTable "Groups", deps: []
 * createTable "Recipients", deps: []
 * createTable "Users", deps: []
 * createTable "Credentials", deps: [Groups]
 * createTable "Issuances", deps: [Credentials]
 * createTable "RecipientIssuances", deps: [Issuances, Recipients]
 * createTable "UserGroups", deps: [Users, Groups]
 *
 **/

var info = {
  revision: 1,
  name: "migration",
  created: "2020-10-12T20:12:28.057Z",
  comment: "",
};

var migrationCommands = [
  {
    fn: "createTable",
    params: [
      "Groups",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          unique: true,
          allowNull: false,
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {},
    ],
  },

  {
    fn: "createTable",
    params: [
      "Recipients",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        email: {
          unique: true,
          allowNull: false,
          type: Sequelize.STRING,
        },
        did: {
          unique: true,
          type: Sequelize.STRING,
        },
        externalId: {
          unique: true,
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {},
    ],
  },

  {
    fn: "createTable",
    params: [
      "Users",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          unique: true,
          allowNull: false,
          type: Sequelize.STRING,
        },
        isAdmin: {
          type: Sequelize.BOOLEAN,
        },
        apiToken: {
          unique: true,
          allowNull: false,
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {},
    ],
  },

  {
    fn: "createTable",
    params: [
      "Credentials",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        title: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        template: {
          type: Sequelize.JSONB,
        },
        groupid: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: {
            model: "Groups",
            key: "id",
          },
          allowNull: true,
          type: Sequelize.INTEGER,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {},
    ],
  },

  {
    fn: "createTable",
    params: [
      "Issuances",
      {
        id: {
          autoIncrement: true,
          primaryKey: true,
          allowNull: false,
          type: Sequelize.INTEGER,
        },
        name: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        issueDate: {
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        credentialid: {
          onDelete: "SET NULL",
          onUpdate: "CASCADE",
          references: {
            model: "Credentials",
            key: "id",
          },
          allowNull: true,
          type: Sequelize.INTEGER,
        },
      },
      {},
    ],
  },

  {
    fn: "createTable",
    params: [
      "RecipientIssuances",
      {
        isIssued: {
          type: Sequelize.BOOLEAN,
        },
        issuedAt: {
          type: Sequelize.DATE,
        },
        isApproved: {
          type: Sequelize.BOOLEAN,
        },
        approvedAt: {
          type: Sequelize.DATE,
        },
        awardId: {
          unique: true,
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        issuance: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: {
            model: "Issuances",
            key: "id",
          },
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        recipient: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: {
            model: "Recipients",
            key: "id",
          },
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
      },
      {},
    ],
  },

  {
    fn: "createTable",
    params: [
      "UserGroups",
      {
        userId: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: {
            model: "Users",
            key: "id",
          },
          primaryKey: true,
          unique: "UserGroups_userId_groupId_unique",
          type: Sequelize.INTEGER,
        },
        groupId: {
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
          references: {
            model: "Groups",
            key: "id",
          },
          primaryKey: true,
          unique: "UserGroups_userId_groupId_unique",
          type: Sequelize.INTEGER,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {},
    ],
  },
];

var rollbackCommands = [
  {
    fn: "dropTable",
    params: ["Credentials"],
  },
  {
    fn: "dropTable",
    params: ["Issuances"],
  },
  {
    fn: "dropTable",
    params: ["RecipientIssuances"],
  },
  {
    fn: "dropTable",
    params: ["UserGroups"],
  },
  {
    fn: "dropTable",
    params: ["Groups"],
  },
  {
    fn: "dropTable",
    params: ["Recipients"],
  },
  {
    fn: "dropTable",
    params: ["Users"],
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
