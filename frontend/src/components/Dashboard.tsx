import ProgressCircle from "./ProgressCircle";

const Dashboard = () => {
  return (
    <div
      className="bg-zinc-700 flex items-center p-1"
      style={{
        width: "350px",
        height: "200px",
        borderRadius: "20px",
        border: "1px solid grey",
        transition: "width 0.5s ease",
        fontFamily: "'Comfortaa', sans-serif", // Apply Comfortaa font here
      }}
    >
      {/* Progress Circle */}
      <div className="flex justify-start relative">
        <ProgressCircle
          percentage={90}
          isLoading={false}
          radius={60}
          strokeWidth={15}
        />
        {/* Number inside the progress circle */}
        <div className="absolute inset-0 flex items-center justify-center text-white text-2xl font-medium">
          34%
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
