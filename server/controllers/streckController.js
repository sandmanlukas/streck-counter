const Position = require("../models/positionModel");
const NextCleaners = require("../models/nextCleanerModel");
const mongoose = require("mongoose");

// get all streck
const getAllStreck = async (req, res) => {
  const streck = await Position.find({}).sort({ position_number: 1 });
  res.status(200).json(streck);
};

// get next stadstreck cleaners
const getNextStadstreckCleaners = async (req, res) => {
  const nextLatest = await NextCleaners.find({}).limit(1);

  res.status(200).json(nextLatest);
};

// get person with latest stadstreck
const getLatestStadstreck = async (req, res) => {
  const latestStadstreck = await Position.find({ stadstreck: { $gt: 0 } })
    .sort({ date_last_stadstreck: -1 })
    .limit(1);

  if (!latestStadstreck) {
    return res
      .status(404)
      .json({ error: "Something went wrong in getLatestStadstreck" });
  }
  res.status(200).json(latestStadstreck);
};


// get person with most stadstreck
const getMostStadstreck = async (req, res) => {
  const posNumberLatest = parseInt(req.params.positionNumberLatest);
  const mostStadstreck = await Position.find({
    $and: [
      { stadstreck: { $gt: 0 } },
      {
        position_number: { $ne: posNumberLatest },
      },
    ],
  })
    .sort({ stadstreck: -1 })
    .limit(1);

  if (!mostStadstreck) {
    return res
      .status(404)
      .json({ error: "Something went wrong in getMostStadstreck" });
  }

  res.status(200).json(mostStadstreck);
};


// get next obligatory cleaners
const getNextObligatoryCleaners = async (req, res) => {
  const limit = req.body.limit;
  const posNumber = req.body.position_number;
  let query = {}

  // there can be two scenarios, first is when there are two obligatory cleaners
  if (limit === 2) {
    query = { obligatory_clean: true }
    // second is when there is only one obligatory cleaner, and the other is a stadstreck cleaner
  } else {
    query = { obligatory_clean: true, position_number: { $ne: posNumber } }

  }
  const nextObligatoryCleaners = await Position.find(query)
    .sort({ position_number: 1 })
    .limit(limit);

  if (!nextObligatoryCleaners) {
    return res
      .status(404)
      .json({ error: "Something went wrong in getNextObligatoryCleaners" });
  }
  res.status(200).json(nextObligatoryCleaners);
};


// helper function to update correctly if there exists people with a negative stadstreck
async function updateNegativeStadstreck(cleaners, newCleaners) {
  for (let i = 0; i < cleaners.length; i++) {
    const posNumber = cleaners[i].position_number
    const stadstreck = cleaners[i].stadstreck
    if (stadstreck < 0) {
      // update stadstreck of posNumber to 1.
      let updateQuery = { position_number: posNumber };
      let updateStadstreck = {
        $inc: { stadstreck: 1 },
      }
      const updateResponse = await Position.updateOne(updateQuery, updateStadstreck)
    } else {
      newCleaners.push(posNumber)
      if (newCleaners.length === 2) return newCleaners;
    }
  }

  return newCleaners

}

// helper function to get stadstreck cleaners
async function getCleaners(cleaners, secondCleaner) {
  let newCleaners = []
  //TODO: there MIGHT occur a scenario when newCleaners is only one person. This might need to be handled.
  // Not sure this can happen though.
  newCleaners = await updateNegativeStadstreck(cleaners, newCleaners)
  if (newCleaners.length === 2) {
    return newCleaners
  } else {
    cleaners = await Position.find({ obligatory_clean: false, position_number: { $lt: secondCleaner } })
    newCleaners = await updateNegativeStadstreck(cleaners, newCleaners)
    return newCleaners
  }
}

// get next obligatory cleaners
const updateObligatoryCleaners = async (req, res) => {
  let pos1 = parseInt(req.params.pos1);
  let pos2 = parseInt(req.params.pos2);

  let queryCurrentCleaners = {};
  let queryNextCleaners = {};

  let nextCleanerFirst = -1;
  let nextCleanerSecond = -1;

  let cleanersResponse = {};
  // checks if there should be one or two obligatory cleaners

  if (pos2 === -1) {
    queryCurrentCleaners = { position_number: pos1 };
    cleanersResponse = await Position.find({ position_number: { $gte: (pos1 + 1 % 11) } }).sort({ position_number: 1 })
  } else {
    queryCurrentCleaners = {
      $or: [{ position_number: pos1 }, { position_number: pos2 }],
    };
    cleanersResponse = await Position.find({ obligatory_clean: false, position_number: { $gt: pos2 } }).sort({ position_number: 1 })

    // If no response was given, query again with no position_number limitation
    if (cleanersResponse.length === 0) {
      cleanersResponse = await Position.find({ obligatory_clean: false })
    }

  }


  if (!cleanersResponse) {
    return res
      .status(404)
      .json({ error: "Something went wrong in updateObligatoryCleaners" });
  }

  const cleaners = await getCleaners(cleanersResponse, pos2)

  // If two cleaners were returned, return these, else it means that all other had -1 and we should return those who just cleaned
  if (cleaners.length === 2) {
    nextCleanerFirst = cleaners[0]
    nextCleanerSecond = cleaners[1]
  } else {
    nextCleanerFirst = pos1
    nextCleanerSecond = pos2
  }

  queryNextCleaners = {
    $or: [
      { position_number: nextCleanerFirst },
      { position_number: nextCleanerSecond },
    ],
  };

  let updateCleanFalse = { $set: { obligatory_clean: false } };
  let updateCleanTrue = { $set: { obligatory_clean: true } };

  let firstUpdate = {
    updateMany: { filter: queryCurrentCleaners, update: updateCleanFalse },
  };
  let secondUpdate = {
    updateMany: { filter: queryNextCleaners, update: updateCleanTrue },
  };

  const obligatoryCleaners = await Position.bulkWrite([
    firstUpdate,
    secondUpdate,
  ]);

  if (!obligatoryCleaners) {
    return res
      .status(404)
      .json({ error: "Something went wrong in updateObligatoryCleaners" });
  }

  console.log(
    `Set obligatory_clean to false for ${pos1}, ${pos2}, set obligatory_clean to true for ${nextCleanerFirst}, ${nextCleanerSecond}`
  );
  res.status(200).json(obligatoryCleaners);
};


