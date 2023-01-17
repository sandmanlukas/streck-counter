const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// schema for the next_cleaners collection
const nextCleanersSchema = new Schema(
  {
    nextLatest: {
      type: Number,
      required: true,
    },
    nextMost: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "NextCleaners",
  nextCleanersSchema,
  "next_cleaners"
);
