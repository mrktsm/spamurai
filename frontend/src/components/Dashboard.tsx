import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import ProgressCircle from "./ProgressCircle";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div
      className="bg-zinc-900 flex items-center justify-center p-4 rounded-2xl shadow-lg"
      style={{
        width: "450px",
        height: "300px",
        fontFamily: "'Roboto', sans-serif", // Apply Roboto to everything
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="flex items-center space-x-4 w-full">
        {/* Progress Circle */}
        <div className="flex justify-center relative">
          <ProgressCircle
            percentage={90}
            isLoading={false}
            radius={70}
            strokeWidth={15}
          />
          {/* Number inside the progress circle with Comfortaa font */}
          <div
            className="absolute inset-0 flex items-center justify-center text-white text-3xl font-semibold"
            style={{ fontFamily: "'Comfortaa', sans-serif" }} // Comfortaa font for progress circle number
          >
            34%
          </div>
        </div>

        {/* Tabs Container */}
        <Tabs.Root
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          {/* iOS-like Tabs */}
          <Tabs.List
            className="bg-zinc-800 mb-1 rounded-full p-0.5 flex items-center justify-between" // Reduced padding
            aria-label="Dashboard Tabs"
          >
            <Tabs.Trigger
              value="overview"
              className={`
      flex-1 py-1 mx-0.5 rounded-full text-center transition-all duration-300  // Reduced margin
      ${
        activeTab === "overview"
          ? "bg-white text-black shadow-md"
          : "text-gray-400 hover:text-gray-200"
      }
    `}
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="stats"
              className={`
      flex-1 py-1 mx-0.5 rounded-full text-center transition-all duration-300  // Reduced margin
      ${
        activeTab === "stats"
          ? "bg-white text-black shadow-md"
          : "text-gray-400 hover:text-gray-200"
      }
    `}
            >
              Stats
            </Tabs.Trigger>
          </Tabs.List>

          {/* Tab Content */}
          <Tabs.Content
            value="overview"
            className="w-full bg-zinc-800 rounded-2xl p-4 mt-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white"
            >
              <h3 className="text-xl font-medium mb-3">Email Safety</h3>
              <div className="space-y-2">
                <div className="bg-zinc-700 rounded-xl p-3">
                  <div className="flex items-center mb-2">
                    <p className="text-gray-300 mr-2">Email Status:</p>
                    <span className="font-bold text-green-400">Safe</span>
                  </div>
                  <p className="text-gray-400">
                    This email was found to be safe because it passed all spam
                    checks and comes from a trusted sender.
                  </p>
                </div>
              </div>
            </motion.div>
          </Tabs.Content>

          <Tabs.Content
            value="stats"
            className="w-full bg-zinc-800 rounded-2xl p-4 mt-2"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white"
            >
              <h3 className="text-xl font-medium mb-3">Detailed Statistics</h3>
              <div className="space-y-2">
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Total Efficiency</span>
                  <span className="font-bold text-blue-400">89%</span>
                </div>
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Improvement Rate</span>
                  <span className="font-bold text-green-400">+45%</span>
                </div>
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Consistency</span>
                  <span className="font-bold text-yellow-400">67%</span>
                </div>
              </div>
            </motion.div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default Dashboard;
