require("dotenv").config();
const mongoose = require("mongoose");

async function connectToDB() {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database...");
  } catch (error) {
    console.log(err);
  }
}

module.exports = connectToDB;
