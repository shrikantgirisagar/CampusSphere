const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    division: {
      type: String,
      required: true,
      trim: true
    },
    semester: {
      type: String,
      default: "",
      trim: true
    },
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    time: {
      type: String,
      required: true,
      trim: true
    },
    subject: {
      type: String,
      default: "",
      trim: true
    },
    subjectText: {
      type: String,
      required: true,
      trim: true
    },
    faculty: {
      type: String,
      default: "",
      trim: true
    }
  },
  {
    timestamps: true,
    strict: false,
    versionKey: false
  }
);

timetableSchema.index({ division: 1, semester: 1, day: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);
