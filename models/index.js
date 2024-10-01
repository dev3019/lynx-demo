'use strict';
const { sequelize, DBError } = require('./sq');
const { Product } = require('./Products')



async function databaseInit() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await sequelize.sync()
    console.log('Tables created')
  } catch (error) {
    // console.error('Unable to connect to the database:', error);
    throw new DBError(error)
  }
}
module.exports.databaseInit = databaseInit;
module.exports.Product = Product;