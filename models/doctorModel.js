const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    doctorId: {
      type: String,
    },
    userId: {
      type: String,
    },
    firstName: {
      type: String,
      require: [true, "First name is required"],
    },
    lastName: {
      type: String,
      require: [true, "Last name is required"],
    },
    phone: {
      type: String,
      require: [true, "Phone number is required"],
    },
    email: {
      type: String,
      require: [true, "Email is required"],
    },
    website: {
      type: String,
    },
    address: {
      type: String,
      require: [true, "Address is required"],
    },
    specialization: {
      type: String,
      require: [true, "Specialization is required"],
    },
    experience: {
      type: String,
      require: [true, "Experience is required"],
    },
    feesPerConsultation: {
      type: Number,
      require: [true, "Fees is required"],
    },
    status: {
      type: String,
      default: "Pending",
    },
    timings: {
      type: Array,
      require: [true, "Work timing is required"],
    },
  },
  { timestamps: true }
);

const doctorModel = mongoose.model("doctors", doctorSchema);

module.exports = doctorModel;
