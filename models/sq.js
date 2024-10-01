const Sequelize = require('sequelize');
const {
  host: DB_HOST,
  username: DB_USER,
  database: DB_NAME,
  dialect: DB_DIALECT,
  port: DB_PORT,
  password: DB_PASS
} = require('../config/config.json').development;
// const { DB_PASS } = process.env;

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  benchmark: true,
  logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

class DBError extends Error {
  constructor(message) {
    super(message);
    this.name = 'DBError';
    console.error(`[${this.name}]: ${message}`);
  }
}

module.exports = {
  sequelize,
  DBError,
};
