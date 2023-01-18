require("dotenv").config()

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const streckRoutes = require("./routes/streck");
const userRoutes = require("./routes/user");
const healthRoute = require("./routes/health");

const app = express();
app.use(cors())

var allowedOrigins = ['http://localhost:3000',
                      'http://yourapp.com'];
app.use(cors({
  origin: function(origin, callback){
    // allow requests with no origin 
    // (like mobile apps or curl requests)
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){
      var msg = 'The CORS policy for this site does not ' +
                'allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const port = process.env.PORT || 5000;

app.use(express.json());
app.use('/',healthRoute);
app.use('/streck', streckRoutes);
app.use('/user', userRoutes);


mongoose.set("strictQuery", false);

// connect to db
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    // listen for requests
    app.listen(process.env.PORT, () => {
      console.log('connected to db & listening on port', port)
    })
  })
  .catch((error) => {
    console.log(error)
  })