window.addEventListener("message", (event) => {
  if (event.data?.type === "OPEN_DASHBOARD_DIALOG") {
    // Create iframe for dashboard
    const dashboardIframe = document.createElement("iframe");
    dashboardIframe.src = chrome.runtime.getURL("dashboard.html");
    dashboardIframe.style.zIndex = "9999";
    dashboardIframe.style.position = "absolute"; // Absolute positioning within the container
    dashboardIframe.style.border = "none";
    dashboardIframe.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    dashboardIframe.style.width = "450px";
    dashboardIframe.style.height = "300px";
    dashboardIframe.style.borderRadius = "16px";
    dashboardIframe.style.backgroundColor = "black"; // For visibility
    dashboardIframe.id = "dashboard-iframe"; // Add an ID for easy reference

    // Initially set opacity to 0 (hidden)
    dashboardIframe.style.opacity = "0";
    dashboardIframe.style.transition = "opacity 0.25s ease"; // Fade-in transition over 0.5 seconds

    // Find the action button element
    const actionButton = document.querySelector("#action-bar"); // Correct selector for the action button
    if (actionButton) {
      // Get the position and size of the action button relative to the viewport
      const actionButtonRect = actionButton.getBoundingClientRect();

      // Find the container where you want to append the iframe (different div)
      const iframeContainer = document.querySelector(".aHU.hx"); // Replace with your container's selector
      if (iframeContainer) {
        // Ensure the iframe container is positioned relative to allow absolute positioning of the iframe
        iframeContainer.style.position = "relative";

        // Calculate the position of the iframe inside the container
        const containerRect = iframeContainer.getBoundingClientRect();

        // Position the iframe to the right of the action button
        dashboardIframe.style.top = `${
          actionButtonRect.bottom - containerRect.top + 10
        }px`; // 10px gap
        dashboardIframe.style.right = `${
          containerRect.right - actionButtonRect.right
        }px`; // Align to the right of the action button

        // Append iframe to the iframeContainer
        iframeContainer.appendChild(dashboardIframe);

        // Wait for the iframe to be added, then trigger the fade-in effect
        setTimeout(() => {
          dashboardIframe.style.opacity = "1"; // Fade in the iframe
        }, 10); // Small delay to ensure the iframe is added before starting the transition

        dashboardIframe.onload = () => {
          dashboardIframe.contentWindow.postMessage(
            {
              type: "DASHBOARD_PREDICTION_DATA",
              payload: event.data.payload, // Pass through the prediction data
            },
            "*"
          );
        };

        // Add event listener to close the iframe when clicking outside
        const closeIframeOnClickOutside = (e) => {
          if (!dashboardIframe.contains(e.target)) {
            dashboardIframe.remove(); // Remove the iframe
            document.removeEventListener("click", closeIframeOnClickOutside); // Clean up the event listener
          }
        };

        // Add event listener to the document
        setTimeout(() => {
          document.addEventListener("click", closeIframeOnClickOutside);
        }, 0); // Timeout ensures the click doesn't trigger immediately
      }
    }
  }
});
