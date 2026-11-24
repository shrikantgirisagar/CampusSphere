const mongoose = require("mongoose");

const COURSE_YEAR_LEVELS = {
  1: {
    yearLevel: 1,
    yearTitle: "First Year BCA",
    semesterLabel: "Semester I & II",
    semesters: [1, 2]
  },
  2: {
    yearLevel: 2,
    yearTitle: "Second Year BCA",
    semesterLabel: "Semester III & IV",
    semesters: [3, 4]
  },
  3: {
    yearLevel: 3,
    yearTitle: "Third Year BCA",
    semesterLabel: "Semester V & VI",
    semesters: [5, 6]
  }
};

const syllabusSchema = new mongoose.Schema(
  {
    yearLevel: {
      type: Number,
      required: true,
      min: 1,
      index: true
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      default: null
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

// Compound index ensuring one syllabus document per year level within a specific academic year
syllabusSchema.index({ academicYear: 1, yearLevel: 1 }, { unique: true });

// Schema validation hook ensuring accurate structural labels without hardcoding academic years
syllabusSchema.pre("validate", function () {
  const config = COURSE_YEAR_LEVELS[this.yearLevel] || {
    yearLevel: this.yearLevel,
    yearTitle: `Year ${this.yearLevel} BCA`,
    semesterLabel: `Semester ${this.yearLevel * 2 - 1} & ${this.yearLevel * 2}`
  };
  if (!this.yearTitle) {
    this.yearTitle = config.yearTitle;
  }
  if (!this.semesterLabel) {
    this.semesterLabel = config.semesterLabel;
  }
  if (!this.semester) {
    this.semester = config.yearLevel || this.yearLevel;
  }
});

module.exports = mongoose.model("Syllabus", syllabusSchema);
module.exports.COURSE_YEAR_LEVELS = COURSE_YEAR_LEVELS;
module.exports.VALID_YEAR_CONFIG = COURSE_YEAR_LEVELS;
