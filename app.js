const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/admin");
const mobileRoutes = require('./routes/mobile');
const authRoutes = require('./routes/auth');
const addRoutes = require('./routes/add');
require('dotenv').config();

const app = express();
console.clear()
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.json());

app.options('*', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  next();
});
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://harvest-app-66x0.onrender.com')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Autorization')
  next()
})
app.use(express.static(path.join(__dirname, "public")));


app.use(adminRoutes, bodyParser.json());
app.use(mobileRoutes, bodyParser.json());
app.use(authRoutes, bodyParser.json());
app.use(addRoutes, bodyParser.json())

mongoose
  .connect(process.env.MONGO_DB)
  .then((responce) => {

    app.listen(process.env.PORT || 3000, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  })
  .catch((error) => {
    const err = new Error('error connecting to database');
    throw err;
  });
