const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const attendanceHistorySchema = new Schema({
  attendanceId: {
    type: Schema.Types.ObjectId,
    ref: "Attendance",
  },
  clockIn: {
    type: Date,
  },
  clockOut: {
    type: Date,
  },
  breakIn: {
    type: Date,
  },
  breakOut: {
    type: Date,
  },
  type: {
    type: String,
    trim: true,
  },
});

const AttendanceHistory = mongoose.model(
  "AttendanceHistory",
  attendanceHistorySchema,
);

module.exports = AttendanceHistory;
