
const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    trim: true
  },

  method: {
    type: String,
    required: true,
    enum: ["GET", "POST", "PUT", "DELETE"]
  },

  endpoint: {
    type: String,
    required: true,
    trim: true
  },

  responseCode: {
    type: Number,
    default: 200
  },

  status: {
    type: String,
    enum: ["Valid", "Invalid"],
    default: "Valid"
  },

  anomalyReason: {
    type: String,
    default: ""
  },

  stateBefore: {
    type: String,
    default: "START"
  },

  stateAfter: {
    type: String,
    default: "START"
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

}, { timestamps: true });

module.exports = mongoose.model("Request", requestSchema);
