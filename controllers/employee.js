const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const generatePassword = require("generate-password");
const UserLogin = require("../models/login.js");
const Employee = require("../models/employee.js");
const Company = require("../models/company.js");

//Controller that add the employee details into database and send a mail to employee of username and password
module.exports.addemployee = async (req, res) => {
  try {
    const companyId = req.body.employee.companyId;
    // console.log(companyId);
    const company = await Company.findById(companyId);

    if (company == null) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    } else {
      console.log("Company Name: ", company);
      let findUsername = await UserLogin.findOne({
        email: req.body.employee.email,
      });
      console.log(findUsername);
      if (findUsername != null) {
        return res.status(409).json({
          success: false,
          message: "Email is already exists.",
        });
      } else {
        req.body.employee.companyName = company.companyName;
        req.body.employee.category = "Employee";
        console.log(req.body.employee.email);
        const newEmployee = new Employee(req.body.employee);
        const saveEmployee = await newEmployee.save();
        console.log("Employee : ", saveEmployee);
        let password = generatePassword.generate({
          length: 10,
          numbers: true,
          symbols: true,
          uppercase: true,
          lowercase: true,
          excludeSimilarCharacters: true,
          strict: true,
        });
        console.log("Generated Password : ", password);
        let transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSKEY,
          },
        });
        let mailOptions = {
          from: '"Team Suite" <teamsuitehrms@gmail.com>',
          to: req.body.employee.email,
          subject: "Your Login Credentials",
          html: `<h3>Username: ${req.body.employee.email}</h3><h3>Password: ${password}</h3><h4>Note : Reset your password now.</h4>`,
        };
        await transporter.sendMail(mailOptions);
        const empId = saveEmployee._id;
        console.log("Employee Id : ", empId);
        const user = new UserLogin({
          employeeId: empId,
          email: req.body.employee.email,
        });
        const registerUser = await UserLogin.register(user, password);
        console.log("User Login Details : ", registerUser);
        return res
          .status(200)
          .json({ success: true, message: "Employee Added Successfully." });
      }
    }
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "EmployeeId already exists in this company.",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that update the data of employee into database
module.exports.updateemployee = async (req, res) => {
  try {
    let { id } = req.params;
    console.log(id);
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    const companyId = req.body.employee.companyId;
    // console.log(companyId);
    const company = await Company.findById(companyId);

    if (company == null) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    } else {
      req.body.employee.companyName = company.companyName;
      req.body.employee.category = "Employee";
      let employee = await Employee.findByIdAndUpdate(id, {
        ...req.body.employee,
      });
      if (!employee) {
        return res.status(404).json({
          success: false,
          message: "Employee ID is incorrect. Employee not found.",
        });
      } else {
        // console.log(employee);
        return res.status(200).json({
          success: true,
          message: "Employee Data Updated Successfully.",
        });
      }
    }
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "EmployeeId already exists in this company.",
      });
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that delete the employee data from database
module.exports.deleteemployee = async (req, res) => {
  try {
    let { id } = req.params;
    console.log(id);
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    let deletedEmployee = await Employee.findByIdAndDelete(id);
    if (!deletedEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee ID is incorrect. Employee not found.",
      });
    } else {
      console.log("Deleted Employee Details : ", deletedEmployee);
      let deleteLogin = await UserLogin.findOneAndDelete({ employeeId: id });
      console.log("Delete Login Details : ", deleteLogin);
      return res.status(200).json({
        success: true,
        message: "Employee Data Deleted Successfully.",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that fetch the data of employee from database
module.exports.displayemployee = async (req, res) => {
  try {
    let employees = await Employee.find({})
      .populate("department", "name")
      .populate("jobRole", "role");
    console.log("All Employees: ", employees);
    return res
      .status(200)
      .json({ success: true, message: "All Employees Data.", data: employees });
  } catch {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that fetch the employee data according to company id
module.exports.getCompanyEmployees = async (req, res) => {
  try {
    let { companyid } = req.params;
    console.log(companyid);
    if (!mongoose.isValidObjectId(companyid)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format.",
      });
    }
    let company = await Company.findById(companyid);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found." });
    } else {
      let employees = await Employee.find({ companyId: companyid })
        .populate("department", "name")
        .populate("jobRole", "role");
      console.log("All Employees: ", employees);
      return res.status(200).json({
        success: true,
        message: "All Employees Data.",
        data: employees,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that fetch the specific employee data through email
module.exports.getemp = async (req, res) => {
  try {
    if (req.body == undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    const { email } = req.body;
    const employee = await Employee.findOne({ email: email })
      .populate("department", "name")
      .populate("jobRole", "role");
    if (!employee) {
      return res
        .status(404)
        .json({ success: false, message: "Employee not found." });
    } else {
      console.log(employee);
      return res.status(200).json({
        success: true,
        message: "Employee Data Found.",
        employeeData: employee,
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
