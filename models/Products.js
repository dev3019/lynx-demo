const { Sequelize } = require("sequelize");
const { sequelize } = require("./sq");

const Product = sequelize.define(
  'product',
  {
    id: {
      type: Sequelize.DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: Sequelize.DataTypes.STRING(150),
      allowNull: false,
    },
    price: {
      type: Sequelize.DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: Sequelize.DataTypes.INTEGER(11),
      allowNull: true
    },
    isDeleted: {
      type: Sequelize.DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    productViewed: {
      type: Sequelize.DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: 0
    },
    createdDate: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false
    },
    updatedDate: {
      type: Sequelize.DataTypes.DATE,
      allowNull: false
    },
    deletedDate: {
      type: Sequelize.DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'product',  // Explicitly set the table name to 'product'
    timestamps: true,
    createdAt: 'createdDate',
    updatedAt: 'updatedDate'
  }
)

module.exports = {
  Product
}