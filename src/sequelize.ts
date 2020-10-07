import { Sequelize } from 'sequelize-typescript';

const sequelize =  new Sequelize(process.env.CA_DB_CONNECTION_URL);

sequelize.addModels([`${__dirname}/models`]);

module.exports = sequelize;
