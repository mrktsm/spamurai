import ProgressCircle from "./ProgressCricle";

export default function ActionBar() {
  return (
    <div
      style={{
        width: "65px", // Match iframe width
        height: "20px", // Match iframe height
        borderRadius: "20px", // Rounded corners
        padding: "0px",
        border: "1px solid grey",
      }}
      className="bg-black text-blue-600 items-center cursor-pointer flex justify-end"
    >
      <div style={{ marginRight: "2px" }}>
        {" "}
        <ProgressCircle percentage={30} radius={8} strokeWidth={3} />
      </div>
    </div>
  );
}
