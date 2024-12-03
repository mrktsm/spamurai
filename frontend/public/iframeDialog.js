function injectModal() {
  // Check if the dialog already exists to avoid duplication
  if (document.querySelector("#oauth-modal")) return;

  // Create the dialog
  const dialog = document.createElement("dialog");
  dialog.style.width = "384px";
  dialog.style.height = "384px";
  dialog.id = "oauth-modal";
  dialog.style.padding = "0";
  dialog.style.position = "fixed";
  dialog.style.zIndex = "9999"; // Ensure it stays on top
  dialog.style.background = "transparent"; // Make the dialog background transparent
  dialog.style.border = "none"; // Remove border
  dialog.style.top = "0"; // Ensure it is aligned to the top
  dialog.style.left = "0"; // Ensure it is aligned to the lef

  // Create the iframe
  const iframe = document.createElement("iframe");
  iframe.src = chrome.runtime.getURL("modal.html"); // URL to modal.html
  iframe.id = "custom-modal";
  iframe.style.width = "100%"; // Make iframe width 100% to fill the dialog
  iframe.style.height = "100%"; // Make iframe height 100% to fill the dialog
  iframe.style.border = "none"; // Ensure no border for the iframe
  iframe.style.display = "block"; // Ensure iframe is displayed as a block

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
    injectModal();
    modalInjected = true;
    observer.disconnect(); // Stop observing after first injection
  }
});

modalObserver.observe(document.body, { childList: true, subtree: true });
