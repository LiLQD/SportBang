require("dotenv").config({
  path: require("path").resolve(__dirname, "../../.env"),
});

const mongoose = require("mongoose");
const Field = require("../models/Field");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  await Field.deleteMany();

  await Field.insertMany([
    { name: "Sân A", price: 100000 },
    { name: "Sân B", price: 120000 },
  ]);

  console.log("Seed done");
  process.exit();
};

seed();
