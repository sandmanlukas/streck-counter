const express = require("express");

// controller functions
const { health } = require("../controllers/healthController");

const router = express.Router();

// login route
router.get("/health", health);

module.exports = router;
