import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

interface ProgressCircleProps {
  percentage: number; // Final percentage to display (0-100)
  radius?: number; // Radius of the circle, default is 180
  strokeWidth?: number; // Thickness of the stroke, default is 40
  isLoading?: boolean; // Flag to indicate loading state
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  radius = 180,
  strokeWidth = 40,
  isLoading = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous SVG content

    const fullCircle = 2 * Math.PI * (radius - strokeWidth / 2); // Circumference of the circle
    const center = radius;

    // Add the grey background circle (shadow circle)
    svg
      .append("circle")
      .attr("cx", center)
      .attr("cy", center)
      .attr("r", radius - strokeWidth / 2)
      .attr("stroke-width", strokeWidth)
      .attr("fill", "none")
      .attr("stroke", "#71717A"); // Light grey color for the background circle

    // Add animated circle for progress
    const animatedCircle = svg
      .append("circle")
      .attr("cx", center)
      .attr("cy", center)
      .attr("r", radius - strokeWidth / 2)
      .attr("stroke-width", strokeWidth)
      .attr("fill", "none")
      .attr("stroke-linecap", "round") // Circular edges
      .attr("stroke-dasharray", fullCircle)
      .attr("stroke-dashoffset", fullCircle) // Start completely invisible
      .attr(
        "transform",
        `rotate(-90, ${center}, ${center})` // Rotate the circle to start at the top
      );

    // Gradient Definition for the animated circle
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "50%")
      .attr("y2", "0%");

    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#fe08b5");
    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ff1410");

    animatedCircle.attr("stroke", "url(#gradient)");

    // Animation logic for spinner and progress
    if (isLoading) {
      // Spinner animation
      animatedCircle
        .style("opacity", 0) // Fade out for a smoother transition
        .transition()
        .duration(300) // Shorter fade-out duration to make it less jarring
        .style("opacity", 1) // Fade back in
        .attr("stroke-dashoffset", fullCircle) // Ensure full circle for spinner
        .style("animation", "spinner 2s linear infinite")
        .style("transform-origin", "center"); // Make sure transform origin stays at center
    } else {
      // Transition from spinner to progress
      animatedCircle
        .style("animation", "none") // Stop spinner animation
        .transition()
        .duration(1000)
        .attr("stroke-dashoffset", fullCircle * ((100 - percentage) / 100)) // Set progress
        .ease(d3.easeCubicOut); // Smooth easing for the transition
    }
  }, [percentage, isLoading, radius, strokeWidth]);

  return (
    <div className="flex items-center justify-center">
      <svg
        ref={svgRef}
        width={radius * 2}
        height={radius * 2}
        style={{ overflow: "visible" }}
      ></svg>
      <style>
        {`
          @keyframes spinner {
            from {
              stroke-dashoffset: ${2 * Math.PI * (radius - strokeWidth / 2)};
              transform: rotate(0deg);
            }
            to {
              stroke-dashoffset: -${2 * Math.PI * (radius - strokeWidth / 2)};
              transform: rotate(720deg);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ProgressCircle;
