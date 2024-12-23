import { useEffect, useState } from "react";
import classNames from "classnames";

interface SwitchProps {
  isOn: boolean;
  handleToggle: () => void;
}

export default function Switch({ isOn, handleToggle }: SwitchProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    // Set a delay before enabling animation to avoid initial load animation
    const timeoutId = setTimeout(() => setShouldAnimate(true), 100); // delay by 100ms to avoid animation on load

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount
  }, []);

  return (
    <div
      onClick={handleToggle}
      className={classNames(
        "flex w-10 h-4 rounded-full transition-all duration-300 shadow-lg cursor-pointer items-center select-none",
        {
          "bg-rose-300": !isOn, // Color from the first version for 'on' state
          "bg-rose-500": isOn,
        }
      )}
    >
      <span
        className={classNames(
          "h-3 w-3 bg-white rounded-full transform ml-1", // Adjusted size and common styles
          {
            "translate-x-5": isOn, // Handle position for 'on' state
            "transition-all duration-300": shouldAnimate, // Enable transition after initial load
          }
        )}
      />
      <span
        className={classNames(
          "absolute text-[8px] font-medium text-white transition-opacity duration-300 ml-[18px]", // Style for text
          {
            "opacity-0": isOn, // Hide "Off" text when "On"
            "opacity-100": !isOn, // Show "Off" text when "Off"
          }
        )}
      >
        OFF
      </span>
      <span
        className={classNames(
          "absolute text-[8px] font-medium text-white transition-opacity duration-300 ml-[6px] user-select-none", // Style for text
          {
            "opacity-100": isOn, // Show "On" text when "On"
            "opacity-0": !isOn, // Hide "On" text when "Off"
          }
        )}
      >
        ON
      </span>
    </div>
  );
}
