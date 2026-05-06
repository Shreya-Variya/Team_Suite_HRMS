if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}

//Dependencies
const express = require("express");
const app = express();
var cors = require("cors");
const path = require("path");
const methodoverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("./connection/dbconnection.js");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

//Default Error Handler
const ExpressError = require("./utils/ExpressError.js");

//Models
const UserLogin = require("./models/login.js");
const Company = require("./models/company.js");

//Routes / Apis
const userLoginRouter = require("./routes/login.js");
const employeeRouter = require("./routes/employee.js");
const attendanceRouter = require("./routes/attendance.js");
const departmentRouter = require("./routes/department.js");
const jobroleRouter = require("./routes/jobrole.js");
const leavePolicyRouter = require("./routes/leavepolicy.js");
const leaveRouter = require("./routes/leave.js");
const notificationRouter = require("./routes/notification.js");
const employeeStatsRouter = require("./routes/employeestats.js");
const adminStatsRouter = require("./routes/adminstats.js");
const companyRouter = require("./routes/company.js");
const adminRouter = require("./routes/admin.js");

//MongoDB Session
const dbUrl = process.env.DB_URL;
const store = new MongoStore({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in Mongo Session Store.", err);
});

//Session Options
const sessionOptions = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

//Set the views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodoverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

//Default Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());
app.use(passport.session());
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
    },
    UserLogin.authenticate(),
  ),
);
passport.serializeUser(UserLogin.serializeUser());
passport.deserializeUser(UserLogin.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//Connect to the Port and Start the Server
app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("Server is listen from port - 3000.");
});

//Call UserLogin Routes / Api
app.use("/auth", userLoginRouter);
//Call Employee Routes / Api
app.use("/employee", employeeRouter);
//Call Attendance Routes / Api
app.use("/attendance", attendanceRouter);
//Call Department Routes / Api
app.use("/", departmentRouter);
//Call JobRole Routes / Api
app.use("/", jobroleRouter);
//Call Leave Policy Api
app.use("/leavepolicy", leavePolicyRouter);
//Call Leave Api
app.use("/leave", leaveRouter);
//Call Notification Api
app.use("/notification", notificationRouter);
//Call employee stats api
app.use("/", employeeStatsRouter);
//Call admin stats api
app.use("/", adminStatsRouter);
//Call company api
app.use("/company", companyRouter);
//Call admin api
app.use("/admin", adminRouter);

//Index Route / Api
app.get("/", (req, res) => {
  console.log("Port is listen from 3000.");
  res.render("index");
});

// app.get("/company", async (req, res) => {
//   let company = new Company({
//     companyName: "YESQUEST",
//     domain: "Information Technology",
//     address: {
//       street: "429, Silverstone Arcade, Causeway Road",
//       city: "Surat",
//       state: "Gujarat",
//     },
//     website: "https://yesquesttech.com/",
//     email: "info@yesquesttech.com",
//     about: "Innovate Enable Empower Through Tech",
//     workingDay: {
//       monday: true,
//       tuesday: true,
//       wednesday: true,
//       thursday: true,
//       friday: true,
//       saturday: false,
//       sunday: false,
//     },
//     startTime: "09:00 AM",
//     endTime: "07:00 PM",
//   });

//   let saveCompany = await company.save();
//   console.log(saveCompany);

//   res.json("Company Data Stored Successfully.");
// });

// app.get("/company", async (req, res) => {
//   let company = new Company({
//     companyName: "TechnoYuga",
//     domain: "Information Technology",
//     address: {
//       street: "Dabholi, Katargam",
//       city: "Surat",
//       state: "Gujarat",
//     },
//     website: "https://technoyuga.com/",
//     email: "hr@technoyuga.com",
//     about: "We are an emerging Software,  mobile, and web development company.",
//     workingDay: {
//       monday: true,
//       tuesday: true,
//       wednesday: true,
//       thursday: true,
//       friday: true,
//       saturday: false,
//       sunday: false,
//     },
//     startTime: "09:00 AM",
//     endTime: "06:00 PM",
//   });

//   let saveCompany = await company.save();
//   console.log(saveCompany);

//   res.json("Company Data Stored Successfully.");
// });

app.use((req, res, next) => {
  console.log("➡️ Request:", req.method, req.url);
  next();
});

//Default middlewares place in each routes or apis
app.use((req, res, next) => {
  next(new ExpressError(404, "Page Not Found."));
});

//End middleware which sends the response to end user
app.use((err, req, res, next) => {
  const status = err.statusCode || err.status || 500;
  const msg = err.message || "Internal Server Error.";
  console.log(err);
  res.status(status).json({ success: false, message: msg });
});

// app.get("/demouser", async (req, res) => {
//   let user = new UserLogin({
//     email: "admin@gmail.com",
//   });
//   let registerUser = await UserLogin.register(user, "admin@123");
//   res.send(registerUser);
// });
