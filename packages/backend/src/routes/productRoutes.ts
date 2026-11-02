const express = require('express');

import { createProduct, getAllProducts, getProduct, updateStock } from '../controllers/productController';
import { auth } from '../middleware/auth';
const router = express.Router();

router.get('/products', auth, getAllProducts);
router.post('/products', auth, createProduct);
router.get('/products/:id', auth, getProduct);
router.patch('/products/:id/stock', auth, updateStock);

router.use((err, _req, res) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong!' });
});

const productRoutes = router;
export default productRoutes;
