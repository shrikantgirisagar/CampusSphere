const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    noteId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    subject: {
      type: String,
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    division: {
      type: String,
      default: "All Divisions"
    },
    fileName: {
      type: String,
      default: ""
    },
    fileData: {
      type: String,
      default: ""
    },
    uploadedBy: {
      type: String,
      required: true
    },
    uploadedByName: {
      type: String,
      default: "Faculty"
    },
    date: {
      type: String,
      default: ""
    }
  },
  {
    timestamps: true,
    strict: false,
    versionKey: false
  }
);

module.exports = mongoose.model("Note", noteSchema);
