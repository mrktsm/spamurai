import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

// Define prop types
interface ProgressCircleProps {
  percentage: number; // Percentage of the circle to fill (0-100)
  radius?: number; // Radius of the circle, default is 180
  strokeWidth?: number; // Thickness of the stroke, default is 40
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({
  percentage,
  radius = 180,
  strokeWidth = 40,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous SVG content

    const fullCircle = 2 * Math.PI; // Full circle in radians
    const innerRadius = radius - strokeWidth; // Inner radius
    const outerRadius = radius; // Outer radius

    // Define a type for arc data
    interface ArcData extends d3.DefaultArcObject {
      percentage: number;
    }

    // Create Arc Generators
    const arc = d3
      .arc<ArcData>()
      .startAngle(0)
      .endAngle((d) => (d.percentage / 100) * fullCircle)
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .cornerRadius(strokeWidth / 2);

    const backgroundArc = d3
      .arc<ArcData>()
      .startAngle(0)
      .endAngle(fullCircle)
      .innerRadius(innerRadius)
      .outerRadius(outerRadius);

    // Append Group to Center the Chart
    const group = svg
      .append("g")
      .attr("transform", `translate(${radius}, ${radius})`);

    // Background Arc
    group
      .append("path")
      .attr("d", backgroundArc({} as ArcData)!) // Force-cast for static background
      .attr("class", "opacity-20 fill-red-500");

    // Gradient Definition
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "gradient")
      .attr("x1", "0%")
      .attr("y1", "100%")
      .attr("x2", "50%")
      .attr("y2", "0%");

    gradient
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#fe08b5")
      .attr("stop-opacity", 1);

    gradient
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#ff1410")
      .attr("stop-opacity", 1);

    // Progress Arc
    group
      .append("path")
      .datum({ percentage }) // Bind data for dynamic progress
      .attr("d", (d) => arc(d as ArcData)!) // Use assertion and return value safely
      .attr("class", "fill-red-500")
      .style("fill", "url(#gradient)");
  }, [percentage, radius, strokeWidth]);

  return (
    <div className="flex items-center justify-center min-h-screen min-w-screen">
      <svg
        ref={svgRef}
        width={radius * 2}
        height={radius * 2}
        className="shadow-md"
      ></svg>
    </div>
  );
};

export default ProgressCircle;
