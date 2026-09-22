const mongoose = require("mongoose");

const cellSchema = new mongoose.Schema(
  {
    dayIndex: {
      type: Number,
      required: true,
      min: 0
    },
    slotIndex: {
      type: Number,
      required: true,
      min: 0
    },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200
    },
    bold: {
      type: Boolean,
      default: false
    },
    fontFamily: {
      type: String,
      enum: ["Arial", "Inter", "Roboto", "Times New Roman", "Georgia", "Courier New", "Outfit", "Plus Jakarta Sans"],
      default: "Inter"
    },
    fontSize: {
      type: String,
      enum: ["11px", "12px", "13px", "14px", "16px", "18px", "20px"],
      default: "13px"
    },
    textAlign: {
      type: String,
      enum: ["left", "center", "right"],
      default: "center"
    },
    rowSpan: {
      type: Number,
      default: 1,
      min: 1,
      max: 20
    },
    colSpan: {
      type: Number,
      default: 1,
      min: 1,
      max: 20
    },
    mergedInto: {
      type: new mongoose.Schema(
        {
          dayIndex: { type: Number, required: true },
          slotIndex: { type: Number, required: true }
        },
        { _id: false }
      ),
      default: null
    }
  },
  { _id: false }
);

const DEFAULT_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const DEFAULT_TIME_SLOTS = [
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 01:00",
  "02:00 - 03:00",
  "03:00 - 04:00"
];

const timetableSchema = new mongoose.Schema(
  {
    semester: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      index: true
    },
    division: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      index: true
    },
    days: {
      type: [String],
      default: undefined
    },
    timeSlots: {
      type: [String],
      default: undefined
    },
    cells: {
      type: [cellSchema],
      default: undefined
    },
    // Compatibility fields for legacy test harness queries
    day: { type: String, trim: true },
    time: { type: String, trim: true },
    subject: { type: String, trim: true },
    subjectText: { type: String, trim: true },
    faculty: { type: String, trim: true }
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false
  }
);

// Compound unique index for legacy slot documents
timetableSchema.index(
  { division: 1, semester: 1, day: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: { day: { $exists: true, $type: "string" } }
  }
);

// Compound index on semester + division for grid documents
timetableSchema.index(
  { semester: 1, division: 1 },
  {
    unique: true,
    partialFilterExpression: { days: { $exists: true, $type: "array" } }
  }
);

module.exports = mongoose.model("Timetable", timetableSchema);
