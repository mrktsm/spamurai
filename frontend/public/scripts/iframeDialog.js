function injectModal() {
  if (document.querySelector("#oauth-modal")) return;
  const dialog = document.createElement("dialog");
  dialog.style.width = "576px";
  dialog.style.height = "492.5px";
  dialog.style.borderRadius = "16px";
  dialog.id = "oauth-modal";
  dialog.style.padding = "0";
  dialog.style.position = "fixed";
  dialog.style.zIndex = "9999";
  dialog.style.background = "transparent";
  dialog.style.border = "none";
  dialog.style.top = "0";
  dialog.style.left = "0";

  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("modal.html");
  iframe.id = "custom-modal";
  iframe.style.width = "100%";
  iframe.style.height = "100%";
  iframe.style.border = "none";
  iframe.style.display = "block";

  const handleDialogClick = (event) => {
    if (event.target === dialog) {
      dialog.close();
      dialog.removeEventListener("click", handleDialogClick);
      document.body.removeChild(dialog);
    }
  };

  dialog.addEventListener("click", handleDialogClick);

  dialog.appendChild(iframe);
  document.body.appendChild(dialog);
  dialog.showModal();
}

let modalInjected = false;

const modalObserver = new MutationObserver((mutationsList, observer) => {
  if (!modalInjected) {
    chrome.storage.local.get("isAuthenticated", (result) => {
      if (result.isAuthenticated !== "true") {
        injectModal();
        modalInjected = true;
        observer.disconnect(); // Stop observing after the first injection
      }
    });
  }
});

modalObserver.observe(document.body, { childList: true, subtree: true });

// Listen for messages to close the modal
window.addEventListener("message", (event) => {
  // Verify the message comes from the expected origin
  if (event.data.action === "closeModal") {
    const modal = document.querySelector("#oauth-modal");
    if (modal) {
      modal.close();
      modal.remove();
    }
  }
});
