
const express = require("express");
const router = express.Router();

const Request = require("../models/Request");
const analyzeRequest = require("../services/dfaAnalyzer");
const detectAnomaly = require("../services/anomalyDetector");

// GET - Retrieve all requests
router.get("/", async (req, res) => {
  try {
    const requests = await Request.find()
      .sort({ timestamp: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// POST - Receive and analyze HTTP request events
router.post("/", async (req, res) => {
  try {
    const { sessionId, method, endpoint } = req.body;

    if (!sessionId || !method || !endpoint) {
      return res.status(400).json({
        success: false,
        message: "Session ID, method and endpoint are required"
      });
    }

    const allowedMethods = ["GET", "POST", "PUT", "DELETE"];

    if (!allowedMethods.includes(method)) {
      return res.status(400).json({
        success: false,
        message: "Invalid HTTP method"
      });
    }

    if (typeof endpoint !== "string" ||
        !/^\/[a-zA-Z0-9/_-]*$/.test(endpoint)) {
      return res.status(400).json({
        success: false,
        message: "Invalid endpoint format"
      });
    }

    const previousRequests = await Request.find({ sessionId })
      .sort({ timestamp: 1 });

    // DFA analysis
    const result = analyzeRequest(
      { method, endpoint },
      previousRequests
    );

    // Anomaly detection
    const anomaly = detectAnomaly(result);

    // Store event
    const newRequest = await Request.create({
      sessionId,
      method,
      endpoint,
      responseCode: result.responseCode,
      status: result.isValid ? "Valid" : "Invalid",
      anomalyReason: anomaly.message,
      stateBefore: result.stateBefore,
      stateAfter: result.stateAfter
    });

    res.status(201).json({
      success: true,
      message: anomaly.message,
      anomaly,
      request: newRequest
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
