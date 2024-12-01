const data = {
  text: "you have won a 50 dollar amazon gift card",
};

// Send POST request using fetch
fetch("http://127.0.0.1:8000/predict", {
  method: "POST", // Method type
  headers: {
    "Content-Type": "application/json", // Specifies that you're sending JSON
  },
  body: JSON.stringify(data), // Convert the data object to JSON string
})
  .then((response) => response.json()) // Parse the JSON response
  .then((result) => {
    console.log("Prediction:", result); // Handle the result
  })
  .catch((error) => {
    console.error("Error:", error); // Handle any error that occurred
  });
