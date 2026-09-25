const mongoose = require("mongoose");

const pushSubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true
    },
    username: {
      type: String,
      required: true,
      index: true,
      trim: true
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "faculty", "admin"],
      index: true
    },
    endpoint: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true
    },
    keys: {
      p256dh: {
        type: String,
        required: true,
        trim: true
      },
      auth: {
        type: String,
        required: true,
        trim: true
      }
    },
    userAgent: {
      type: String,
      default: "",
      trim: true,
      maxlength: 255
    }
  },
  {
    timestamps: true,
    strict: true
  }
);

// Compound index for querying user-scoped subscriptions efficiently
pushSubscriptionSchema.index({ username: 1, role: 1 });
pushSubscriptionSchema.index({ userId: 1, endpoint: 1 });

module.exports = mongoose.model("PushSubscription", pushSubscriptionSchema);
