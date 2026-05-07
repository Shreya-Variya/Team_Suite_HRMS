const mongoose = require("mongoose");
const Employee = require("../models/employee.js");
const Company = require("../models/company.js");
const UserLogin = require("../models/login.js");
const generatePassword = require("generate-password");
const SibApiV3Sdk = require("sib-api-v3-sdk");
// const nodemailer = require("nodemailer");
// const { Resend } = require("resend");
// const resend = new Resend(process.env.RESEND_API_KEY);

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendAdminMail(email, password) {
  try {
    const sendSmtpEmail = {
      sender: {
        name: "Team Suite",
        email: "teamsuitehrms@gmail.com",
      },

      to: [
        {
          email: email,
        },
      ],

      subject: "Your Login Credentials",

      htmlContent: `
        <h2>Welcome to Team Suite HRMS</h2>

        <h3>Username: ${email}</h3>

        <h3>Password: ${password}</h3>

        <p>Please reset your password after first login.</p>
      `,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("MAIL SENT:", response);
  } catch (err) {
    console.log("MAIL ERROR:", err);
  }
}

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

        //Send Mail using SMTP Server
        // let transporter = nodemailer.createTransport({
        //   host: "smtp-relay.brevo.com",
        //   port: 587,
        //   secure: false,
        //   auth: {
        //     user: process.env.BREVO_USER,
        //     pass: process.env.BREVO_PASS,
        //   },
        // });

        // await transporter.verify();
        // console.log("SMTP READY");
        // let mailOptions = {
        //   from: '"Team Suite" <teamsuitehrms@gmail.com>',
        //   to: req.body.employee.email,
        //   subject: "Your Login Credentials",
        //   html: `<h3>Username: ${req.body.employee.email}</h3><h3>Password: ${password}</h3><h4>Note : Reset your password now.</h4>`,
        // };

        // try {
        //   await transporter.sendMail(mailOptions);
        //   console.log("Email sent successfully");
        // } catch (err) {
        //   console.log("Email failed:", err);
        // }

        //Send Mail Using Resend
        // try {
        //   const response = await resend.emails.send({
        //     from: "Team Suite <onboarding@resend.dev>",
        //     to: req.body.employee.email,
        //     subject: "Your Login Credentials",
        //     html: `<h3>Username: ${req.body.employee.email}</h3><h3>Password: ${password}</h3><h4>Note : Reset your password now.</h4>`,
        //   });
        //   console.log("EMAIL SENT:", response);
        // } catch (mailErr) {
        //   console.log("EMAIL ERROR:", mailErr);
        // }

        sendAdminMail(req.body.employee.email, password);

        req.flash("success", "Admin create & register successfully.");
        return res.redirect("/");
      }
    }
  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      req.flash("error", "EmployeeId already exists in this company.");
      return res.redirect("/admin");
    }
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
