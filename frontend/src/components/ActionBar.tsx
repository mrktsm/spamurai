import { useState, useEffect } from "react";
import ProgressCircle from "./ProgressCircle";

export default function ActionBar() {
  const [loaded, setLoaded] = useState<boolean>(false); // Initialize as false
  const [loadCircle, setLoadCircle] = useState<boolean>(true);

  const [percentage, setPercentage] = useState<number>(30); // Simulated percentage
  const [statusText, setStatusText] = useState<string>("Safe");
  const [statusColor, setStatusColor] = useState<string>("text-green-500");
  const [dynamicWidth, setDynamicWidth] = useState<number>(20); // Default width
  // Store the entire payload
  const [payload, setPayload] = useState<any>(null);

  const [predictionReceived, setPredictionReceived] = useState<boolean>(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "PREDICTION_RESULT") {
        const { spam_score, spam_label } = event.data.payload;
        const newPercentage = spam_score * 100;
        setPayload(event.data.payload);

        setPredictionReceived(true);

        setLoaded(true);
        setLoadCircle(false);

        let newStatusText = spam_label || "Safe"; // Default to "Safe" if no label is provided
        let newStatusColor = "text-green-500"; // Default color

        // Change color based on spam_label
        if (newStatusText === "Suspicious") {
          newStatusColor = "text-yellow-500";
        } else if (newStatusText === "High Risk") {
          newStatusColor = "text-red-500 font-bold";
        }

        setStatusText(newStatusText);
        setStatusColor(newStatusColor);

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
    chrome.storage.local.get("isAuthenticated", (result) => {
      if (result.isAuthenticated !== "true") {
        // If not authenticated, set progress circle to 0 and stop loading
        setPercentage(0);
        setLoadCircle(false);
      }
    });
  }, []);

  useEffect(() => {
    if (!predictionReceived) return;

    // Check `popupEnabled` from local storage
    chrome.storage.local.get("popupEnabled", (result) => {
      if (result.popupEnabled !== false && statusText === "High Risk") {
        handleClick();
      }
    });
  }, [statusText, predictionReceived]);

  useEffect(() => {
    if (!predictionReceived) return;

    let newDynamicWidth = 65;

    if (statusText === "Suspicious") {
      newDynamicWidth = 103;
    } else if (statusText == "High Risk") {
      newDynamicWidth = 93;
    }

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
        payload: payload,
      },
      "*"
    );
  };

  return (
    <div
      onClick={handleClick} // Toggle the state when clicked
      className="bg-gradient-to-b from-zinc-900 to-gray-800 flex items-center justify-end cursor-pointer"
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
          style={{ whiteSpace: "nowrap" }}
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
