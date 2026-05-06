const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const leavePolicySchema = new Schema({
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  leaveType: {
    type: String,
    required: true,
    trim: true,
  },
  maxLeavePerYear: {
    type: Number,
    required: true,
  },
  maxConsecutiveLeave: {
    type: Number,
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

const LeavePolicy = mongoose.model("LeavePolicy", leavePolicySchema);

module.exports = LeavePolicy;
