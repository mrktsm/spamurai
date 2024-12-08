import { useState, useEffect } from "react";
import ProgressCircle from "./ProgressCircle";

export default function ActionBar() {
  const [loaded, setLoaded] = useState<boolean>(false); // Initialize as false
  const [loadCircle, setLoadCircle] = useState<boolean>(true);

  const [percentage, setPercentage] = useState<number>(30); // Simulated percentage
  const [statusText, setStatusText] = useState<string>("Safe");
  const [statusColor, setStatusColor] = useState<string>("text-green-500");
  const [dynamicWidth, setDynamicWidth] = useState<number>(65); // Default width

  // Trigger the loading animation after a short delay (or you can set it based on some condition)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "TOGGLE_ANIMATION") {
        setLoaded((prev) => !prev);
        setLoadCircle((prev) => !prev);
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  useEffect(() => {
    if (percentage <= 35) {
      setStatusText("Safe");
      setStatusColor("text-green-500");
    } else if (percentage > 35 && percentage <= 80) {
      setStatusText("Suspicious");
      setStatusColor("text-yellow-500");
    } else {
      setStatusText("High Risk");
      setStatusColor("text-red-500 font-bold");
    }
  }, [percentage]);

  // Update the dynamic width based on the text length
  useEffect(() => {
    switch (statusText) {
      case "Safe":
        setDynamicWidth(65);
        break;
      case "Suspicious":
        setDynamicWidth(103);
        break;
      case "High Risk":
        setDynamicWidth(93);
        break;
      default:
        setDynamicWidth(30);
    }
  }, [statusText]);

  // Toggle the loaded state on click
  const handleClick = () => {
    if (loaded) {
      const newPercentage = Math.floor(Math.random() * 101); // Random value 0-100
      setPercentage(newPercentage);
    }
    setLoaded((prevLoaded) => !prevLoaded);

    // Send the updated dynamicWidth to the parent window
    const messageData = {
      type: "TOGGLE_ANIMATION",
      dynamicWidth: loaded ? 20 : dynamicWidth, // Toggle between full width and collapsed state
    };
    window.parent.postMessage(messageData, "*");

    setTimeout(() => {
      setLoadCircle((prevLoaded) => !prevLoaded);
    }, 100);
  };

  return (
    <div
      onClick={handleClick} // Toggle the state when clicked
      className="bg-green flex items-center justify-end cursor-pointer"
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
