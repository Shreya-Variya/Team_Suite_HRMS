const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const employeeSchema = new Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true,
  },
  employeeName: {
    type: String,
    required: true,
    trim: true,
  },
  dob: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    trim: true,
  },
  maritalStatus: {
    type: Boolean,
    default: false,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  mobileNo: {
    type: String,
    required: true,
    trim: true,
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
  },
  education: {
    type: String,
    required: true,
    trim: true,
  },
  experience: {
    type: Number,
    required: true,
  },
  department: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  jobRole: {
    type: Schema.Types.ObjectId,
    ref: "Jobrole",
  },
  joinDate: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  companyId: {
    type: Schema.Types.ObjectId,
    ref: "Company",
    required: true,
    index: true,
  },
  companyName: {
    type: String,
    required: true,
    trim: true,
  },
});

employeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });

const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
