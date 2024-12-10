window.addEventListener("message", (event) => {
  if (event.data?.type === "OPEN_DASHBOARD_DIALOG") {
    // Create iframe for dashboard
    const dashboardIframe = document.createElement("iframe");
    // dashboardIframe.src = chrome.runtime.getURL("index.html");
    dashboardIframe.style.position = "fixed";
    dashboardIframe.style.zIndex = "1000";
    dashboardIframe.style.border = "none";
    dashboardIframe.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
    dashboardIframe.style.width = "300px";
    dashboardIframe.style.height = "400px";
    dashboardIframe.style.backgroundColor = "red";

    // Find the ActionBar element
    const actionBar = document.querySelector("#action-bar");
    if (actionBar) {
      const actionBarRect = actionBar.getBoundingClientRect(); // Get position of ActionBar
      dashboardIframe.style.top = `${
        actionBarRect.bottom + window.scrollY + 10
      }px`; // Position below ActionBar
      dashboardIframe.style.left = `${actionBarRect.left + window.scrollX}px`; // Align horizontally with ActionBar
    }

    // Optional: Add close button or click-outside-to-close functionality
    document.body.appendChild(dashboardIframe);
  }
});
