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
    button.addEventListener("click", async () => {
      const messageId = document
        .querySelector("[data-message-id]")
        ?.getAttribute("data-legacy-message-id");

      if (!messageId) {
        console.error("Message ID not found!");
        return;
      }

      console.log("Current Email Message ID:", messageId);

      // Your access token (make sure it's securely handled in real applications)
      const accessToken = "ACCESS_TOKEN";

      const testResponse = await fetch(
        "https://www.googleapis.com/gmail/v1/users/me/profile",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      const testData = await testResponse.json();
      console.log(testData); // If the request succeeds, the token is valid

      try {
        // Fetch the message details
        const response = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Error fetching message: ${response.status}`);
        }

        const messageData = await response.json();
        console.log("Message Data:", messageData);

        // Example: Display the message snippet
        console.log(`Message Snippet: ${messageData.snippet}`);

        let payload = messageData.payload;

        let messageBody = "";
        if (payload.parts) {
          payload.parts.forEach((part) => {
            if (part.mimeType === "text/plain") {
              messageBody = part.body.data
                ? decodeURIComponent(atob(part.body.data))
                : "";
            }
            if (part.mimeType === "text/html") {
              // You can also extract HTML content if needed
              console.log("HTML Body: ", part.body.data);
            }
          });
        } else if (payload.body.data) {
          // If there is no parts array, just retrieve the body directly
          messageBody = decodeURIComponent(atob(payload.body.data));
        }

        console.log("Full Message Body:", messageBody);

        // Send POST request using fetch
        fetch("http://127.0.0.1:8000/predict", {
          method: "POST", // Method type
          headers: {
            "Content-Type": "application/json", // Specifies that you're sending JSON
          },
          body: JSON.stringify({ text: messageBody }), // Convert the data object to JSON string
        })
          .then((response) => response.json()) // Parse the JSON response
          .then((result) => {
            console.log("Prediction:", result); // Handle the result
          })
          .catch((error) => {
            console.error("Error:", error); // Handle any error that occurred
          });
      } catch (error) {
        console.error("Failed to fetch the message:", error);
      }
    });

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
