import ProgressCircle from "./ProgressCricle";

export default function ActionBar() {
  return (
    <div
      style={{
        width: "65px", // Match iframe width
        height: "20px", // Match iframe height
        borderRadius: "20px", // Rounded corners
        padding: "0px",
      }}
      className="bg-blue-300 text-blue-600 items-center cursor-pointer"
    >
      <div>
        {" "}
        <ProgressCircle percentage={30} radius={8} strokeWidth={2} />
      </div>
    </div>
  );
}
