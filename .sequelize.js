const conf = {
  username: 'credadmin',
  password: 'admin_cred_access',
  database: 'credadmin',
  host: 'db',
  port: 5432,
  dialect: 'postgres',
  seederStorage: 'sequelize',
}

module.exports = {
  development: conf,
  test: conf,
  production: conf,
}