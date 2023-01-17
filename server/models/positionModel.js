const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// schema for the positions collection
const positionSchema = new Schema(
  {
    position: {
      type: String,
      required: true,
    },
    dumstreck: {
      type: Number,
      required: true,
    },
    stadstreck: {
      type: Number,
      min: [-1, "Can't have less than -1 städstreck."],
      required: true,
    },
    position_number: {
      type: Number,
      required: true,
    },
    date_last_stadstreck: {
      type: Date,
      required: true,
    },
    obligatory_clean: {
      type: Boolean,
      required: true,
    },
    total_stadstreck: {
      type: Number,
      required: true,
    },
    total_dumstreck: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Position", positionSchema, "positions");
