const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const verificationCodeSchema = new Schema({
  emailFrom: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  emailTo: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  verificationcode: {
    type: Number,
    required: true,
  },
  creationTime: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  expirationTime: {
    type: Date,
    required: true,
    default: Date.now() + 600000,
  },
});

const VerificationCode = mongoose.model(
  "VerificationCode",
  verificationCodeSchema,
);

module.exports = VerificationCode;
