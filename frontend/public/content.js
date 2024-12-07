function addButtonNextToDate() {
  const dateElement = document.querySelector(".gH .g3");
  if (dateElement && !document.querySelector("#action-bar")) {
    const wrapper = document.createElement("div");
    wrapper.className = "action-bar-wrapper";
    wrapper.style.cssText = `
      margin-right: 10px;
      padding: 0;
      background-color: #000000;
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

    wrapper.appendChild(iframe);
    dateElement.parentNode.insertBefore(wrapper, dateElement);
  }
}

// Message listener
window.addEventListener("message", (event) => {
  if (event.data?.type === "TOGGLE_ANIMATION") {
    const wrapper = document.querySelector(".action-bar-wrapper");
    if (wrapper) {
      wrapper.style.width = wrapper.style.width === "65px" ? "20px" : "65px";
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

// if (dateElement && !document.querySelector("#custom-button")) {
//   const button = document.createElement("button");
//   button.textContent = "Custom Button";
//   button.id = "custom-button"; // Unique ID to ensure it only adds once
//   button.style.marginRight = "10px";
//   button.style.padding = "3px 6px";
//   button.style.backgroundColor = "#4CAF50";
//   button.style.color = "white";
//   button.style.border = "none";
//   button.style.borderRadius = "4px";
//   button.style.cursor = "pointer";
//   button.addEventListener("click", async () => {
//     const messageId = document
//       .querySelector("[data-message-id]")
//       ?.getAttribute("data-legacy-message-id");

//     if (!messageId) {
//       console.error("Message ID not found!");
//       return;
//     }

//     console.log("Current Email Message ID:", messageId);

//     // Send a message to the background script to get the auth token
//     // Send a message to the background script to get the auth token
//     chrome.runtime.sendMessage({ action: "getAuthToken" }, async (token) => {
//       if (!token) {
//         console.error("Failed to get the token from background script.");
//         return;
//       }

//       const testResponse = await fetch(
//         "https://www.googleapis.com/gmail/v1/users/me/profile",
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );

//       const testData = await testResponse.json();
//       console.log(testData); // If the request succeeds, the token is valid

//       try {
//         // Fetch the message details
//         const response = await fetch(
//           `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}`,
//           {
//             method: "GET",
//             headers: {
//               Authorization: `Bearer ${token}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         if (!response.ok) {
//           throw new Error(`Error fetching message: ${response.status}`);
//         }

//         const messageData = await response.json();
//         console.log("Message Data:", messageData);

//         // Example: Display the message snippet
//         console.log(`Message Snippet: ${messageData.snippet}`);

//         let payload = messageData.payload;
//         let messageBody = "";

//         if (payload.parts) {
//           payload.parts.forEach((part) => {
//             if (part.mimeType === "text/plain") {
//               messageBody = part.body.data
//                 ? decodeURIComponent(atob(part.body.data))
//                 : "";
//             }
//             if (part.mimeType === "text/html") {
//               console.log("HTML Body: ", part.body.data);
//             }
//           });
//         } else if (payload.body.data) {
//           messageBody = decodeURIComponent(atob(payload.body.data));
//         }

//         console.log("Full Message Body:", messageBody);

//         // Send POST request using fetch
//         fetch("http://127.0.0.1:8000/predict", {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ text: messageBody }),
//         })
//           .then((response) => response.json())
//           .then((result) => {
//             console.log("Prediction:", result);
//           })
//           .catch((error) => {
//             console.error("Error:", error);
//           });
//       } catch (error) {
//         console.error("Failed to fetch the message:", error);
//       }
//     });
//   });

//   dateElement.parentNode.insertBefore(button, dateElement);
// }
