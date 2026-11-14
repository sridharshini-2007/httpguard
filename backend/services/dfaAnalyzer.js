
function analyzeRequest(request, previousRequests) {

  // Find the latest valid DFA state
  const lastValidRequest = [...previousRequests]
    .reverse()
    .find(item => item.status === "Valid");

  const currentState = lastValidRequest
    ? lastValidRequest.stateAfter
    : "START";

  let nextState = currentState;
  let isValid = true;
  let reason = "";

  const { method, endpoint } = request;

  // Count previous identical requests
  const repeatedCount = previousRequests.filter(item =>
    item.method === method &&
    item.endpoint === endpoint
  ).length;

  // Detect repeated requests
  if (repeatedCount >= 2) {
    isValid = false;
    reason = "Repeated request detected";
  }

  // DFA transition rules
  if (isValid) {

    if (currentState === "START" &&
        method === "GET" &&
        endpoint === "/login") {
      nextState = "LOGGED_IN";
    }

    else if (currentState === "LOGGED_IN" &&
             method === "GET" &&
             endpoint === "/dashboard") {
      nextState = "DASHBOARD";
    }

    else if (currentState === "DASHBOARD" &&
             method === "GET" &&
             endpoint === "/profile") {
      nextState = "PROFILE";
    }

    else if ((currentState === "PROFILE" ||
              currentState === "DASHBOARD") &&
             method === "POST" &&
             endpoint === "/logout") {
      nextState = "LOGGED_OUT";
    }

    else {
      isValid = false;
      nextState = "INVALID";
      reason = currentState === "LOGGED_OUT"
        ? "Request received after logout"
        : "Unexpected HTTP request sequence";
    }
  }

  return {
    isValid,
    reason,
    stateBefore: currentState,
    stateAfter: isValid ? nextState : "INVALID",
    responseCode: isValid ? 200 : 401
  };
}

module.exports = analyzeRequest;
