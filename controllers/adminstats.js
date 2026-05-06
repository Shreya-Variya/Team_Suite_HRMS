const mongoose = require("mongoose");
const Company = require("../models/company");
const Employee = require("../models/employee");
const Attendance = require("../models/attendance");
const Leave = require("../models/leave");

//Controller that return the total number of employees for particular company
module.exports.getTotalEmployees = async (req, res) => {
  try {
    const { companyid } = req.params;
    console.log(companyid);
    if (!mongoose.isValidObjectId(companyid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    } else {
      const company = await Company.findById(companyid);
      console.log(company);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found.",
        });
      }

      //Count total employees of company
      const totalEmployees = await Employee.countDocuments({
        companyId: companyid,
      });
      console.log(totalEmployees);

      return res.status(200).json({
        success: true,
        message: "Total employees fetched successfully.",
        totalEmployees: totalEmployees,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that returns the todays number of present and absent employees of company
module.exports.todaysAttendance = async (req, res) => {
  try {
    const { companyid } = req.params;
    console.log(companyid);
    if (!mongoose.isValidObjectId(companyid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    } else {
      const company = await Company.findById(companyid);
      console.log(company);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found.",
        });
      }

      //Get all employees of company
      const employees = await Employee.find({
        companyId: companyid,
      }).select("_id");

      const employeeIds = employees.map((emp) => emp._id);

      // Today's start and end time
      const today = new Date();

      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0,
      );

      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999,
      );

      // Find attendance records of today
      const attendanceRecords = await Attendance.find({
        employeeId: { $in: employeeIds },
        clockIn: {
          $gte: startOfDay,
          $lte: endOfDay,
        },
      }).select("employeeId");

      // Get unique present employee ids
      const presentEmployeeIds = new Set(
        attendanceRecords.map((record) => record.employeeId.toString()),
      );

      //Leave Records
      const leaves = await Leave.find({
        employeeId: { $in: employeeIds },
        status: "Approved",
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay },
      }).select("employeeId");

      const leaveEmployeeIds = new Set(
        leaves.map((leave) => leave.employeeId.toString()),
      );

      presentEmployeeIds.forEach((id) => {
        if (leaveEmployeeIds.has(id)) {
          leaveEmployeeIds.delete(id);
        }
      });

      const totalPresentEmployees = presentEmployeeIds.size;
      const totalLeaveEmployees = leaveEmployeeIds.size;
      const totalEmployees = employees.length;
      const totalAbsentEmployees =
        totalEmployees - totalPresentEmployees - totalLeaveEmployees;

      return res.status(200).json({
        success: true,
        message: "Today's attendance fetched successfully.",
        totalEmployees: totalEmployees,
        totalPresentEmployees: totalPresentEmployees,
        totalAbsentEmployees: totalAbsentEmployees,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Contoller that return the total number of on leave employee of company today
module.exports.onLeaveEmployees = async (req, res) => {
  try {
    const { companyid } = req.params;
    console.log(companyid);
    if (!mongoose.isValidObjectId(companyid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    } else {
      const company = await Company.findById(companyid);
      console.log(company);
      if (!company) {
        return res.status(404).json({
          success: false,
          message: "Company not found.",
        });
      }

      //Get all employees of company
      const employees = await Employee.find({
        companyId: companyid,
      }).select("_id");

      const employeeIds = employees.map((emp) => emp._id);

      // Today's start and end time
      const today = new Date();

      const startOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        0,
        0,
        0,
        0,
      );

      const endOfDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        23,
        59,
        59,
        999,
      );

      const leaves = await Leave.find({
        employeeId: { $in: employeeIds },
        status: "Approved",
        startDate: { $lte: endOfDay },
        endDate: { $gte: startOfDay },
      }).select("employeeId");

      // Unique employee ids who are on leave today
      const onLeaveEmployeeIds = new Set(
        leaves.map((leave) => leave.employeeId.toString()),
      );

      const totalOnLeaveEmployees = onLeaveEmployeeIds.size;

      return res.status(200).json({
        success: true,
        message: "Today's on leave employees count fetched successfully.",
        totalOnLeaveEmployees: totalOnLeaveEmployees,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
