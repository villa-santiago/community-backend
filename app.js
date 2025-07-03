require('dotenv').config();
require('./db'); 

const express = require('express');
const cors = require('cors');

const app = express();


app.use(cors());
app.use(express.json());

// ROUTES
//Auth routes
const authRoutes = require('./routes/auth.routes');
app.use('/auth', authRoutes);


//Post routes
const postRoutes = require('./routes/post.routes');
app.use('/posts', postRoutes);

//User routes
const userRoutes = require("./routes/user.routes");
app.use("/users", userRoutes);


//Entry point routes
app.get('/', (req, res) => {
  res.json({ message: 'Project API is running' });
});


//Testing the connection with the frontend
app.get("/api/ping", (req, res) => {
  res.json({ message: "pong from backend" });
});



module.exports = app;
