import { useEffect, useState } from "react";
import classNames from "classnames";

interface SwitchProps {
  isOn: boolean;
  handleToggle: () => void;
}

export default function Switch({ isOn, handleToggle }: SwitchProps) {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => setShouldAnimate(true), 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div
      onClick={handleToggle}
      className={classNames(
        "flex w-10 h-4 rounded-full transition-all duration-300 shadow-lg cursor-pointer items-center select-none",
        {
          "bg-rose-300": !isOn,
          "bg-rose-500": isOn,
        }
      )}
    >
      <span
        className={classNames("h-3 w-3 bg-white rounded-full transform ml-1", {
          "translate-x-5": isOn,
          "transition-all duration-300": shouldAnimate,
        })}
      />
      <span
        className={classNames(
          "absolute text-[8px] font-medium text-white transition-opacity duration-300 ml-[18px]",
          {
            "opacity-0": isOn,
            "opacity-100": !isOn,
          }
        )}
      >
        OFF
      </span>
      <span
        className={classNames(
          "absolute text-[8px] font-medium text-white transition-opacity duration-300 ml-[6px] user-select-none",
          {
            "opacity-100": isOn,
            "opacity-0": !isOn,
          }
        )}
      >
        ON
      </span>
    </div>
  );
}
