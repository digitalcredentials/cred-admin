const conf = {
  use_env_variable: 'CA_DB_CONNECTION_URL',
  seederStorage: 'sequelize',
}

module.exports = {
  development: conf,
  test: conf,
  production: conf,
}
