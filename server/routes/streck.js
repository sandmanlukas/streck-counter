const express = require("express");

const {
  getAllStreck,
  getNextStadstreckCleaners,
  getLatestStadstreck,
  getMostStadstreck,
  getNextObligatoryCleaners,
  updateObligatoryCleaners,
  updateStadstreckCleaners,
  updateDumstreck,
  updateStadstreck,
  reset,
} = require("../controllers/streckController");

const requireAuth = require("../middleware/requireAuth");


// streckRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const streckRoutes = express.Router();

// require auth for all routes
streckRoutes.use(requireAuth)

// All routes 
streckRoutes.get("/fetchAll", getAllStreck);
streckRoutes.get("/stadstreck/nextStadstreckCleaners", getNextStadstreckCleaners);
streckRoutes.get("/stadstreck/latest", getLatestStadstreck);
streckRoutes.get("/stadstreck/most/:positionNumberLatest", getMostStadstreck);
streckRoutes.get("/stadstreck/updateObligatoryCleaners/:pos1/:pos2", updateObligatoryCleaners);
streckRoutes.get("/reset", reset);
streckRoutes.post("/stadstreck/nextObligatoryCleaners", getNextObligatoryCleaners);
streckRoutes.post("/update/stadstreck/updateStadstreckCleaners", updateStadstreckCleaners)
streckRoutes.post("/update/dumstreck", updateDumstreck);
streckRoutes.post("/update/stadstreck", updateStadstreck);

module.exports = streckRoutes;
