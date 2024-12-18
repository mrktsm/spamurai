const data = {
  text: "you have won a 50 dollar amazon gift card",
};

// Send POST request using fetch
fetch("http://127.0.0.1:8000/predict", {
  method: "POST", 
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data), 
})
  .then((response) => response.json()) 
  .then((result) => {
    console.log("Prediction:", result); 
  })
  .catch((error) => {
    console.error("Error:", error);
  });
