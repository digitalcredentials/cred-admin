import { Sequelize } from "sequelize-typescript";
import logger from "@shared/Logger";
import config from "./config";

const sequelize = new Sequelize(config.dbConnectionUrl, {
  logging: (sql) => logger.debug(sql),
});

sequelize.addModels([`${__dirname}/models`]);

export default sequelize;
