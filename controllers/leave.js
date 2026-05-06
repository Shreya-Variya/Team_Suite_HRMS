const mongoose = require("mongoose");
const Employee = require("../models/employee");
const LeavePolicy = require("../models/leavepolicy");
const Leave = require("../models/leave");
const Company = require("../models/company");

//Controller which add the data when employees are apply for leave
module.exports.applyForLeave = async (req, res) => {
  try {
    //Check that body is empty or not
    if (req.body == null) {
      return res.status(400).json({
        success: false,
        message: "Please pass the necessary data.",
      });
    } else {
      const { employeeId, leavePolicyId, startDate, endDate, reason } =
        req.body;

      if (!mongoose.isValidObjectId(employeeId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      }

      if (!mongoose.isValidObjectId(leavePolicyId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid ID format.",
        });
      }

      //Check that employee exist or not
      const employee = await Employee.findById(employeeId);
      if (employee == null) {
        return res
          .status(404)
          .json({ success: false, message: "Employee not found." });
      } else {
        //Check that leave policy exist or not
        const leavepolicy = await LeavePolicy.findById(leavePolicyId);
        if (!leavepolicy) {
          return res
            .status(404)
            .json({ success: false, message: "Leave Policy not found." });
        } else {
          //Check companyid in employee & leave policy is same or not
          if (
            employee.companyId.toString() != leavepolicy.companyId.toString()
          ) {
            return res.status(400).json({
              success: false,
              message:
                "Employee and leave policy do not belong to the same company",
            });
          } else {
            //Validate the dates
            const start = new Date(startDate);
            const end = new Date(endDate);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
              return res.status(400).json({
                success: false,
                message: "Invalid StartDate or EndDate",
              });
            }

            //start & end date can not be the past dates
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);

            if (start < today) {
              return res.status(400).json({
                success: false,
                message: "StartDate cannot be in the past",
              });
            }

            if (end < today) {
              return res.status(400).json({
                success: false,
                message: "EndDate cannot be in the past",
              });
            }

            if (start > end) {
              return res.status(400).json({
                success: false,
                message: "StartDate cannot be greater than EndDate",
              });
            }

            //Check leave days not exide the limit of maxConsecutive days
            const leaveDays =
              Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

            if (leaveDays > leavepolicy.maxConsecutiveLeave) {
              return res.status(400).json({
                success: false,
                message: `You can only apply for maximum ${leavepolicy.maxConsecutiveLeave} consecutive leave days`,
              });
            }

            // Get current year range based on leave start date
            const yearStart = new Date(start.getFullYear(), 0, 1);
            const yearEnd = new Date(start.getFullYear(), 11, 31, 23, 59, 59);

            // Get all approved/pending leave requests of same employee & policy in same year
            const existingLeaves = await Leave.find({
              employeeId,
              leavePolicyId,
              status: { $in: ["Pending", "Approved"] },
              startDate: { $gte: yearStart },
              endDate: { $lte: yearEnd },
            });
            let totalUsedLeaveDays = 0;
            existingLeaves.forEach((leave) => {
              const existingStart = new Date(leave.startDate);
              const existingEnd = new Date(leave.endDate);

              const days =
                Math.ceil(
                  (existingEnd - existingStart) / (1000 * 60 * 60 * 24),
                ) + 1;

              totalUsedLeaveDays += days;
            });

            // Check yearly leave limit
            if (totalUsedLeaveDays + leaveDays > leavepolicy.maxLeavePerYear) {
              return res.status(400).json({
                success: false,
                message: `Leave limit exceeded. Remaining leave balance is ${
                  leavepolicy.maxLeavePerYear - totalUsedLeaveDays
                } day(s)`,
              });
            }

            //Save the leave request
            const leave = await Leave.create({
              employeeId,
              leavePolicyId,
              startDate: start,
              endDate: end,
              reason,
              status: "Pending",
            });
            if (!leave) {
              return res.status(400).json({
                success: false,
                message: "Data not saved.",
              });
            } else {
              const admin = await Employee.findOne({
                companyId: employee.companyId,
                category: "Admin",
              });
              console.log(leave);
              console.log(admin);
              return res.status(200).json({
                success: true,
                message: "Leave request created successfully",
                leavedata: leave,
                admindata: admin,
              });
            }
          }
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

//Controller for accept the leave request
module.exports.acceptLeave = async (req, res) => {
  try {
    //Check that body is empty or not
    if (req.body == null) {
      return res.status(400).json({
        success: false,
        message: "Please pass the necessary data.",
      });
    } else {
      const { leaveId, employeeId } = req.body;

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

      //Check that employee exist or not
      const employee = await Employee.findById(employeeId);
      console.log(employee);
      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Employee data not found." });
      } else {
        //Check that leave record exists orr not
        const leave = await Leave.findById(leaveId);
        console.log(leave);
        if (!leave) {
          return res
            .status(404)
            .json({ success: false, message: "Leave data not found." });
        } else {
          //Check that employeeid belongs to currect employee or not
          if (leave.employeeId.toString() !== employeeId) {
            return res.status(400).json({
              success: false,
              message: "This leave does not belong to the given employee.",
            });
          }

          //Check that leave is not already approved
          if (leave.status === "Approved") {
            return res.status(400).json({
              success: false,
              message: "Leave is already approved.",
            });
          }

          //If leave status is not pending
          if (leave.status !== "Pending") {
            return res.status(400).json({
              success: false,
              message: "Only pending leaves can be approved.",
            });
          }

          leave.status = "Approved";
          const updateLeave = await leave.save();
          console.log(updateLeave);
          return res
            .status(200)
            .json({ success: true, message: "Leave Approved Successfully." });
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

//Controller for reject the leave
module.exports.rejectLeave = async (req, res) => {
  try {
    //Check that body is empty or not
    if (req.body == null) {
      return res.status(400).json({
        success: false,
        message: "Please pass the necessary data.",
      });
    } else {
      const { leaveId, employeeId } = req.body;

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

      //Check that employee exist or not
      const employee = await Employee.findById(employeeId);
      console.log(employee);
      if (!employee) {
        return res
          .status(404)
          .json({ success: false, message: "Employee data not found." });
      } else {
        //Check that leave record exists orr not
        const leave = await Leave.findById(leaveId);
        console.log(leave);
        if (!leave) {
          return res
            .status(404)
            .json({ success: false, message: "Leave data not found." });
        } else {
          //Check that employeeid belongs to currect employee or not
          if (leave.employeeId.toString() !== employeeId) {
            return res.status(400).json({
              success: false,
              message: "This leave does not belong to the given employee.",
            });
          }

          //Check that leave is not already rejected
          if (leave.status === "Rejected") {
            return res.status(400).json({
              success: false,
              message: "Leave is already rejected.",
            });
          }

          //If leave status is not pending
          if (leave.status !== "Pending") {
            return res.status(400).json({
              success: false,
              message: "Only pending leaves can be rejected.",
            });
          }

          leave.status = "Rejected";
          const updateLeave = await leave.save();
          console.log(updateLeave);
          return res
            .status(200)
            .json({ success: true, message: "Leave Rejected Successfully." });
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

//Constroller for get the emplyee this month leave report
module.exports.getLeaveReport = async (req, res) => {
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
        return res
          .status(404)
          .json({ success: false, message: "Employee data not found." });
      } else {
        // Get current month start and end date
        const today = new Date();
        const startOfMonth = new Date(
          today.getFullYear(),
          today.getMonth(),
          1,
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
        );

        //Get leave record for current month
        const leaveReport = await Leave.find({
          employeeId: empid,
          startDate: { $lte: endOfMonth },
          endDate: { $gte: startOfMonth },
        })
          .populate("leavePolicyId", "leaveType")
          .sort({ startDate: -1 });
        console.log(leaveReport);

        if (leaveReport.length === 0) {
          return res.status(404).json({
            success: false,
            message: "No leave records found for this month.",
          });
        }

        // Format response
        const formattedLeaves = leaveReport.map((leave) => ({
          leaveId: leave._id,
          leaveType: leave.leavePolicyId?.leaveType || null,
          startDate: leave.startDate,
          endDate: leave.endDate,
          reason: leave.reason,
          status: leave.status,
        }));

        return res.status(200).json({
          success: true,
          message: "Monthly leave report fetch successfully.",
          data: formattedLeaves,
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

//Controller for get the employees leave report of current month for particular company
module.exports.getEmployeeLeaveReport = async (req, res) => {
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
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found." });
      }

      // Get all employees of company
      const employees = await Employee.find({
        companyId: companyid,
      }).select("_id employeeName");

      const employeeIds = employees.map((emp) => emp._id);

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

      // Get leave records of current month
      const leaves = await Leave.find({
        employeeId: { $in: employeeIds },
        startDate: { $lte: endOfMonth },
        endDate: { $gte: startOfMonth },
      })
        .populate({
          path: "employeeId",
          select: "employeeName",
        })
        .populate({
          path: "leavePolicyId",
          select: "leaveType",
        })
        .sort({ startDate: -1 });

      if (!leaves.length) {
        return res
          .status(404)
          .json({ success: false, message: "No data found." });
      }

      const leaveReport = leaves.map((leave) => {
        return {
          leaveId: leave._id,
          employeeId: leave.employeeId?._id,
          employeeName: leave.employeeId?.employeeName || "",
          leavePolicyName: leave.leavePolicyId?.leaveType || "",
          startDate: leave.startDate,
          endDate: leave.endDate,
          leaveStatus: leave.status,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Current month leave report fetched successfully.",
        data: leaveReport,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller for getting all employees all leave report for particular company
module.exports.allLeaveRecord = async (req, res) => {
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
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found." });
      }

      // Get all employees of company
      const employees = await Employee.find({
        companyId: companyid,
      }).select("_id employeeName");

      const employeeIds = employees.map((emp) => emp._id);

      const leaves = await Leave.find({
        employeeId: { $in: employeeIds },
      })
        .populate("employeeId", "employeeName")
        .populate("leavePolicyId", "leaveType")
        .sort({ startDate: -1 });

      if (!leaves.length) {
        return res
          .status(404)
          .json({ success: false, message: "No data found." });
      }

      const leaveReport = leaves.map((leave) => {
        return {
          leaveId: leave._id,
          employeeId: leave.employeeId?._id,
          employeeName: leave.employeeId?.employeeName || "",
          leavePolicyName: leave.leavePolicyId?.leaveType || "",
          startDate: leave.startDate,
          endDate: leave.endDate,
          leaveStatus: leave.status,
        };
      });

      return res.status(200).json({
        success: true,
        message: "All leave records fetched successfully.",
        data: leaveReport,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller for getting all approved leave records for particular company
module.exports.approvedLeaves = async (req, res) => {
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
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found." });
      }

      // Get all employees of company
      const employees = await Employee.find({
        companyId: companyid,
      }).select("_id employeeName");

      const employeeIds = employees.map((emp) => emp._id);

      const leaves = await Leave.find({
        employeeId: { $in: employeeIds },
        status: "Approved",
      })
        .populate("employeeId", "employeeName")
        .populate("leavePolicyId", "leaveType")
        .sort({ startDate: -1 });

      if (!leaves.length) {
        return res
          .status(404)
          .json({ success: false, message: "No data found." });
      }

      const leaveReport = leaves.map((leave) => {
        return {
          leaveId: leave._id,
          employeeId: leave.employeeId?._id,
          employeeName: leave.employeeId?.employeeName || "",
          leavePolicyName: leave.leavePolicyId?.leaveType || "",
          startDate: leave.startDate,
          endDate: leave.endDate,
          leaveStatus: leave.status,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Approved leave records fetched successfully.",
        data: leaveReport,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller for getting all pending leave records for particular company
module.exports.pendingLeaves = async (req, res) => {
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
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found." });
      }

      // Get all employees of company
      const employees = await Employee.find({
        companyId: companyid,
      }).select("_id employeeName");

      const employeeIds = employees.map((emp) => emp._id);

      const leaves = await Leave.find({
        employeeId: { $in: employeeIds },
        status: "Pending",
      })
        .populate("employeeId", "employeeName")
        .populate("leavePolicyId", "leaveType")
        .sort({ startDate: -1 });

      if (!leaves.length) {
        return res
          .status(404)
          .json({ success: false, message: "No data found." });
      }

      const leaveReport = leaves.map((leave) => {
        return {
          leaveId: leave._id,
          employeeId: leave.employeeId?._id,
          employeeName: leave.employeeId?.employeeName || "",
          leavePolicyName: leave.leavePolicyId?.leaveType || "",
          startDate: leave.startDate,
          endDate: leave.endDate,
          leaveStatus: leave.status,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Pending leave records fetched successfully.",
        data: leaveReport,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller for getting all rejected leave records for particular company
module.exports.rejectedLeaves = async (req, res) => {
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
      if (!company) {
        return res
          .status(404)
          .json({ success: false, message: "Company not found." });
      }

      // Get all employees of company
      const employees = await Employee.find({
        companyId: companyid,
      }).select("_id employeeName");

      const employeeIds = employees.map((emp) => emp._id);

      const leaves = await Leave.find({
        employeeId: { $in: employeeIds },
        status: "Rejected",
      })
        .populate("employeeId", "employeeName")
        .populate("leavePolicyId", "leaveType")
        .sort({ startDate: -1 });

      if (!leaves.length) {
        return res
          .status(404)
          .json({ success: false, message: "No data found." });
      }

      const leaveReport = leaves.map((leave) => {
        return {
          leaveId: leave._id,
          employeeId: leave.employeeId?._id,
          employeeName: leave.employeeId?.employeeName || "",
          leavePolicyName: leave.leavePolicyId?.leaveType || "",
          startDate: leave.startDate,
          endDate: leave.endDate,
          leaveStatus: leave.status,
        };
      });

      return res.status(200).json({
        success: true,
        message: "Rejected leave records fetched successfully.",
        data: leaveReport,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller which return the leave report of parrticular date for particular company
module.exports.leaveByDate = async (req, res) => {
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
        const company = await Company.findById(companyid);
        if (!company) {
          return res
            .status(404)
            .json({ success: false, message: "Company not found." });
        }

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

        // Get all employees of company
        const employees = await Employee.find({
          companyId: companyid,
        }).select("_id employeeName");

        const employeeIds = employees.map((emp) => emp._id);

        const leaves = await Leave.find({
          employeeId: { $in: employeeIds },
          startDate: { $lte: endOfDay },
          endDate: { $gte: startOfDay },
        })
          .populate("employeeId", "employeeName")
          .populate("leavePolicyId", "leaveType")
          .sort({ startDate: -1 });

        if (!leaves.length) {
          return res.status(404).json({
            success: false,
            message: "No employees on leave for selected date.",
          });
        }

        const leaveReport = leaves.map((leave) => {
          return {
            leaveId: leave._id,
            employeeId: leave.employeeId?._id,
            employeeName: leave.employeeId?.employeeName || "",
            leavePolicyName: leave.leavePolicyId?.leaveType || "",
            startDate: leave.startDate,
            endDate: leave.endDate,
            leaveStatus: leave.status,
          };
        });

        return res.status(200).json({
          success: true,
          message: "Leave records for selected date fetched successfully.",
          data: leaveReport,
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

//Employee Leave Report controller functions
//Controller which returns the all leave records of given employee
module.exports.getAllLeaveRecords = async (req, res) => {
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
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee data not found.",
        });
      }

      const leaveReport = await Leave.find({
        employeeId: empid,
      })
        .populate("leavePolicyId", "leaveType")
        .sort({ startDate: -1 });

      if (!leaveReport.length) {
        return res.status(404).json({
          success: false,
          message: "No leave records found.",
        });
      }

      const formattedLeaves = leaveReport.map((leave) => ({
        leaveId: leave._id,
        leaveType: leave.leavePolicyId?.leaveType || null,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      }));

      return res.status(200).json({
        success: true,
        message: "All leave records fetched successfully.",
        data: formattedLeaves,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller which returns the all approved leave records of given employee
module.exports.getApprovedLeaveRecords = async (req, res) => {
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
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee data not found.",
        });
      }

      const leaveReport = await Leave.find({
        employeeId: empid,
        status: "Approved",
      })
        .populate("leavePolicyId", "leaveType")
        .sort({ startDate: -1 });

      if (!leaveReport.length) {
        return res.status(404).json({
          success: false,
          message: "No leave records found.",
        });
      }

      const formattedLeaves = leaveReport.map((leave) => ({
        leaveId: leave._id,
        leaveType: leave.leavePolicyId?.leaveType || null,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      }));

      return res.status(200).json({
        success: true,
        message: "Approved leave records fetched successfully.",
        data: formattedLeaves,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller which returns the all pending leave records of given employee
module.exports.getPendingLeaveRecords = async (req, res) => {
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
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee data not found.",
        });
      }

      const leaveReport = await Leave.find({
        employeeId: empid,
        status: "Pending",
      })
        .populate("leavePolicyId", "leaveType")
        .sort({ startDate: -1 });

      if (!leaveReport.length) {
        return res.status(404).json({
          success: false,
          message: "No leave records found.",
        });
      }

      const formattedLeaves = leaveReport.map((leave) => ({
        leaveId: leave._id,
        leaveType: leave.leavePolicyId?.leaveType || null,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      }));

      return res.status(200).json({
        success: true,
        message: "Pending leave records fetched successfully.",
        data: formattedLeaves,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller which returns the all rejected leave records of given employee
module.exports.getRejectedLeaveRecords = async (req, res) => {
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
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee data not found.",
        });
      }

      const leaveReport = await Leave.find({
        employeeId: empid,
        status: "Rejected",
      })
        .populate("leavePolicyId", "leaveType")
        .sort({ startDate: -1 });

      if (!leaveReport.length) {
        return res.status(404).json({
          success: false,
          message: "No leave records found.",
        });
      }

      const formattedLeaves = leaveReport.map((leave) => ({
        leaveId: leave._id,
        leaveType: leave.leavePolicyId?.leaveType || null,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      }));

      return res.status(200).json({
        success: true,
        message: "Rejected leave records fetched successfully.",
        data: formattedLeaves,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
