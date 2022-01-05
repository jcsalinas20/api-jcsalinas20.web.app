const express = require("express");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongo = require("mongoose");
const app = express();

const port = process.env.PORT;
const db = process.env.DB;

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

mongo.Promise = global.Promise;
mongo.connect(
  db,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log('Error al conectar con la Base de Datos.');
    } else {
      console.log('Conexion con la Base de Datos establecida.');
    }
  }
);

app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );
  next();
});

app.listen(port, async () => {
  console.log("API REST corriendo en el puerto " + port);
});
