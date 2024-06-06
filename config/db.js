const mongoose = require("mongoose");

const connectDB = async (req, res) => {
  try {
    await mongoose.connect(process.env.mongo_url);
    console.log(`Mongodb connected on ${mongoose.connection.host}`);
  } catch (error) {
    console.log(`MongoDB Server issue ${error}`);
    res.status(401).send({
      success: false,
      message: `MongoDB Server issue ${error}`,
    });
  }
};

module.exports = connectDB;
