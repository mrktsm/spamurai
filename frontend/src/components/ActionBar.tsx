import { useState, useEffect } from "react";
import ProgressCircle from "./ProgressCircle";

export default function ActionBar() {
  const [loaded, setLoaded] = useState<boolean>(false); // Initialize as false
  const [loadCircle, setLoadCircle] = useState<boolean>(true);

  const [percentage, setPercentage] = useState<number>(30); // Simulated percentage
  const [statusText, setStatusText] = useState<string>("Safe");
  const [statusColor, setStatusColor] = useState<string>("text-green-500");
  const [dynamicWidth, setDynamicWidth] = useState<number>(20); // Default width

  const [predictionReceived, setPredictionReceived] = useState<boolean>(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PREDICTION_RESULT") {
        const { prediction } = event.data.payload;
        const newPercentage = prediction * 100;

        setPredictionReceived(true);

        setLoaded(true);
        setLoadCircle(false);

        // Set the new percentage
        setPercentage(newPercentage);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  // Update statusText, statusColor, and dynamicWidth based on the percentage
  useEffect(() => {
    if (!predictionReceived) return;

    let newStatusText = "Safe";
    let newStatusColor = "text-green-500";
    let newDynamicWidth = 65;

    if (percentage <= 35) {
      newStatusText = "Safe";
      newStatusColor = "text-green-500";
      newDynamicWidth = 65;
    } else if (percentage > 35 && percentage <= 80) {
      newStatusText = "Suspicious";
      newStatusColor = "text-yellow-500";
      newDynamicWidth = 103;
    } else {
      newStatusText = "High Risk";
      newStatusColor = "text-red-500 font-bold";
      newDynamicWidth = 93;
    }

    // Update the state values
    setStatusText(newStatusText);
    setStatusColor(newStatusColor);
    setDynamicWidth(newDynamicWidth);

    // Send updated dynamicWidth to parent
    window.parent.postMessage(
      {
        type: "TOGGLE_ANIMATION",
        dynamicWidth: newDynamicWidth,
      },
      "*"
    );
  }, [percentage]); // Dependency on percentage to update dynamicWidth and status

  const handleClick = () => {
    // Send message to content script to open dashboard dialog
    window.parent.postMessage(
      {
        type: "OPEN_DASHBOARD_DIALOG",
        payload: {
          prediction: percentage,
          status: statusText,
        },
      },
      "*"
    );
  };

  return (
    <div
      onClick={handleClick} // Toggle the state when clicked
      className="bg-zinc-700 flex items-center justify-end cursor-pointer"
      style={{
        width: loaded ? `${dynamicWidth}px` : "20px", // Dynamic width based on the text length
        height: "20px",
        borderRadius: "20px",
        padding: "0px",
        border: "1px solid grey",
        transition: "width 0.5s ease", // Smooth width transition
      }}
    >
      {/* Conditionally render the "Safe" text if loaded */}
      {loaded && (
        <div
          className={`font-medium ${statusColor} flex items-center justify-center pr-2`}
        >
          {statusText}
        </div>
      )}
      <div style={{ marginRight: "1px" }}>
        <ProgressCircle
          percentage={percentage}
          radius={8}
          strokeWidth={3}
          isLoading={loadCircle} // Pass `loadCircle` as a boolean
        />
      </div>
    </div>
  );
}
