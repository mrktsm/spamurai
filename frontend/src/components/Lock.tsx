import { useState, useEffect } from "react";

const Lock = ({ isLocked = false }) => {
  const [previousLocked, setPreviousLocked] = useState(isLocked);
  const [animation, setAnimation] = useState("");

  useEffect(() => {
    if (previousLocked !== isLocked) {
      const newAnim = isLocked
        ? "LinearShake ease-in-out 280ms, 360ms AngularShake ease-in-out 280ms"
        : "LinearShake ease-in-out 280ms";

      setAnimation("none");
      setTimeout(() => setAnimation(newAnim), 0);
      setPreviousLocked(isLocked);
    }
  }, [isLocked, previousLocked]);

  return (
    <div className="flex items-center justify-center gap-2">
      <svg
        className={`w-8 h-8 cursor-pointer ${isLocked ? "closed" : ""}`}
        viewBox="0 0 184 220.19"
        style={{
          transformOrigin: "center top",
          WebkitTapHighlightColor: "transparent",
          padding: "0.5rem",
          animation,
        }}
      >
        <defs>
          <clipPath id="clip-path">
            <rect
              className="fill-none"
              x="7.5"
              y="97.69"
              width="169"
              height="115"
              rx="18.5"
              ry="18.5"
            />
          </clipPath>
        </defs>
        <g style={{ clipPath: "url(#clip-path)" }}>
          <circle
            className="fill-rose-500 transition-all duration-300"
            cx="142.5"
            cy="97.69"
            r={isLocked ? "180" : "1.5"}
            style={{ transitionDelay: isLocked ? "270ms" : "0ms" }}
          />
        </g>
        <path
          className="stroke-rose-500 stroke-[12px] fill-none transition-all duration-300 stroke-round"
          d={
            isLocked
              ? "M41.5,93.69V56.93A49.24,49.24,0,0,1,90.73,7.69h2.54A49.24,49.24,0,0,1,142.5,56.93v33"
              : "M41.5,93.69V56.93A49.24,49.24,0,0,1,90.73,7.69h2.54A49.24,49.24,0,0,1,142.5,56.93v2.26"
          }
          style={{ transitionDelay: isLocked ? "150ms" : "200ms" }}
        />
        <rect
          className="stroke-rose-500 stroke-[12px] fill-none"
          x="7.5"
          y="97.69"
          width="169"
          height="115"
          rx="18.5"
          ry="18.5"
        />
      </svg>
    </div>
  );
};

export default Lock;
