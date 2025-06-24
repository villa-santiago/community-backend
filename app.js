require('dotenv').config();
require('./db'); 

const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);

const postRoutes = require('./routes/post.routes');
app.use('/posts', postRoutes);


app.get('/', (req, res) => {
  res.json({ message: 'Project API is running' });
});


module.exports = app;
