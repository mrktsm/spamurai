function injectModal() {
  if (document.querySelector("#oauth-modal")) return;

  const dialog = document.createElement("dialog");
  dialog.style.width = "384px";
  dialog.style.height = "384px";
  dialog.id = "oauth-modal";
  dialog.style.padding = "0";
  dialog.style.position = "fixed";
  dialog.style.zIndex = "9999";
  dialog.style.background = "transparent";
  dialog.style.border = "none";
  dialog.style.top = "0";
  dialog.style.left = "0";

  // Create the iframe
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
    injectModal();
    modalInjected = true;
    observer.disconnect(); // Stop observing after first injection
  }
});

modalObserver.observe(document.body, { childList: true, subtree: true });
