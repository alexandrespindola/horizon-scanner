/**
 * Horizon Scanner - Simple Version
 */

function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu(" Horizon Scanner")
    .addItem("📋 Start Mission", "showDialog")
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu("Security")
        .addItem("Enable Test Protection", "enableTestProtection")
        .addItem("Disable Protection", "disableProtection")
    )
    .addSeparator()
    .addSubMenu(
      ui
        .createMenu("N8N Integration")
        .addItem("Test Connection", "testN8NConnection")
        .addItem("Update Webhook", "showUpdateWebhookDialog")
        .addItem("View Config", "showN8NConfig")
    )
    .addToUi();
}

function showDialog() {
  const html = HtmlService.createHtmlOutputFromFile("index.html")
    .setWidth(400)
    .setHeight(500);

  SpreadsheetApp.getUi().showModalDialog(html, "Start Mission");
}

function startMission(city, category, notes) {
  try {
    // Get active sheet
    const sheet = SpreadsheetApp.getActiveSheet();

    // Add mission data
    const missionId = "mission-" + Date.now();
    sheet.appendRow([missionId, city, category, "Started", new Date(), notes]);

    // Prepare mission data for N8N
    const missionData = {
      mission_id: missionId,
      city: city,
      category: category,
      notes: notes || "",
    };

    // Send to N8N (non-blocking)
    try {
      const n8nResult = sendToN8NWithRetry(missionData);
      console.log("N8N result:", n8nResult);

      // Update status to "Processing" if N8N accepted
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 4).setValue("Processing");

      SpreadsheetApp.getActiveSpreadsheet().toast(
        `Mission started and sent to N8N!`,
        "✅ Success",
        5
      );
    } catch (n8nError) {
      console.error("N8N error:", n8nError);

      // Still show success for mission creation, but warn about N8N
      SpreadsheetApp.getActiveSpreadsheet().toast(
        `Mission started! (N8N: ${n8nError.message})`,
        "⚠️ Partial Success",
        5
      );
    }

    return { success: true, mission_id: missionId };
  } catch (error) {
    throw new Error("Error: " + error.message);
  }
}

function doGet() {
  return HtmlService.createHtmlOutput("Horizon Scanner is running!");
}

// Security functions...
function enableTestProtection() {
  // ... existing code ...
}

function disableProtection() {
  // ... existing code ...
}

// N8N Integration UI functions
function testN8NConnection() {
  try {
    const result = testN8NConnection();

    if (result.success) {
      SpreadsheetApp.getUi().alert(
        "✅ N8N Connection Test Successful!\n\n" +
          "Webhook URL: " +
          result.test_data.mission_id +
          "\n" +
          "Response: " +
          result.response.message
      );
    } else {
      SpreadsheetApp.getUi().alert(
        "❌ N8N Connection Test Failed!\n\n" + "Error: " + result.error
      );
    }
  } catch (error) {
    SpreadsheetApp.getUi().alert(
      "Error testing N8N connection: " + error.message
    );
  }
}

function showUpdateWebhookDialog() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.prompt(
    "Update N8N Webhook URL",
    "Enter the new webhook URL:",
    ui.ButtonSet.OK_CANCEL
  );

  if (result.getSelectedButton() === ui.Button.OK) {
    try {
      const newUrl = result.getResponseText().trim();
      const updateResult = updateN8NWebhook(newUrl);

      SpreadsheetApp.getActiveSpreadsheet().toast(
        "Webhook URL updated successfully!",
        "✅ Updated",
        3
      );
    } catch (error) {
      SpreadsheetApp.getUi().alert("Error updating webhook: " + error.message);
    }
  }
}

function showN8NConfig() {
  try {
    const config = getN8NConfig();

    SpreadsheetApp.getUi().alert(
      "🔗 N8N Configuration\n\n" +
        "Webhook URL: " +
        config.webhook_url +
        "\n" +
        "Timeout: " +
        config.timeout +
        "ms\n" +
        "Retry Attempts: " +
        config.retry_attempts +
        "\n" +
        "Last Updated: " +
        config.last_updated
    );
  } catch (error) {
    SpreadsheetApp.getUi().alert("Error getting config: " + error.message);
  }
}
