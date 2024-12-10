function addButtonNextToDate() {
  const dateElement = document.querySelector(".gH .g3");

  if (dateElement && !document.querySelector("#action-bar")) {
    const wrapper = document.createElement("div");
    wrapper.className = "action-bar-wrapper";
    wrapper.style.cssText = `
          margin-right: 10px;
          padding: 0;
          background-color: #374151;
          border: none;
          border-radius: 20px;
          cursor: pointer;
          width: 20px;
          height: 20px;
          transition: width 0.5s ease;
          overflow: hidden;
        `;

    const iframe = document.createElement("iframe");
    iframe.src = chrome.runtime.getURL("actionBar.html");
    iframe.id = "action-bar";
    iframe.style.border = "none";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.transition = "width 0.5s ease 0s";
    iframe.style.backgroundColor = "#374151";

    wrapper.appendChild(iframe);
    dateElement.parentNode.insertBefore(wrapper, dateElement);

    getMessageBody();
  }
}

// Message listener
window.addEventListener("message", (event) => {
  if (event.data?.type === "TOGGLE_ANIMATION") {
    const wrapper = document.querySelector(".action-bar-wrapper");
    if (wrapper && event.data?.dynamicWidth) {
      wrapper.style.width = `${event.data.dynamicWidth}px`; // Adjust to incoming dynamicWidth
    }
  }
});

// MutationObserver setup remains the same
const observer = new MutationObserver((mutationsList) => {
  for (const mutation of mutationsList) {
    if (mutation.type === "childList") {
      addButtonNextToDate();
    }
  }
});

const config = { childList: true, subtree: true };
observer.observe(document.body, config);

function getMessageBody() {
  const messageId = document
    .querySelector("[data-message-id]")
    ?.getAttribute("data-legacy-message-id");

  if (!messageId) {
    console.error("Message ID not found!");
    return;
  }

  console.log("Current Email Message ID:", messageId);

  // Send a message to the background script to get the auth token
  // Send a message to the background script to get the auth token
  chrome.runtime.sendMessage({ action: "getAuthToken" }, async (token) => {
    if (!token) {
      console.error("Failed to get the token from background script.");
      return;
    }

    const testResponse = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/profile",
      {
        headers: {
          Authorization: `Bearer ${token}`,
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
            Authorization: `Bearer ${token}`,
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
      function extractTextFromHTML(htmlContent) {
        try {
          // Create a temporary div to parse HTML
          const tempDiv = document.createElement("div");
          tempDiv.innerHTML = htmlContent;

          // Extract text content, removing extra whitespace
          return tempDiv.textContent
            .replace(/\s+/g, " ") // Replace multiple whitespaces with single space
            .trim(); // Remove leading/trailing whitespace
        } catch (error) {
          console.error("Error extracting text from HTML:", error);
          return htmlContent; // Fallback to original content
        }
      }

      function cleanEmailContent(content) {
        try {
          // Remove CSS, style blocks, and HTML tags
          const strippedContent = content
            .replace(/<style[^>]*>.*?<\/style>/gi, "") // Remove style tags
            .replace(/<\/?[^>]+(>|$)/g, "") // Remove HTML tags
            .replace(/&nbsp;/g, " ") // Replace non-breaking spaces
            .replace(/\s+/g, " ") // Collapse multiple whitespaces
            .replace(/^[\s\n]+|[\s\n]+$/g, "") // Trim leading/trailing whitespace
            .trim();

          return strippedContent;
        } catch (error) {
          console.error("Error cleaning email content:", error);
          return content;
        }
      }

      // Use this in your existing decoding logic
      let messageBody = "";

      if (payload.parts) {
        for (const part of payload.parts) {
          if (part.mimeType === "text/plain" || part.mimeType === "text/html") {
            if (part.body && part.body.data) {
              const decodedContent = safeBase64Decode(part.body.data);

              // Clean the content if it's HTML
              messageBody =
                part.mimeType === "text/html"
                  ? cleanEmailContent(decodedContent)
                  : decodedContent;

              if (messageBody) break;
            }
          }
        }
      } else if (payload.body && payload.body.data) {
        const decodedContent = safeBase64Decode(payload.body.data);

        // Clean HTML content
        messageBody = cleanEmailContent(decodedContent);
      }

      // Ensure non-null message body
      messageBody = messageBody || "";

      console.log("Final Processed Message Body:", messageBody);

      // Send POST request using fetch
      fetch("http://127.0.0.1:8000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: messageBody }),
      })
        .then((response) => response.json())
        .then((result) => {
          console.log("Prediction:", result);

          const iframe = document.querySelector("#action-bar");
          if (iframe) {
            iframe.contentWindow.postMessage(
              { type: "PREDICTION_RESULT", payload: result },
              "*"
            );
          }
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } catch (error) {
      console.error("Failed to fetch the message:", error);
    }
  });
}

function safeBase64Decode(encodedData) {
  if (!encodedData) {
    console.warn("No encoded data provided");
    return "";
  }

  // Debugging step
  debugBase64Decoding(encodedData);

  try {
    // Remove whitespace and newlines
    const cleanData = encodedData
      .replace(/\s/g, "") // Remove all whitespace
      .replace(/-/g, "+") // Replace URL-safe characters
      .replace(/_/g, "/"); // Replace URL-safe characters

    // Add padding if needed
    const paddedData = cleanData.padEnd(
      cleanData.length + ((4 - (cleanData.length % 4)) % 4),
      "="
    );

    console.log("Cleaned and Padded Data:", paddedData);

    // Attempt decoding
    const decoded = atob(paddedData);
    return decodeURIComponent(escape(decoded));
  } catch (error) {
    console.error("Decoding Error Details:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });
    return "";
  }
}

function debugBase64Decoding(encodedData) {
  console.log("Raw Encoded Data:", encodedData);
  console.log("Data Length:", encodedData.length);
  console.log("Data First 50 chars:", encodedData.slice(0, 50));

  // Check for common encoding issues
  if (encodedData.includes(" ")) {
    console.warn("Encoded data contains whitespace");
  }
  if (encodedData.includes("\n")) {
    console.warn("Encoded data contains newline");
  }
}
