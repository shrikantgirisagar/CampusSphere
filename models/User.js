const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "faculty", "admin"],
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 30,
      match: /^[A-Za-z0-9_.-]{4,30}$/,
      index: true
    },
    usernameLower: {
      type: String,
      trim: true,
      lowercase: true
    },
    tokenVersion: {
      type: Number,
      default: 0
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      maxlength: 100,
      default: ""
    },
    passwordHash: {
      type: String,
      default: ""
    },
    subject: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    subjects: {
      type: [String],
      default: []
    },
    subjectDivisions: {
      type: Map,
      of: String,
      default: {}
    },
    department: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    division: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    semester: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    courseYear: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    course: {
      type: String,
      default: "",
      trim: true,
      maxlength: 100
    },
    languageChoice: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    mathChoice: {
      type: String,
      default: "",
      trim: true,
      maxlength: 50
    },
    profilePic: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

// Compound index for role-scoped username lookups and queries
userSchema.index({ role: 1, usernameLower: 1 });
userSchema.index({ role: 1, username: 1 });

userSchema.pre("save", function () {
  if (this.username) {
    this.usernameLower = this.username.toLowerCase();
  }
});

// Partial unique index on usernameLower: guarantees case-insensitive uniqueness among non-empty usernames
userSchema.index(
  { usernameLower: 1 },
  { unique: true, partialFilterExpression: { usernameLower: { $type: "string", $gt: "" } } }
);

// Partial unique index on email: guarantees uniqueness among non-empty emails while permitting multiple empty strings
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { email: { $type: "string", $gt: "" } } }
);

// Method to remove sensitive fields
userSchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.password;
  delete obj.__v;
  if (obj.subjectDivisions instanceof Map) {
    obj.subjectDivisions = Object.fromEntries(obj.subjectDivisions);
  } else if (!obj.subjectDivisions || typeof obj.subjectDivisions !== "object") {
    obj.subjectDivisions = {};
  }
  return obj;
};

module.exports = mongoose.model("User", userSchema);

