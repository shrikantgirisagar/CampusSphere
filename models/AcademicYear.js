// models/AcademicYear.js
// Dedicated Mongoose model for Dynamic Academic Years in CampusSphere.
// Supports arbitrary future academic years (2026–27, 2027–28, 2028–29, etc.),
// independent semester configuration, and lifecycle management (upcoming, active, completed, archived).

const mongoose = require("mongoose");

const semesterItemSchema = new mongoose.Schema(
  {
    semester: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "1st Semester",
        "2nd Semester",
        "3rd Semester",
        "4th Semester",
        "5th Semester",
        "6th Semester"
      ]
    },
    cycle: {
      type: String,
      enum: ["odd", "even", "annual"],
      default: function () {
        const s = String(this.semester).toLowerCase();
        if (s.includes("1") || s.includes("3") || s.includes("5")) return "odd";
        return "even";
      }
    },
    courseYear: {
      type: String,
      enum: ["1st Year", "2nd Year", "3rd Year"],
      default: function () {
        const s = String(this.semester).toLowerCase();
        if (s.includes("1") || s.includes("2")) return "1st Year";
        if (s.includes("3") || s.includes("4")) return "2nd Year";
        return "3rd Year";
      }
    },
    isOperational: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ["active", "upcoming", "inactive", "completed"],
      default: "active"
    }
  },
  { _id: false }
);

const academicYearSchema = new mongoose.Schema(
  {
    yearCode: {
      type: String,
      required: [true, "Academic year code is required (e.g. 2026–27)"],
      unique: true,
      trim: true,
      maxlength: 30,
      index: true
    },
    title: {
      type: String,
      required: [true, "Academic year title is required"],
      trim: true,
      maxlength: 100
    },
    startDate: {
      type: Date,
      required: [true, "Start date is required"]
    },
    endDate: {
      type: Date,
      required: [true, "End date is required"],
      validate: {
        validator: function (v) {
          if (!this.startDate || !v) return true;
          return new Date(v).getTime() > new Date(this.startDate).getTime();
        },
        message: "End date must be strictly after start date"
      }
    },
    status: {
      type: String,
      enum: ["upcoming", "active", "completed", "archived"],
      default: "upcoming",
      index: true
    },
    activeCycle: {
      type: String,
      enum: ["odd", "even", "both", "custom"],
      default: "odd"
    },
    semesterConfiguration: {
      type: [semesterItemSchema],
      default: () => [
        { semester: "1st Semester", cycle: "odd", courseYear: "1st Year", isOperational: true, status: "active" },
        { semester: "2nd Semester", cycle: "even", courseYear: "1st Year", isOperational: false, status: "upcoming" },
        { semester: "3rd Semester", cycle: "odd", courseYear: "2nd Year", isOperational: true, status: "active" },
        { semester: "4th Semester", cycle: "even", courseYear: "2nd Year", isOperational: false, status: "upcoming" },
        { semester: "5th Semester", cycle: "odd", courseYear: "3rd Year", isOperational: true, status: "active" },
        { semester: "6th Semester", cycle: "even", courseYear: "3rd Year", isOperational: false, status: "upcoming" }
      ]
    },
    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500
    },
    createdBy: {
      type: String,
      default: "admin",
      trim: true
    },
    updatedBy: {
      type: String,
      default: "admin",
      trim: true
    },
    activatedAt: {
      type: Date,
      default: null
    },
    completedAt: {
      type: Date,
      default: null
    },
    archivedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    strict: true,
    versionKey: "__v"
  }
);

// Enforce at the MongoDB database level that AT MOST ONE document may have status === "active"
academicYearSchema.index(
  { status: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "active" }
  }
);

academicYearSchema.pre("validate", function () {
  if (this.startDate && this.endDate && this.startDate >= this.endDate) {
    this.invalidate("endDate", "End date must be strictly after start date");
  }
});

// Helper instance method to check if a semester is currently operational in this academic year
academicYearSchema.methods.isSemesterOperational = function (semesterName) {
  if (!Array.isArray(this.semesterConfiguration)) return false;
  const item = this.semesterConfiguration.find(
    s => s.semester.toLowerCase() === String(semesterName).toLowerCase()
  );
  return item ? (item.isOperational && item.status === "active") : false;
};

// Static helper to retrieve the single active academic year with graceful fallback
academicYearSchema.statics.getActiveYear = async function () {
  return this.findOne({ status: "active" }).exec();
};

// Method to strip private audit and administrative metadata for public serialization
academicYearSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.createdBy;
  delete obj.updatedBy;
  delete obj.activatedAt;
  delete obj.completedAt;
  delete obj.archivedAt;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("AcademicYear", academicYearSchema);