// update next stadstreck cleaners
const updateStadstreckCleaners = async (req, res) => {
  let nextLatestPosNumber = req.body.nextLatest;
  let nextMostPosNumber = req.body.nextMost;

  let updateNextStadstreckCleaners = {
    $set: { nextLatest: nextLatestPosNumber, nextMost: nextMostPosNumber },
  };

  const nextStadstreckCleaners = await NextCleaners.updateOne(
    {},
    updateNextStadstreckCleaners
  );

  if (!nextStadstreckCleaners) {
    return res
      .status(404)
      .json({ error: "Something went wrong in updateStadstreckCleaners" });
  }

  console.log(
    `Updated next_positions - nextLatest : ${nextLatestPosNumber}, nextMost: ${nextMostPosNumber}`
  );

  res.status(200).json(nextStadstreckCleaners);
};


// update dumstreck
const updateDumstreck = async (req, res) => {
  let updateQuery = { position_number: req.body.position_number };
  let updatedStreck = {
    $inc: {
      dumstreck: req.body.value,
      total_dumstreck: req.body.update_total ? req.body.value : 0, //TODO: perhaps change, since it creates an unecessary update
    },
  };
  const updatedDumstreck = await Position.updateOne(updateQuery, updatedStreck);

  if (!updatedDumstreck) {
    return res
      .status(404)
      .json({ error: "Something went wrong in updateDumstreck" });
  }

  console.log("1 document updated - dumstreck.");
  res.status(200).json(updatedDumstreck);
};


// update stadstreck
const updateStadstreck = async (req, res) => {
  const updateQuery = { position_number: req.body.position_number };
  const updatedStreck = {
    $set: { date_last_stadstreck: req.body.date },
    $inc: {
      stadstreck: req.body.value,
      total_stadstreck: req.body.update_total ? req.body.value : 0, //TODO: perhaps change, since it creates an unecessary update
    },
  };

  const updatedStadstreck = await Position.updateOne(
    updateQuery,
    updatedStreck
  );

  if (!updatedStadstreck) {
    return res
      .status(404)
      .json({ error: "Something went wrong in updateStadstreck" });
  }

  console.log("1 document updated - stadstreck.");
  res.status(200).json(updatedStadstreck);
};


// function to reset database
const reset = async (req, res) => {
  const currDate = new Date().toISOString();
  const reset_query = {
    $set: {
      stadstreck: 0,
      dumstreck: 0,
      obligatory_clean: false,
      date_last_stadstreck: currDate,
      total_dumstreck: 0,
      total_stadstreck: 0,
    },
  };
  const update_clean_query = { $set: { obligatory_clean: true } };
  const find_ordf_kassor = {
    $or: [{ position_number: 0 }, { position_number: 1 }],
  };
  const nextCleanersUpdate = { $set: { nextLatest: -1, nextMost: -1 } };

  const resetPositions = await Position.updateMany({}, reset_query);

  if (!resetPositions) {
    return res
      .status(404)
      .json({ error: "Something went wrong in reset - resetPositions" });
  }
  console.log("Reset all values in positions");
  const resetObligatoryClean = await Position.updateMany(
    find_ordf_kassor,
    update_clean_query
  );

  if (!resetObligatoryClean) {
    return res
      .status(404)
      .json({ error: "Something went wrong in reset - resetObligatoryClean" });
  }
  console.log("Set obligatory_clean: true for Ordf and Kassör");

  const resetNextCleaners = await NextCleaners.updateOne(
    {},
    nextCleanersUpdate
  );

  if (!resetNextCleaners) {
    return res
      .status(404)
      .json({ error: "Something went wrong in reset - resetNextCleaners" });
  }
  console.log("Reset next_cleaners.");

  res.status(200).json(resetNextCleaners);
};

module.exports = {
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
};
