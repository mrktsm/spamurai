window.addEventListener("message", (event) => {
  if (event.data?.type === "OPEN_DASHBOARD_DIALOG") {
    // Create iframe for dashboard
    const existingIframe = document.querySelector("#dashboard-iframe");
    if (existingIframe) {
      existingIframe.remove();
      return;
    }
    const dashboardIframe = document.createElement("iframe");
    dashboardIframe.src = chrome.runtime.getURL("dashboard.html");
    dashboardIframe.style.zIndex = "9999";
    dashboardIframe.style.position = "absolute";
    dashboardIframe.style.border = "none";
    dashboardIframe.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
    dashboardIframe.style.width = "450px";
    dashboardIframe.style.height = "300px";
    dashboardIframe.style.borderRadius = "16px";
    dashboardIframe.style.backgroundColor = "black";
    dashboardIframe.id = "dashboard-iframe";

    dashboardIframe.style.opacity = "0";
    dashboardIframe.style.transition = "opacity 0.25s ease";

    const actionButton = document.querySelector("#action-bar");
    if (actionButton) {
      const actionButtonRect = actionButton.getBoundingClientRect();

      // Find the container where you want to append the iframe (different div)
      const iframeContainer = document.querySelector(".aHU.hx");
      if (iframeContainer) {
        // Position the iframe
        iframeContainer.style.position = "relative";

        const containerRect = iframeContainer.getBoundingClientRect();

        dashboardIframe.style.top = `${
          actionButtonRect.bottom - containerRect.top + 10
        }px`;
        dashboardIframe.style.right = `${
          containerRect.right - actionButtonRect.right
        }px`;

        iframeContainer.appendChild(dashboardIframe);

        setTimeout(() => {
          dashboardIframe.style.opacity = "1"; // Fade in the iframe
        }, 10);

        dashboardIframe.onload = () => {
          dashboardIframe.contentWindow.postMessage(
            {
              type: "DASHBOARD_PREDICTION_DATA",
              payload: event.data.payload,
            },
            "*"
          );
        };

        const closeIframeOnClickOutside = (e) => {
          if (!dashboardIframe.contains(e.target)) {
            dashboardIframe.remove();
            document.removeEventListener("click", closeIframeOnClickOutside);
          }
        };

        setTimeout(() => {
          document.addEventListener("click", closeIframeOnClickOutside);
        }, 0);
      }
    }
  }
});
