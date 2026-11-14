
function detectAnomaly(result) {

  if (result.isValid) {
    return {
      detected: false,
      message: "No suspicious pattern detected"
    };
  }

  return {
    detected: true,
    message: result.reason
  };
}

module.exports = detectAnomaly;
