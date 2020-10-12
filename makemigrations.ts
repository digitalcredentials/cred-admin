#!./node_modules/.bin/ts-node

import "./src/LoadEnv";
import sequelize from "./src/sequelize";
import { SequelizeTypescriptMigration } from "sequelize-typescript-migration";

const mm = async () =>
  await SequelizeTypescriptMigration.makeMigration(sequelize, {
    outDir: `${__dirname}/migrations`,
    migrationName: "migration",
    preview: false,
  });

try {
  mm();
} catch (err) {
  console.error(err);
}
