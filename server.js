const express = require('express');
const cors = require('cors');
const { v4 } = require('uuid');
const { databaseInit, Product } = require('./models');
const { sequelize, DBError } = require('./models/sq');
const { Op, Error: SequelizeError } = require('sequelize');
const axios = require('axios');
const {
  ProductService,
  AxiosCustomError,
} = require('./Services/ProductService');
const productService = new ProductService();
async function startServer() {
  try {
    const app = express();
    app.use(express.json());
    app.use(cors());

    await databaseInit();

    app.get('/products/most-viewed', async (req, res) => {
      try {
        const { limit, to: cur } = req.query;
        const products = await productService.getMostViewed({ limit: parseInt(limit), cur });
        if (!products)
          return res
            .status(404)
            .json({ status: 'failure', message: 'Products not found' });
        return res.status(200).json({
          status: 'success',
          data: {
            products,
          },
        });
      } catch (error) {
        if (error instanceof AxiosCustomError) {
          return res
            .status(400)
            .json({ success: 'False', message: error.message });
        }
        if (error instanceof DBError || error instanceof SequelizeError) {
          return res
            .status(503)
            .json({ success: 'False', message: 'Service Unvailable.' });
        }

        //@note handle any unexpected error
        console.error(`[getProduct]: ${error}`);
        res
          .status(500)
          .json({ success: 'False', message: 'Internal Server Error.' });
      }
    });
    app.get('/products/:id', async (req, res) => {
      try {
        const { id } = req.params;
        const { to: cur } = req.query;
        if (!id) {
          return res.status(400).json({
            status: 'failure',
            message: 'Required Params missing',
          });
        }

        //@note fetch product details using ProductService class
        const productResult = await productService.getProduct({ id, cur });
        if (!productResult)
          return res
            .status(404)
            .json({ status: 'failure', message: 'Product not found' });

        return res.status(200).json({
          status: 'success',
          data: {
            product: productResult,
          },
        });
      } catch (error) {
        if (error instanceof AxiosCustomError) {
          return res
            .status(400)
            .json({ success: 'False', message: error.message });
        }
        if (error instanceof DBError || error instanceof SequelizeError) {
          return res
            .status(503)
            .json({ success: 'False', message: 'Service Unvailable.' });
        }

        //@note handle any unexpected error
        console.error(`[getProduct]: ${error}`);
        res
          .status(500)
          .json({ success: 'False', message: 'Internal Server Error.' });
      }
    });

    app.listen(3000, () => {
      console.log('server started at: 3000');
    });
  } catch (error) {
    if (error instanceof DBError) {
      console.error('DB not connected.');
    } else console.log(error);
    process.exit(1);
  }
}

startServer();
