const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
  },
  clockIn: {
    type: Date,
  },
  clockOut: {
    type: Date,
  },
  workTime: {
    type: Number,
    default: 0,
  },
  breakTime: {
    type: Number,
    default: 0,
  },
});

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
