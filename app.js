const express = require("express");
const path = require("path");
const cors = require('cors')
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const adminRoutes = require("./routes/admin");
const mobileRoutes = require('./routes/mobile');
const authRoutes = require('./routes/auth');
const addRoutes = require('./routes/add');
require('dotenv').config();

const app = express();
app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.json());

app.use('*',(req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://farming-harvesting.web.app')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Autorization')
  res.send({test: 'OK'});
  
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
