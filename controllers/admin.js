const mongoose = require("mongoose");
const Employee = require("../models/employee.js");
const Company = require("../models/company.js");
const UserLogin = require("../models/login.js");
const generatePassword = require("generate-password");
const nodemailer = require("nodemailer");

//Controller for create admin
module.exports.addAdmin = async (req, res) => {
  try {
    console.log(req.body);
    const companyname = req.body.employee.companyName;
    const company = await Company.findOne({ companyName: companyname });
    console.log(company);
    if (company == null) {
      req.flash("error", "Entered company is not exists.");
      return res.redirect("/admin");
    } else {
      let finduser = await UserLogin.findOne({
        email: req.body.employee.email,
      });
      console.log(finduser);
      if (finduser != null) {
        req.flash("error", "Email is already exists.");
        return res.redirect("/admin");
      } else {
        req.body.employee.companyId = company._id;
        req.body.employee.category = "Admin";
        const newAdmin = new Employee(req.body.employee);
        console.log(newAdmin);
        const saveAdmin = await newAdmin.save();
        console.log(saveAdmin);
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
        const adminId = saveAdmin._id;
        console.log(adminId);
        const user = new UserLogin({
          employeeId: adminId,
          email: req.body.employee.email,
        });
        const registerUser = await UserLogin.register(user, password);
        console.log(registerUser);
        req.flash("success", "Admin create & register successfully.");
        return res.redirect("/");
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
        setImmediate(() => {
          transporter
            .sendMail(mailOptions)
            .then(() => console.log("Email sent successfully"))
            .catch((err) => console.log("Email failed:", err));
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
