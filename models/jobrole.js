const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobRoleSchema = new Schema({
  departmentId: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  role: {
    type: String,
    trim: true,
    required: true,
  },
});

const Jobrole = mongoose.model("Jobrole", jobRoleSchema);

module.exports = Jobrole;
