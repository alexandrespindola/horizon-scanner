/**
 * N8N Integration for Horizon Scanner
 * Handles webhook calls and communication with N8N
 */

// N8N Configuration
const N8N_CONFIG = {
  WEBHOOK_URL: "https://n8n-groupon.titansdev.es/webhook-test/horizon-scanner",
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
};

/**
 * Sends mission data to N8N webhook
 * @param {Object} missionData - Mission data to send
 * @returns {Object} Response from N8N
 */
function sendToN8N(missionData) {
  try {
    console.log("Sending to N8N:", missionData);

    const payload = {
      mission_id: missionData.mission_id,
      city: missionData.city,
      category: missionData.category,
      notes: missionData.notes || "",
      timestamp: new Date().toISOString(),
      source: "google_sheets",
      version: "1.0",
    };

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "HorizonScanner-GoogleSheets/1.0",
        "X-Source": "Google Apps Script",
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
      timeout: N8N_CONFIG.TIMEOUT,
    };

    const response = UrlFetchApp.fetch(N8N_CONFIG.WEBHOOK_URL, options);
    const responseCode = response.getResponseCode();
    const responseText = response.getContentText();

    console.log("N8N Response Code:", responseCode);
    console.log("N8N Response:", responseText);

    if (responseCode === 200) {
      return {
        success: true,
        message: "Mission sent to N8N successfully",
        response: responseText,
      };
    } else {
      throw new Error(`N8N returned status ${responseCode}: ${responseText}`);
    }
  } catch (error) {
    console.error("Error sending to N8N:", error);
    throw new Error(`Failed to send to N8N: ${error.message}`);
  }
}

/**
 * Retry mechanism for N8N webhook calls
 * @param {Object} missionData - Mission data to send
 * @returns {Object} Response from N8N
 */
function sendToN8NWithRetry(missionData) {
  let lastError;

  for (let attempt = 1; attempt <= N8N_CONFIG.RETRY_ATTEMPTS; attempt++) {
    try {
      console.log(`N8N attempt ${attempt}/${N8N_CONFIG.RETRY_ATTEMPTS}`);
      return sendToN8N(missionData);
    } catch (error) {
      lastError = error;
      console.log(`Attempt ${attempt} failed:`, error.message);

      if (attempt < N8N_CONFIG.RETRY_ATTEMPTS) {
        // Wait before retry (exponential backoff)
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Waiting ${waitTime}ms before retry...`);
        Utilities.sleep(waitTime);
      }
    }
  }

  throw new Error(
    `All ${N8N_CONFIG.RETRY_ATTEMPTS} attempts failed. Last error: ${lastError.message}`
  );
}

/**
 * Test N8N connection
 * @returns {Object} Test result
 */
function testN8NConnection() {
  try {
    const testData = {
      mission_id: "test-" + Date.now(),
      city: "Test City",
      category: "Test Category",
      notes: "This is a test mission to verify N8N connection",
      timestamp: new Date().toISOString(),
      source: "google_sheets_test",
      version: "1.0",
    };

    const result = sendToN8N(testData);

    return {
      success: true,
      message: "N8N connection test successful",
      test_data: testData,
      response: result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      message: "N8N connection test failed",
    };
  }
}

/**
 * Update N8N webhook URL
 * @param {string} newUrl - New webhook URL
 * @returns {Object} Update result
 */
function updateN8NWebhook(newUrl) {
  try {
    if (!newUrl || !newUrl.startsWith("http")) {
      throw new Error("Invalid URL format");
    }

    N8N_CONFIG.WEBHOOK_URL = newUrl;

    return {
      success: true,
      message: "N8N webhook URL updated successfully",
      new_url: newUrl,
    };
  } catch (error) {
    throw new Error(`Failed to update webhook URL: ${error.message}`);
  }
}

/**
 * Get current N8N configuration
 * @returns {Object} Current configuration
 */
function getN8NConfig() {
  return {
    webhook_url: N8N_CONFIG.WEBHOOK_URL,
    timeout: N8N_CONFIG.TIMEOUT,
    retry_attempts: N8N_CONFIG.RETRY_ATTEMPTS,
    last_updated: new Date().toISOString(),
  };
}
