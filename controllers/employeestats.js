const mongoose = require("mongoose");
const Employee = require("../models/employee");
const Attendance = require("../models/attendance");
const Leave = require("../models/leave");

//Controller for get the current month working hours of employee
module.exports.getCurrentMonthWorkHours = async (req, res) => {
  try {
    const { empid } = req.params;
    console.log(empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    } else {
      const employee = await Employee.findById(empid);
      console.log(employee);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      // Current month start and end date
      const today = new Date();

      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );

      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const attendance = await Attendance.find({
        employeeId: empid,
        clockIn: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });
      console.log(attendance);

      // Sum total work time
      let totalWorkMilliseconds = 0;

      attendance.forEach((attendance) => {
        totalWorkMilliseconds += attendance.workTime || 0;
      });

      // Convert minutes to integer hours
      const totalWorkHours = (totalWorkMilliseconds / (1000 * 60 * 60)).toFixed(
        2,
      );
      console.log(totalWorkHours);

      return res.status(200).json({
        success: true,
        message: "Current month work hours fetched successfully.",
        totalWorkHours: totalWorkHours + " hrs",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

//Controller for get the number of present and absent days of employees in current month
module.exports.getCurrentMonthAttendance = async (req, res) => {
  try {
    const { empid } = req.params;
    console.log(empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    } else {
      const employee = await Employee.findById(empid);
      console.log(employee);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      const today = new Date();

      // Current month start date
      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );

      // Current month end date
      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      // Total days till today in current month
      const totalDaysTillToday = today.getDate();

      const attendanceRecord = await Attendance.find({
        employeeId: empid,
        clockIn: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      });
      console.log(attendanceRecord);

      const leaves = await Leave.find({
        employeeId: empid,
        status: "Approved",
        startDate: { $lte: endOfMonth },
        endDate: { $gte: startOfMonth },
      });

      // Store unique present dates
      const presentDates = new Set();

      attendanceRecord.forEach((record) => {
        const date = new Date(record.clockIn);
        const day = date.getDate();
        presentDates.add(day);
      });

      const leaveDates = new Set();
      leaves.forEach((leave) => {
        let current = new Date(leave.startDate);
        let end = new Date(leave.endDate);

        while (current <= end) {
          if (current >= startOfMonth && current <= today) {
            leaveDates.add(current.getDate());
          }
          current.setDate(current.getDate() + 1);
        }
      });

      //WOrking Days
      let workingDays = 0;
      for (let i = 1; i <= totalDaysTillToday; i++) {
        const date = new Date(today.getFullYear(), today.getMonth(), i);
        if (!isWeekend(date)) {
          workingDays++;
        }
      }

      let leaveDays = 0;
      leaveDates.forEach((day) => {
        const date = new Date(today.getFullYear, today.getMonth(), day);
        if (!isWeekend(date) && !presentDates.has(day)) {
          leaveDays++;
        }
      });

      const presentDays = presentDates.size;
      const absentDays = workingDays - presentDays - leaveDays;
      console.log(presentDays);
      console.log(absentDays);
      console.log(leaveDays + " " + workingDays);

      return res.status(200).json({
        success: true,
        message: "Attendance data fetched successfully.",
        present: presentDays,
        absent: absentDays,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller for get the total number of leaves for particular employee in current month
module.exports.getLeaveBalance = async (req, res) => {
  try {
    const { empid } = req.params;
    console.log(empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    } else {
      const employee = await Employee.findById(empid);
      console.log(employee);
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee not found.",
        });
      }

      const today = new Date();

      // Start of current month
      const startOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        1,
        0,
        0,
        0,
        0,
      );

      // End of current month
      const endOfMonth = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999,
      );

      const leaves = await Leave.find({
        employeeId: empid,
        status: "Approved",
        startDate: { $lte: endOfMonth },
        endDate: { $gte: startOfMonth },
      });

      const leaveDates = new Set();

      leaves.forEach((leave) => {
        let leaveStart = new Date(leave.startDate);
        let leaveEnd = new Date(leave.endDate);

        // Adjust leave range within current month
        if (leaveStart < startOfMonth) {
          leaveStart = startOfMonth;
        }

        if (leaveEnd > endOfMonth) {
          leaveEnd = endOfMonth;
        }

        // 🔥 Add each day to Set
        let current = new Date(leaveStart);

        while (current <= leaveEnd) {
          const uniqueDate = new Date(
            current.getFullYear(),
            current.getMonth(),
            current.getDate(),
          ).toISOString();
          leaveDates.add(uniqueDate);
          current.setDate(current.getDate() + 1);
        }

        // const leaveDays =
        //   Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;

        // totalLeaveDays += leaveDays;
      });
      return res.status(200).json({
        success: true,
        message: "Leave balance fetched successfully.",
        leavebalance: leaveDates.size,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
