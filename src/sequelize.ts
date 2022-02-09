import { Sequelize } from "sequelize-typescript";
import logger from "@shared/Logger";

if (!process.env.CA_DB_CONNECTION_URL) {
  throw new Error("CA_DB_CONNECTION_URL is not defined in evironment!");
}

const sequelize = new Sequelize(process.env.CA_DB_CONNECTION_URL || "", {
  logging: (sql) => logger.debug(sql),
});

sequelize.addModels([`${__dirname}/models`]);

export default sequelize;
