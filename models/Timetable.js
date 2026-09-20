const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    division: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    semester: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    day: {
      type: String,
      required: true,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    },
    time: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    subjectText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    faculty: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    }
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false
  }
);

timetableSchema.index({ division: 1, semester: 1, day: 1, time: 1 }, { unique: true });

module.exports = mongoose.model("Timetable", timetableSchema);
