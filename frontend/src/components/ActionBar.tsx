import { useState, useEffect } from "react";
import ProgressCircle from "./ProgressCricle";

export default function ActionBar() {
  const [loaded, setLoaded] = useState<boolean>(false); // Initialize as false
  const [loadCircle, setLoadCircle] = useState<boolean>(true);

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

  // Toggle the loaded state on click
  const handleClick = () => {
    window.parent.postMessage({ type: "TOGGLE_ANIMATION" }, "*");
    // React state toggles, but the parent element's size will also toggle based on the message.
    setLoaded((prevLoaded) => !prevLoaded);
    setTimeout(() => {
      setLoadCircle((prevLoaded) => !prevLoaded);
    }, 100);
  };

  return (
    <div
      onClick={handleClick} // Toggle the state when clicked
      style={{
        width: loaded ? "65px" : "20px", // Transition from 20px to 65px
        height: "20px",
        borderRadius: "20px",
        padding: "0px",
        border: "1px solid grey",
        transition: "width 0.5s ease", // Smooth width transition
      }}
      className="bg-black text-blue-600 items-center cursor-pointer flex justify-end"
    >
      <div style={{ marginRight: "1px" }}>
        <ProgressCircle
          percentage={30}
          radius={8}
          strokeWidth={3}
          isLoading={loadCircle} // Pass `loadCircle` as a boolean
        />
      </div>
    </div>
  );
}
