const mongoose = require("mongoose");

const VALID_YEAR_CONFIG = {
  1: {
    yearLevel: 1,
    yearTitle: "First Year BCA",
    academicYear: "2025–26",
    semesterLabel: "Semester I & II",
    semesters: [1, 2]
  },
  2: {
    yearLevel: 2,
    yearTitle: "Second Year BCA",
    academicYear: "2026–27",
    semesterLabel: "Semester III & IV",
    semesters: [3, 4]
  },
  3: {
    yearLevel: 3,
    yearTitle: "Third Year BCA",
    academicYear: "2027–28",
    semesterLabel: "Semester V & VI",
    semesters: [5, 6]
  }
};

const VALID_SEMESTER_YEAR_MAP = {
  1: { yearLevel: 1, academicYear: "2025–26" },
  2: { yearLevel: 1, academicYear: "2025–26" },
  3: { yearLevel: 2, academicYear: "2026–27" },
  4: { yearLevel: 2, academicYear: "2026–27" },
  5: { yearLevel: 3, academicYear: "2027–28" },
  6: { yearLevel: 3, academicYear: "2027–28" }
};

const syllabusSchema = new mongoose.Schema(
  {
    yearLevel: {
      type: Number,
      required: true,
      enum: [1, 2, 3],
      unique: true,
      index: true
    },
    semester: {
      type: Number,
      default: function () {
        return this.yearLevel;
      },
      index: true
    },
    yearTitle: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    semesterLabel: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    originalFilename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    storedFilename: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255
    },
    storagePath: {
      type: String,
      required: true,
      trim: true
    },
    mimeType: {
      type: String,
      required: true,
      default: "application/pdf"
    },
    fileSize: {
      type: Number,
      required: true,
      min: 0
    },
    uploadedBy: {
      type: String,
      required: true,
      trim: true,
      default: "admin"
    }
  },
  {
    timestamps: true,
    strict: true,
    versionKey: false
  }
);

// Schema validation hook ensuring accurate year configuration
syllabusSchema.pre("validate", function () {
  const config = VALID_YEAR_CONFIG[this.yearLevel];
  if (!config) {
    throw new Error(`Invalid yearLevel: ${this.yearLevel}. Must be 1, 2, or 3.`);
  }
  if (!this.yearTitle) {
    this.yearTitle = config.yearTitle;
  }
  if (!this.academicYear) {
    this.academicYear = config.academicYear;
  }
  if (!this.semesterLabel) {
    this.semesterLabel = config.semesterLabel;
  }
  if (!this.semester) {
    this.semester = config.yearLevel;
  }
});

module.exports = mongoose.model("Syllabus", syllabusSchema);
module.exports.VALID_YEAR_CONFIG = VALID_YEAR_CONFIG;
module.exports.VALID_SEMESTER_YEAR_MAP = VALID_SEMESTER_YEAR_MAP;
