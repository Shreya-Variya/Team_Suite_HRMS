const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const loginController = require("../controllers/login.js");

//API which Authenticate the user at the time of login
router.route("/login").post(loginController.login);

//API which send the verification code on mail
router.route("/sendcode").post(wrapAsync(loginController.sendcode));

//API which verify the code which send on mail
router.route("/verifycode").post(wrapAsync(loginController.verifycode));

//API which set the password at the time of forgot password situation
router.route("/resetpassword").post(wrapAsync(loginController.resetpassword));

//API which change password when user request for it
router.route("/changepassword").post(wrapAsync(loginController.changepassword));

module.exports = router;
