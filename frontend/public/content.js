// Function to add the button next to the date
function addButtonNextToDate() {
  const dateElement = document.querySelector(".gH .g3");

  if (dateElement && !document.querySelector("#custom-button")) {
    const button = document.createElement("button");
    button.textContent = "Custom Button";
    button.id = "custom-button"; // Unique ID to ensure it only adds once
    button.style.marginRight = "10px";
    button.style.padding = "3px 6px";
    button.style.backgroundColor = "#4CAF50";
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "4px";
    button.style.cursor = "pointer";

    dateElement.parentNode.insertBefore(button, dateElement);
  }
}

// MutationObserver to watch for changes in the DOM and add the button when needed
const observer = new MutationObserver((mutationsList, observer) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      addButtonNextToDate(); // Add button when new elements are added
    }
  }
});

// Configure the MutationObserver
const config = { childList: true, subtree: true };

// Start observing the body of the page (this will detect when the email is loaded)
observer.observe(document.body, config);
