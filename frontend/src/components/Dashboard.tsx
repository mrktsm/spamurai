import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import ProgressCircle from "./ProgressCircle";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data for spam emails over last 7 days
  const spamData = [
    { day: "Mon", spamCount: 3 },
    { day: "Tue", spamCount: 7 },
    { day: "Wed", spamCount: 5 },
    { day: "Thu", spamCount: 2 },
    { day: "Fri", spamCount: 9 },
    { day: "Sat", spamCount: 4 },
    { day: "Sun", spamCount: 6 },
  ];

  return (
    <div
      className="bg-gradient-to-b from-zinc-900 to-gray-800 flex items-center justify-center p-4 rounded-2xl shadow-lg"
      style={{
        width: "450px",
        height: "300px",
        fontFamily: "'Roboto', sans-serif",
        border: "2px solid grey",
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
          <div
            className="absolute inset-0 flex items-center justify-center text-white text-3xl font-semibold"
            style={{ fontFamily: "'Comfortaa', sans-serif" }}
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
            className="bg-zinc-800 mb-1 rounded-full p-0.5 flex items-center justify-between"
            aria-label="Dashboard Tabs"
          >
            <Tabs.Trigger
              value="overview"
              className={`
                flex-1 py-1 mx-0.5 rounded-full text-center transition-all duration-300 border-none
                focus:outline-none
                ${
                  activeTab === "overview"
                    ? "bg-zinc-600 text-gray-200 shadow-md"
                    : "text-gray-400 hover:text-gray-200"
                }
              `}
            >
              Overview
            </Tabs.Trigger>
            <Tabs.Trigger
              value="stats"
              className={`
                flex-1 py-1 mx-0.5 rounded-full text-center transition-all duration-300
                focus:outline-none border-none
                ${
                  activeTab === "stats"
                    ? "bg-zinc-600 text-gray-200 shadow-md"
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-medium">Email Safety</h3>
                <span className="font-bold text-green-400 text-lg">Safe</span>
              </div>
              <div className="space-y-2">
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Spam Check</span>
                  <span className="font-bold text-green-400"> Passed </span>
                </div>
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Sender Trust</span>
                  <span className="font-bold text-blue-400">Trusted</span>
                </div>
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Malicious content</span>
                  <span className="font-bold text-green-400">None</span>
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
              className="text-white h-full"
            >
              <h3 className="text-xl font-medium mb-3">Spam Email Trends</h3>
              <div className="w-full h-24">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={spamData}
                    margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="day"
                      tick={{ fill: "white" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Bar
                      dataKey="spamCount"
                      fill="#60a5fa"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default Dashboard;
