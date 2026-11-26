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
      enum: ["DM Sans", "Sora", "Arial", "Inter", "Roboto", "Times New Roman", "Georgia", "Courier New", "Outfit", "Plus Jakarta Sans"],
      default: "DM Sans"
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
    academicYear: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50,
      index: true
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      default: null
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

// Compound unique index for versioned legacy slot documents (excludes unversioned historical records)
timetableSchema.index(
  { academicYear: 1, division: 1, semester: 1, day: 1, time: 1 },
  {
    unique: true,
    partialFilterExpression: {
      academicYear: { $type: "string", $gt: "" },
      day: { $exists: true, $type: "string" }
    }
  }
);

// Compound unique index on academicYear + semester + division for grid documents
// Permits different academic years to have separate timetables for the same semester and division
timetableSchema.index(
  { academicYear: 1, semester: 1, division: 1 },
  {
    unique: true,
    partialFilterExpression: { days: { $exists: true, $type: "array" } }
  }
);

module.exports = mongoose.model("Timetable", timetableSchema);
