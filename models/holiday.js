const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const holidaySchema = new Schema({
  holidayName: {
    type: String,
    trim: true,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  type: {
    type: String,
    trim: true,
    required: true,
  },
  paid: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Holiday = mongoose.model("Holiday", holidaySchema);

module.exports = Holiday;
