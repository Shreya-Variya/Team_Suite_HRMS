const mongoose = require("mongoose");
const dbUrl = process.env.DB_URL;
// console.log("MONGO_URI:", dbUrl);

connection()
  .then(() => {
    console.log("Connected to Database.");
  })
  .catch((err) => {
    console.log(err);
  });

async function connection() {
  await mongoose.connect(dbUrl);
}

module.exports = mongoose;
