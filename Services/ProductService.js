const axios = require('axios');
const { Product } = require('../models');
const { DBError } = require('../models/sq');
const { Op } = require('sequelize');
class ProductService {
  async getProduct({ id, cur }) {
    try {
      //@note Fetching product from db
      let productResult = await Product.findOne({
        where: {
          id: parseInt(id),
        },
      });
      if (!productResult) {
        return null;
      }
      //@note Increment and Save the updated product back to the database
      productResult.productViewed += 1;
      await productResult.save();

      if (cur) {
        const UsdPrice = productResult.price;
        const rate = await this.fetchCovertionRate(cur.toUpperCase());

        //@note update the price in returned DB object
        productResult.dataValues = {
          ...productResult.dataValues,
          price: this.convertPrice(rate, UsdPrice),
        };
      }
      return productResult;
    } catch (error) {
      if (!(error instanceof DBError || error instanceof AxiosCustomError)) {
        //DBError already logs the error
        console.error(
          `[getProduct-ProductService]: Unknown error occurred - ${error}`
        );
      }
      throw error;
    }
  }

  async getMostViewed({ limit, cur }) {
    try {
      const productsResult = await Product.findAll({
        limit: limit || 5,
        where:{
          productViewed: {
            [Op.gte]: 1
          }
        },
        order: [['productViewed', 'DESC']]
      });

      if (!productsResult) return null;

      //@note store save() promises for each product and process after loop
      const productsViewedPromies = [];
      productsResult.forEach((product) => {
        product.productViewed += 1;
        productsViewedPromies.push(product.save());
      });
      await Promise.all(productsViewedPromies);

      if (cur) {
        const rate = await this.fetchCovertionRate(cur.toUpperCase());
        var updatedProductsResult = productsResult.map((product) => {
          const UsdPrice = product.price;
          return {
            ...product.toJSON(),
            price: this.convertPrice(rate, UsdPrice),
          };
        });
      }
      return cur ? updatedProductsResult : productsResult;
    } catch (error) {
      if (
        !(
          error instanceof DBError ||
          error instanceof AxiosCustomError
        )
      ) {
        //DBError already logs the error
        console.error(
          `[getProduct-ProductService]: Unknown error occurred - ${error}`
        );
      }
      throw error;
    }
  }

  convertPrice(rate, priceToCovert) {
    return rate * priceToCovert;
  }

  async fetchCovertionRate(cur) {
    const priceResult = await axios.get(
      `https://api.currencylayer.com/change?access_key=ebc13402623123f3f89b72a6b4e46bf7&currencies=${cur}`
    );

    //@note handle axios error
    if (!priceResult.data.success) {
      if (priceResult.data.error.code === 202) {
        throw new AxiosCustomError(
          'You have provided invalid Currency Code. [Required format: to=GBP]'
        );
      }
      throw new AxiosCustomError(priceResult.data.error.info);
    }
    return priceResult.data.quotes[`USD${cur}`].end_rate;
  }
}

class AxiosCustomError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AxiosCustomError';
    console.error(`[${this.name}]: ${message}`);
  }
}

module.exports = {
  ProductService,
  AxiosCustomError,
};
