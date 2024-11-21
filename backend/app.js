require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const loginRoutes = require('./routes/loginRoutes');
const pendingUserRoutes = require('./routes/pendingUserRoutes');
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const addressRoutes = require('../backend/routes/addressRoutes');

const app = express();

const corsOptions = {
  origin: [ "http://localhost:3001", "https://seasavor-final.vercel.app" ],
  methods: ["GET", "POST", "PUT", "DELETE", "UPDATE", "PATCH"]
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '50mb', extended: true }));

app.use(bodyParser.json({ limit: '50mb'}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(fileUpload());


mongoose.connect('mongodb+srv://ramyela:12345@dfpmsdatabase.atxjwpd.mongodb.net/')
  .then(() => console.log('MongoDB connected'))
  .catch((error) => console.error('MongoDB connection error:', error));
  

  app.use('/auth', authRoutes);
  app.use('/api', adminRoutes);
  app.use('/login', loginRoutes);
  app.use('/user', userRoutes);
  app.use('/api', pendingUserRoutes);
  app.use('/auth/admin', adminAuthRoutes);
  app.use('/api', productRoutes);
  app.use('/api', cartRoutes);
  app.use('/api', addressRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});