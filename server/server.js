require("dotenv").config({ path: "./config.env" });

const express = require("express");
const mongoose = require("mongoose");

const streckRoutes = require("./routes/streck");
const userRoutes = require("./routes/user");

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/streck',streckRoutes);
app.use('/user',userRoutes);

mongoose.set("strictQuery", false);

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', process.env.PORT)
    })
  })
  .catch((error) => {
    console.log(error)
  })