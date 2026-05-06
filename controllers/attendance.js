const mongoose = require("mongoose");
const Employee = require("../models/employee.js");
const Attendance = require("../models/attendance.js");
const AttendanceHistory = require("../models/attendancehistory.js");
const { date } = require("joi");
const Leave = require("../models/leave.js");
const Company = require("../models/company.js");

//Controller that check that user is already not clocked in or not and if not then make them clock in and insert that record into attendance and attendanceHistory table
module.exports.clockin = async (req, res) => {
  try {
    let { empid } = req.params;
    console.log("Employee ID : ", empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    let employee = await Employee.findById(empid);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "EmployeeID is incorrect. Employee not found.",
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkAttendance = await Attendance.findOne({
        employeeId: empid,
        clockIn: { $ne: null, $gte: today },
        clockOut: null,
      });
      console.log("Check Record : ", checkAttendance);
      if (checkAttendance != null) {
        return res
          .status(409)
          .json({ success: false, message: "You are already clocked in." });
      } else {
        let attendanceRecord = new Attendance({
          employeeId: empid,
          clockIn: new Date(),
          clockOut: null,
        });
        console.log("Attendance : ", attendanceRecord);
        let saveRecord = await attendanceRecord.save();
        console.log("Save : ", saveRecord);
        let historyRecord = new AttendanceHistory({
          attendanceId: saveRecord._id,
          clockIn: saveRecord.clockIn,
          type: "Clock In",
        });
        console.log("History : ", historyRecord);
        let saveHistory = await historyRecord.save();
        console.log("Save History : ", saveHistory);
        return res.status(200).json({
          success: true,
          message: "You're clocked in! Attendance synced and up to date.",
          clockin: saveHistory,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that check that user is clocked in or not and already in break or not and if not then make them break in and insert that record into attendanceHistory table
module.exports.breakin = async (req, res) => {
  try {
    let { empid } = req.params;
    console.log("Employee ID : ", empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    let employee = await Employee.findById(empid);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "EmployeeID is incorrect. Employee not found.",
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkAttendance = await Attendance.findOne({
        employeeId: empid,
        clockIn: { $ne: null, $gte: today },
        clockOut: null,
      });
      console.log("Check Record : ", checkAttendance);
      if (checkAttendance != null) {
        let checkBreak = await AttendanceHistory.findOne({
          attendanceId: checkAttendance._id,
          breakIn: { $exists: true, $ne: null },
          breakOut: null,
        });
        if (checkBreak == null) {
          let gotoBreak = new AttendanceHistory({
            attendanceId: checkAttendance._id,
            breakIn: new Date(),
            type: "Break In",
          });
          console.log("Break Record : ", gotoBreak);
          let saveBreak = await gotoBreak.save();
          console.log("Save Record : ", saveBreak);
          return res.status(200).json({
            success: true,
            message: "Your break starts now.",
            breakin: saveBreak,
          });
        } else {
          return res
            .status(409)
            .json({ success: false, message: "You are already break in." });
        }
      } else {
        return res.status(404).json({
          success: false,
          message: "You are not clocked in. First clock in.",
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that check that user is break in or not and if break in then break out and update that record into attendance and attendanceHistory table
module.exports.breakout = async (req, res) => {
  try {
    let { empid } = req.params;
    console.log("Employee ID : ", empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    if (!req.body) {
      return res
        .status(400)
        .json({ success: false, message: "Attendance Id is required." });
    }
    let { attendanceId } = req.body;
    console.log("Attendance Id : ", attendanceId);
    let employee = await Employee.findById(empid);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "EmployeeID is incorrect. Employee not found.",
      });
    } else {
      let findBreakIn = await AttendanceHistory.findOne({
        attendanceId: attendanceId,
        breakIn: { $exists: true, $ne: null },
        breakOut: null,
      });
      console.log("Break In Record : ", findBreakIn);
      if (findBreakIn == null) {
        return res.status(404).json({
          success: false,
          message: "You are not break in.",
        });
      } else {
        let gotoBreakOut = await AttendanceHistory.findByIdAndUpdate(
          findBreakIn._id,
          { $set: { breakOut: new Date(), type: "Break Out" } },
          { new: true },
        );
        console.log(gotoBreakOut);
        let breakin = new Date(findBreakIn.breakIn);
        let breakout = new Date(gotoBreakOut.breakOut);
        console.log("Break in : ", breakin);
        console.log("Break out : ", breakout);
        let breaktime = breakout - breakin;
        console.log(breaktime);
        let updateAttendance = await Attendance.findByIdAndUpdate(
          attendanceId,
          {
            $inc: { breakTime: breaktime },
          },
          { new: true },
        );
        console.log("Update Attendace : ", updateAttendance);
        return res.status(200).json({
          success: true,
          message: "Your break ends now.",
          breakout: gotoBreakOut,
          breaktime: updateAttendance,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that check first that user is clock in or not, break in or not, if clock in and not in break then clock out and update that record into attendance and attendanceHistory table
module.exports.clockout = async (req, res) => {
  try {
    let { empid } = req.params;
    console.log("Employee ID : ", empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    let employee = await Employee.findById(empid);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "EmployeeID is incorrect. Employee not found.",
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let checkAttendance = await Attendance.findOne({
        employeeId: empid,
        clockIn: { $ne: null, $gte: today },
        clockOut: null,
      });
      console.log("Check Record : ", checkAttendance);
      if (checkAttendance == null) {
        return res.status(404).json({
          success: false,
          message: "You are not clocked in. First clock in.",
        });
      } else {
        let checkBreak = await AttendanceHistory.findOne({
          attendanceId: checkAttendance._id,
          breakIn: { $exists: true, $ne: null },
          breakOut: null,
        });
        console.log("Check Break : ", checkBreak);
        if (checkBreak != null) {
          return res.status(400).json({
            success: false,
            message:
              "You are currently break in. First break out, Complete your task and then clock out.",
          });
        } else {
          let cout = new Date().getTime();
          let cin = new Date(checkAttendance.clockIn).getTime();
          let btime = checkAttendance.breakTime;
          let worktime = cout - cin - btime;
          console.log(cout, "\n", cin, "\n", btime, "\n", worktime);
          let letsClockout = await Attendance.findByIdAndUpdate(
            checkAttendance._id,
            {
              $set: {
                clockOut: new Date(),
                workTime: worktime,
              },
            },
            {
              new: true,
            },
          );
          console.log("Clock Out : ", letsClockout);
          let updateHistory = await AttendanceHistory.findOneAndUpdate(
            {
              attendanceId: checkAttendance._id,
              clockIn: checkAttendance.clockIn,
              clockOut: null,
              type: "Clock In",
            },
            {
              clockOut: new Date(),
              type: "Clock Out",
            },
            { new: true },
          );
          console.log("Update History : ", updateHistory);
          return res.status(200).json({
            success: true,
            message: "Clock out! Great work today!",
            clockout: letsClockout,
            clockoutHistory: updateHistory,
          });
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

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

//Controller that return the weekly attendance report
module.exports.getAttendanceReport = async (req, res) => {
  try {
    let { empid } = req.params;
    console.log("Employee ID : ", empid);
    if (!mongoose.isValidObjectId(empid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    let employee = await Employee.findById(empid);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "EmployeeID is incorrect. Employee not found.",
      });
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const last7days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last7days.push(d);
      }

      const startDate = new Date(last7days[0]);
      const endDate = new Date(today);
      endDate.setHours(23, 59, 59, 999);

      if (isNaN(startDate) || isNaN(endDate)) {
        console.error("Invalid Date detected", { startDate, endDate });

        return res.status(500).json({
          success: false,
          message: "Date calculation error",
        });
      }

      const records = await Attendance.find({
        employeeId: empid,
        clockIn: { $gte: startDate, $lte: endDate },
      });

      const leaves = await Leave.find({
        employeeId: empid,
        status: "Approved",
        startDate: { $lte: endDate },
        endDate: { $gte: startDate },
      });

      const recordMap = {};
      records.forEach((rec) => {
        const dateKey = formatDate(new Date(rec.clockIn));
        if (!recordMap[dateKey]) {
          recordMap[dateKey] = [];
        }
        recordMap[dateKey].push(rec);
      });

      const leaveMap = {};
      leaves.forEach((leave) => {
        let current = new Date(leave.startDate);
        let end = new Date(leave.endDate);

        while (current <= end) {
          const key = formatDate(new Date(current));
          leaveMap[key] = true;
          current.setDate(current.getDate() + 1);
        }
      });

      const response = last7days.map((date) => {
        const dateKey = formatDate(date);
        const records = recordMap[dateKey] || [];

        let totalWorkTime = 0;
        let totalBreakTime = 0;
        let inProgress = false;

        records.forEach((rec) => {
          totalWorkTime += rec.workTime || 0;
          totalBreakTime += rec.breakTime || 0;

          if (rec.clockIn && !rec.clockOut) {
            inProgress = true;
          }
        });

        //Weekend
        if (isWeekend(date) && records.length === 0) {
          return {
            date: dateKey,
            status: "Weekend",
            workTime: 0,
            breakTime: 0,
          };
        }

        //Present / In Progress
        if (records.length > 0) {
          if (inProgress) {
            return {
              date: dateKey,
              status: "In Progress",
              workTime: totalWorkTime,
              breakTime: totalBreakTime,
            };
          }

          return {
            date: dateKey,
            status: "Present",
            workTime: totalWorkTime,
            breakTime: totalBreakTime,
          };
        }

        //Leave Check
        if (leaveMap[dateKey]) {
          return {
            date: dateKey,
            status: "Leave",
            workTime: 0,
            breakTime: 0,
          };
        }

        return {
          date: dateKey,
          status: "Absent",
          workTime: 0,
          breakTime: 0,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Attendance Report",
        data: response,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that returns the all employees today's attendance according to company
module.exports.getEmployeeAttendanceReport = async (req, res) => {
  try {
    let { companyid } = req.params;
    console.log("Company id : ", companyid);

    if (!mongoose.isValidObjectId(companyid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }

    const employee = await Employee.find({ companyId: companyid }).select(
      "_id employeeId employeeName",
    );

    if (!employee.length) {
      return res.status(404).json({
        success: false,
        message: "No employee exists in this company.",
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      employeeId: { $in: employee.map((e) => e._id) },
      clockIn: { $gte: startDate, $lte: endDate },
    });

    const leaves = await Leave.find({
      employeeId: { $in: employee.map((e) => e._id) },
      status: "Approved",
      startDate: { $lte: endDate },
      endDate: { $gte: startDate },
    });

    const recordMap = {};
    records.forEach((rec) => {
      recordMap[rec.employeeId.toString()] = rec;
    });

    const leaveMap = {};
    leaves.forEach((leave) => {
      leaveMap[leave.employeeId.toString()] = true;
    });

    const todayFormatted = formatDate(today);

    const response = employee.map((emp) => {
      const record = recordMap[emp._id.toString()];

      //Weekend
      if (isWeekend(today)) {
        return {
          employeeId: emp.employeeId,
          name: emp.employeeName,
          date: todayFormatted,
          status: "Weekend",
        };
      }

      //Present
      if (record && record.clockIn) {
        return {
          employeeId: emp.employeeId,
          name: emp.employeeName,
          date: todayFormatted,
          status: "Present",
        };
      }

      //Leave
      if (leaveMap[emp._id.toString()]) {
        return {
          employeeId: emp.employeeId,
          name: emp.employeeName,
          date: todayFormatted,
          status: "Leave",
        };
      }

      //Absent
      return {
        employeeId: emp.employeeId,
        name: emp.employeeName,
        date: todayFormatted,
        status: "Absent",
      };
    });

    return res.status(200).json({
      success: true,
      message: "All Employees Attendance Report",
      data: response,
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that returns the all employees attendance report of particular date for particular company
module.exports.attendanceByDate = async (req, res) => {
  try {
    if (req.body == null) {
      return res.status(400).json({
        success: false,
        message: "Please pass the necessary data.",
      });
    } else {
      const { companyid } = req.params;
      const { date } = req.body;
      console.log(companyid);
      console.log(date);
      if (!mongoose.isValidObjectId(companyid)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      } else {
        if (!date) {
          return res.status(400).json({
            success: false,
            message: "Date is required (yyyy-mm-dd).",
          });
        }

        const selectedDate = new Date(date);

        if (isNaN(selectedDate)) {
          return res.status(400).json({
            success: false,
            message: "Invalid date format.",
          });
        }

        // Normalize date (IMPORTANT)
        const startOfDay = new Date(selectedDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(selectedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const company = await Company.findById(companyid);
        if (!company) {
          return res
            .status(404)
            .json({ success: false, message: "Company not found." });
        }

        // Get all employees of company
        const employees = await Employee.find({
          companyId: companyid,
        }).select("_id employeeId employeeName");

        const employeeIds = employees.map((emp) => emp._id);

        // Attendance records
        const attendanceRecords = await Attendance.find({
          employeeId: { $in: employeeIds },
          clockIn: { $gte: startOfDay, $lte: endOfDay },
        });

        const attendanceMap = {};

        attendanceRecords.forEach((rec) => {
          const key = rec.employeeId.toString();
          if (!attendanceMap[key]) {
            attendanceMap[key] = [];
          }
          attendanceMap[key].push(rec);
        });

        //Leave records
        const leaves = await Leave.find({
          employeeId: { $in: employeeIds },
          status: "Approved",
          startDate: { $lte: endOfDay },
          endDate: { $gte: startOfDay },
        });

        const leaveSet = new Set(leaves.map((l) => l.employeeId.toString()));

        const isWeekend = (date) => {
          const day = date.getDay();
          return day === 0 || day === 6;
        };

        const formattedDate = selectedDate.toISOString().split("T")[0];

        const data = employees.map((emp) => {
          const empId = emp._id.toString();
          const records = attendanceMap[empId] || [];
          let totalWorkTime = 0;
          let totalBreakTime = 0;
          records.forEach((rec) => {
            totalWorkTime += rec.workTime || 0;
            totalBreakTime += rec.breakTime || 0;
          });
          let status = "Absent";
          if (isWeekend(selectedDate)) {
            status = "Weekend";
          } else if (records.length > 0) {
            status = "Present";
          } else if (leaveSet.has(empId)) {
            status = "Leave";
          }

          return {
            employeeId: emp.employeeId,
            name: emp.employeeName,
            date: formattedDate,
            status: status,
            workTime: totalWorkTime,
            breakTime: totalBreakTime,
          };
        });

        return res.status(200).json({
          success: true,
          message: "Attendance report fetched successfully.",
          data: data,
        });
      }
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
