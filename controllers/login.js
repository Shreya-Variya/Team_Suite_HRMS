const passport = require("passport");
// const nodemailer = require("nodemailer");
const UserLogin = require("../models/login.js");
const Employee = require("../models/employee.js");
const VerificationCode = require("../models/verificationcode.js");
const { text } = require("stream/consumers");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const defaultClient = SibApiV3Sdk.ApiClient.instance;

const apiKey = defaultClient.authentications["api-key"];

apiKey.apiKey = process.env.BREVO_API;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

async function sendOTPMail(verificationCode) {
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

      subject: "Your Verification Code",

      htmlContent: `<h3>Your verification code for forgot password is: ${verificationCode}</h3>`,
    };

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);

    console.log("MAIL SENT:", response);
  } catch (err) {
    console.log("MAIL ERROR:", err);
  }
}

//Controller that authenticate the user
module.exports.login = (req, res, next) => {
  console.log("Logged In : ", req.body);
  if (req.body == undefined) {
    return res
      .status(400)
      .json({ success: false, message: "Email and Password is required." });
  }
  passport.authenticate("local", (err, user, info) => {
    console.log("Passport authenticate.");
    if (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Internal Server Error." });
    }
    if (!user) {
      console.log("Wrong credentials. User not found.");
      return res.status(404).json({
        success: false,
        message: "Wrong credentials. User not found.",
      });
    }
    console.log("User : ", user);
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }

      let employee = await Employee.findOne({ _id: user.employeeId })
        .populate("department", "name")
        .populate("jobRole", "role");
      console.log("Employee Data: ", employee);

      return res.status(200).json({
        success: true,
        message: "User Logged In Successfully.",
        userData: employee,
      });
    });
  })(req, res, next);
};

//Controller that send the verification code on mail
module.exports.sendcode = async (req, res) => {
  try {
    if (req.body == undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required." });
    }
    let { email } = req.body;
    console.log(email);
    const findUser = await UserLogin.findOne({ email: email });
    console.log(findUser);
    if (findUser == null) {
      return res.status(404).json({
        success: false,
        message: "Wrong credentials. User not found.",
      });
    } else {
      const verificationCode = Math.floor(100000 + Math.random() * 900000);
      console.log(verificationCode);
      // let transporter = nodemailer.createTransport({
      //   service: "gmail",
      //   auth: {
      //     user: process.env.EMAIL,
      //     pass: process.env.APP_PASSKEY,
      //   },
      // });
      // let mailOptions = {
      //   from: '"Team Suite" <teamsuitehrms@gmail.com>',
      //   to: email,
      //   subject: "Your Verification Code",
      //   html: `<h3>Your verification code for forgot password is: ${verificationCode}</h3>`,
      // };
      // await transporter.sendMail(mailOptions);

      var generateCode = new VerificationCode({
        emailFrom: "variyashreya2005@gmail.com",
        emailTo: email,
        verificationcode: verificationCode,
      });
      console.log(generateCode);

      let saveGeneratedCode = await generateCode.save();
      console.log(saveGeneratedCode);

      sendOTPMail(verificationCode);

      return res.status(200).json({
        success: true,
        message: "User verified. Please check your email.",
      });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that verify the code which send on mail
module.exports.verifycode = async (req, res) => {
  try {
    if (req.body == undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Verification code is required." });
    }
    let { email, code } = req.body;
    const verifyCode = await VerificationCode.findOne({
      emailTo: email,
      verificationcode: code,
    });
    console.log(verifyCode);
    if (!verifyCode) {
      return res.status(404).json({
        success: false,
        message: "Invalid verification code.",
      });
    } else {
      const now = Date.now();
      const expires = new Date(verifyCode.expirationTime).getTime();
      if (now > expires) {
        return res
          .status(410)
          .json({ success: false, message: "Verification code is expired." });
      } else {
        return res.status(200).json({
          success: true,
          message: "User verified. Now you can reset the password.",
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

//Controller that reset the password
module.exports.resetpassword = async (req, res) => {
  try {
    if (req.body == undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password is required." });
    }
    const { email, newPassword } = req.body;
    console.log(email, "\n", newPassword, "\n");

    const user = await UserLogin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Wrong credentials. User not found.",
      });
    }
    console.log("User : ", user);

    await user.setPassword(newPassword);
    await user.save();

    return res
      .status(200)
      .json({ success: true, message: "Password reset successfully." });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

//Controller that change the password
module.exports.changepassword = async (req, res) => {
  try {
    if (req.body == undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password is required." });
    }
    const { email, oldPassword, newPassword } = req.body;
    console.log(email, "\n", oldPassword, "\n", newPassword);
    const user = await UserLogin.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Wrong credentials. User not found.",
      });
    }
    console.log("User : ", user);

    try {
      await user.changePassword(oldPassword, newPassword);
      return res.status(200).json({
        success: true,
        message: "Password changed successfully.",
      });
    } catch (err) {
      if (err.name === "IncorrectPasswordError") {
        return res.status(401).json({
          success: false,
          message: "OldPassword is incorrect.",
        });
      }
      throw err;
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};
