const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });
const mongoose = require("../connection/dbconnection.js");
const Department = require("../models/department.js");

const departments = [
  {
    name: "Information Technology (IT)",
  },
  {
    name: "Administration",
  },
  {
    name: "Executive Management/Leadership",
  },
  {
    name: "Human Resources (HR)",
  },
  {
    name: "Finance and Accounting",
  },
  {
    name: "Operations / Production",
  },
  {
    name: "Product Management",
  },
  {
    name: "Sales",
  },
  {
    name: "Marketing",
  },
  {
    name: "Research and Development (R&D)",
  },
  {
    name: "Customer Service",
  },
  {
    name: "Business Development",
  },
];

Department.insertMany(departments)
  .then((result) => {
    console.log("Saved departments : ", result);
  })
  .catch((err) => {
    console.log("Departments not saved : ", err);
  });
