const mongoose = require("mongoose");

const otpVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 120,
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    purpose: {
      type: String,
      required: true,
      enum: ["signup_verification", "password_reset"],
      index: true
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    lastSentAt: {
      type: Date,
      default: Date.now
    },
    used: {
      type: Boolean,
      default: false,
      index: true
    },
    usedAt: {
      type: Date,
      default: null
    },
    resetTokenHash: {
      type: String,
      default: null,
      index: true
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null
    },
    signupData: {
      type: mongoose.Schema.Types.Mixed,
      default: null
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

// Compound index for querying active verifications per email and purpose
otpVerificationSchema.index({ email: 1, purpose: 1, used: 1 });

module.exports = mongoose.model("OtpVerification", otpVerificationSchema);
