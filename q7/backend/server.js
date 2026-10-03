const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const categoryRoutes = require('./routes/categoryRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://127.0.0.1:27017/shopping_cart')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
