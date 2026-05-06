const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema({
  employeeId: {
    type: Schema.Types.ObjectId,
    ref: "Employee",
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  fcmToken: {
    type: String,
    required: true,
    trim: true,
  },
});

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;
