// Detect the appropriate storage API (sync if available, otherwise local)
const storage = (chrome?.storage?.sync || browser?.storage?.sync || chrome?.storage?.local || browser?.storage?.local);

if (!storage) {
    console.error("Storage API is not available. Check permissions in manifest.json.");
}

// Save the domain to storage
document.getElementById("save").addEventListener("click", () => {
    const domainInput = document.getElementById("domain");
    const domain = domainInput.value.trim();

    if (!domain || !domain.startsWith("https://")) {
        displayStatus("Please enter a valid domain starting with https://", true);
        return;
    }

    // Save the domain to storage
    try {
        storage.set({ spinnakerDomain: domain }, () => {
            const lastError = chrome?.runtime?.lastError || browser?.runtime?.lastError;
            if (lastError) {
                console.error(lastError.message);
                displayStatus("Failed to save settings. Please try again.", true);
            } else {
                displayStatus("Settings saved!", false); // Show success message
                setTimeout(() => {
                    displayStatus("", false); // Clear the status message after 1.5 seconds
                    window.close(); // Close the page after 1.5 seconds
                }, 1500);
            }
        });
    } catch (error) {
        console.error("Error saving to storage:", error); 
        displayStatus("An unexpected error occurred. Please try again.", true);
    }
});

// Load the saved domain on page load
if (storage) {
    storage.get("spinnakerDomain", (data) => {
        const domain = data?.spinnakerDomain || data?.["spinnakerDomain"]; // Handle Firefox/Chrome format differences
        if (domain) {
            document.getElementById("domain").value = domain;
        }
    });
}

// Display status messages
function displayStatus(message, isError) {
    const status = document.getElementById("status");
    status.textContent = message;
    status.style.color = isError ? "#FF0000" : "#4CAF50"; // Red for errors, green for success
    status.style.display = message ? "block" : "none";
}
