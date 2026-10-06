import { createProduct, getAllProducts, getProduct, updateStock } from '../controllers/productController';
import { auth } from '../middleware/auth';

const express = require('express');
const router = express.Router();

router.get('/products', auth, getAllProducts);
router.post('/products', auth, createProduct);
router.get('/products/:id', auth, getProduct);
router.patch('/products/:id/stock', auth, updateStock);

router.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong!' });
});

const productRoutes = router;
export default productRoutes;
