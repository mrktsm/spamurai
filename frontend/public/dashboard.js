window.addEventListener("message", (event) => {
  if (event.data?.type === "OPEN_DASHBOARD_DIALOG") {
    // Create iframe for dashboard
    const dashboardIframe = document.createElement("iframe");
    dashboardIframe.src = chrome.runtime.getURL("dashboard.html");
    dashboardIframe.style.zIndex = "9999";
    dashboardIframe.style.position = "absolute"; // Absolute positioning within the container
    dashboardIframe.style.border = "none";
    // style={{
    //     width: "350px",
    //     height: "200px",
    //     borderRadius: "20px",
    dashboardIframe.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    dashboardIframe.style.width = "350px";
    dashboardIframe.style.height = "200px";
    dashboardIframe.style.borderRadius = "20px";
    dashboardIframe.style.backgroundColor = "red"; // For visibility

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

        // Position the iframe right below the action button inside iframeContainer
        dashboardIframe.style.top = `${
          actionButtonRect.bottom - containerRect.top + 10
        }px`; // 10px gap
        dashboardIframe.style.left = `${
          actionButtonRect.left - containerRect.left
        }px`; // Align horizontally

        // Append iframe to the iframeContainer
        iframeContainer.appendChild(dashboardIframe);
      }
    }
  }
});
