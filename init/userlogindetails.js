const mongoose = require("../connection/dbconnection.js");
const User = require("../models/login.js");

let admin = new User({
  email: "admin@gmail.com",
  password: "admin@123",
});

admin
  .save()
  .then((result) => {
    console.log("Saved admin : ", result);
  })
  .catch((err) => {
    console.log("Admin not saved : ", err);
  });
