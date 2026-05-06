const mongoose = require("mongoose");
var firebaseadmin = require("firebase-admin");
const Employee = require("../models/employee");
const Notification = require("../models/notification");
var serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
const LeavePolicy = require("../models/leavepolicy");
const Leave = require("../models/leave");

firebaseadmin.initializeApp({
  credential: firebaseadmin.credential.cert(serviceAccount),
});

//Constroller that stores the fcm token
module.exports.saveFcmToken = async (req, res) => {
  try {
    //Check that body is empty or not
    if (req.body == null) {
      return res.status(400).json({
        success: false,
        message: "Please pass the necessary data.",
      });
    } else {
      const { employeeId, category, fcmToken } = req.body;

      if (!mongoose.isValidObjectId(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      }

      //Check employee id is correct or not means exist or not
      const employee = await Employee.findById(employeeId);
      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Employee not found." });
      } else {
        //Check the token is already exist or not
        const existingToken = await Notification.findOne({
          employeeId: employeeId,
        });
        if (existingToken) {
          existingToken.fcmToken = fcmToken;
          await existingToken.save();
          return res
            .status(200)
            .json({ success: true, message: "FCM Token stored successfully." });
        } else {
          const saveToken = await Notification.create({
            employeeId: employeeId,
            category: category,
            fcmToken: fcmToken,
          });
          console.log(saveToken);
          return res
            .status(200)
            .json({ success: true, message: "FCM Token stored successfully." });
        }
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that remove the fcm token
module.exports.removeFcmToken = async (req, res) => {
  try {
    let { empid } = req.params;
    console.log(empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    let deleteToken = await Notification.findOneAndDelete({
      employeeId: empid,
    });
    console.log(deleteToken);
    if (!deleteToken) {
      return res.status(404).json({
        success: false,
        message: "Employee ID is incorrect. Employee token not found.",
      });
    }
    return res.status(200).json({
      success: true,
      message: "FCM Token Deleted Successfully.",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that send notification to admin
module.exports.sendNotificationToAdmin = async (req, res) => {
  try {
    //Check that body is empty or not
    if (req.body == null) {
      return res.status(400).json({
        success: false,
        message: "Please pass the necessary data.",
      });
    } else {
      console.log(req.body);
      const { adminId, leaveId, employeeId, title, body, type } = req.body;

      if (!mongoose.isValidObjectId(adminId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      }

      if (!mongoose.isValidObjectId(leaveId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      }

      if (!mongoose.isValidObjectId(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      }

      //Check that adminId is correct & valid or not
      const admin = await Employee.findById(adminId);
      console.log(admin);
      if (!admin) {
        return res
          .status(404)
          .json({ success: false, message: "Admin not found." });
      } else {
        //Check that leaveId is correct or not
        const leave = await Leave.findById(leaveId);
        console.log(leave);
        if (!leave) {
          return res
            .status(404)
            .json({ success: false, message: "Leave Data not found." });
        }
        //Check that employeeId is correct or not
        const employee = await Employee.findById(employeeId);
        console.log(employee);
        if (!employee) {
          return res
            .status(404)
            .json({ success: false, message: "Employee not found." });
        }
        //Find the token of admin
        const tokenData = await Notification.findOne({
          employeeId: adminId,
          category: "Admin",
        });
        console.log(tokenData);
        if (!tokenData) {
          return res
            .status(404)
            .json({ success: false, message: "No token found with given id." });
        } else {
          //Send the notification
          const msg = {
            token: tokenData.fcmToken,
            notification: {
              title: title,
              body: body,
            },
            data: {
              title: String(title),
              body: String(body),
              leaveId: String(leaveId),
              employeeId: String(employeeId),
              type: String(type),
            },
          };
          const send = await firebaseadmin.messaging().send(msg);
          console.log(send);
          return res.status(200).json({
            success: true,
            message: "Notification sent successfully.",
          });
        }
      }
    }
  } catch (err) {
    console.log("Error : ", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that send notification to employee
module.exports.sendNotificationToAEmployee = async (req, res) => {
  try {
    //Check that body is empty or not
    if (req.body == null) {
      return res.status(400).json({
        success: false,
        message: "Please pass the necessary data.",
      });
    } else {
      const { employeeId, title, body, type } = req.body;
      console.log(req.body);

      if (!mongoose.isValidObjectId(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      }

      //Check that employeeId is correct or not
      const employee = await Employee.findById(employeeId);
      console.log(employee);
      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Employee not found." });
      }

      //Find the token of employee
      const tokenData = await Notification.findOne({
        employeeId: employeeId,
        category: "Employee",
      });
      console.log(tokenData);
      if (!tokenData) {
        return res
          .status(404)
          .json({ success: false, message: "No token found with given id." });
      } else {
        //Send the notification
        const msg = {
          token: tokenData.fcmToken,
          notification: {
            title: title,
            body: body,
          },
          data: {
            title: String(title),
            body: String(body),
            employeeId: String(employeeId),
            type: String(type),
          },
        };
        const send = await firebaseadmin.messaging().send(msg);
        console.log(send);
        return res.status(200).json({
          success: true,
          message: "Notification sent successfully.",
        });
      }
    }
  } catch (err) {
    console.log("Error : ", err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
