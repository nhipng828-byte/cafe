const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/auth.routes');
const posRoutes = require('./routes/pos.routes');
const productsRoutes = require('./routes/products.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const reportsRoutes = require('./routes/reports.routes');
const staffRoutes = require('./routes/staff.routes');
const promotionsRoutes = require('./routes/promotions.routes');
const categoriesRoutes = require('./routes/categories.routes');
const invoicesRoutes = require('./routes/invoices.routes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/pos', posRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/promotions', promotionsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/invoices', invoicesRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
