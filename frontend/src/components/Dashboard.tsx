import { useEffect, useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, ResponsiveContainer } from "recharts";
import ProgressCircle from "./ProgressCircle";

type PredictionData = {
  spam_score: number;
  spam_label: string;
  text_length: number;
  attachments: boolean;
  links: boolean;
  spf_valid: boolean;
  dkim_valid: boolean;
  sender_domain: string;
  is_personal_email: boolean;
  malicious_content: string;
  user_id: string;
};

type SpamStats = {
  day: string;
  spamCount: number;
  date: string;
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [predictionData, setPredictionData] = useState<PredictionData | null>(
    null
  );
  const [spamStats, setSpamStats] = useState<SpamStats[]>([]);
  const [improvementRate, setImprovementRate] = useState("");
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "DASHBOARD_PREDICTION_DATA") {
        setPredictionData(event.data.payload);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (predictionData !== null) {
      fetchSpamStats();
    }
  }, [predictionData]);

  // Fetch spamStats and fill in the missing dates
  const fetchSpamStats = async () => {
    try {
      const response = await fetch(
        `https://spamurai.online/api/spam-stats/last-week?user=${predictionData?.user_id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Invalid data format received from server");
      }

      const today = new Date();
      today.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

      // Create array of last 7 days
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        return {
          date: date.toISOString().split("T")[0],
          spamCount: 0,
        };
      });

      // Create a map of existing data
      const dataMap = new Map(data.map((stat) => [stat.date, stat.spam_count]));

      // Fill in the data where it exists
      const transformedData = last7Days.map((day) => ({
        day: new Date(`${day.date}T12:00:00`).toLocaleDateString("en-US", {
          weekday: "short",
        }),
        spamCount: dataMap.get(day.date) || 0,
        date: day.date,
      }));

      setSpamStats(transformedData);
    } catch (error) {
      console.error("Failed to fetch spam statistics:", error);
      // Generate fallback data starting from today
      const today = new Date();
      today.setHours(12, 0, 0, 0);

      const fallbackData = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - (6 - i));
        return {
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          spamCount: 0,
          date: date.toISOString().split("T")[0],
        };
      });

      setSpamStats(fallbackData);
    }
  };

  useEffect(() => {
    const updateImprovementRate = async () => {
      if (predictionData?.user_id) {
        try {
          const improvementData = await fetchImprovementRate(
            predictionData.user_id
          );
          if (
            improvementData &&
            improvementData.improvement_rate !== undefined
          ) {
            const rateStr = improvementData.improvement_rate.toFixed(2);
            const cleanRate = rateStr.replace(/\.?0+$/, "");
            setImprovementRate(`${cleanRate}`);
          } else {
            setImprovementRate("No data available");
          }
        } catch (error) {
          console.error("Error updating improvement rate:", error);
          setImprovementRate("Error fetching data");
        }
      }
    };

    updateImprovementRate();
  }, [predictionData]);

  const fetchImprovementRate = async (userId: string) => {
    try {
      const response = await fetch(
        `https://spamurai.online/api/spam-stats/improvement-rate?user=${userId}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching improvement rate:", error);
      throw error;
    }
  };

  // const spamData = [
  //   { day: "Mon", spamCount: 1 },
  //   { day: "Tue", spamCount: 1 },
  //   { day: "Wed", spamCount: 1 },
  //   { day: "Thu", spamCount: 2 },
  //   { day: "Fri", spamCount: 1 },
  //   { day: "Sat", spamCount: 1 },
  //   { day: "Sun", spamCount: 3 },
  // ];

  return (
    <div
      className="bg-gradient-to-b from-zinc-900 to-gray-800 flex items-center justify-center p-4 rounded-2xl shadow-lg"
      style={{
        width: "450px",
        height: "300px",
        fontFamily: "'Roboto', sans-serif",
        border: "1px solid grey",
      }}
    >
      <div className="flex items-center space-x-4 w-full justify-center">
        {/* Progress Circle */}
        <div className="flex justify-center relative">
          <ProgressCircle
            percentage={
              predictionData?.spam_score
                ? Math.round(predictionData.spam_score * 100)
                : 0
            }
            isLoading={false}
            radius={70}
            strokeWidth={15}
          />
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-white text-3xl font-semibold"
            style={{ fontFamily: "'Comfortaa', sans-serif" }}
          >
            <span className="mt-2">
              {predictionData?.spam_score
                ? Math.round(predictionData.spam_score * 100)
                : 0}
              %
            </span>
            <span style={{ fontSize: "10px", marginTop: "-8px" }}>
              AI Spam Score
            </span>
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
                <span
                  className={`font-medium ${
                    predictionData?.spam_label === "Safe"
                      ? "text-green-500"
                      : predictionData?.spam_label === "Suspicious"
                      ? "text-yellow-500"
                      : "text-red-500"
                  } text-lg`}
                >
                  {predictionData && predictionData.spam_label
                    ? predictionData.spam_label
                    : "Loading..."}
                </span>
              </div>
              <div className="space-y-2">
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Spam Check</span>
                  <span
                    className={`font-bold ${
                      predictionData
                        ? predictionData.spam_score < 0.2
                          ? "text-green-500"
                          : predictionData.spam_score < 0.8
                          ? "text-yellow-500"
                          : "text-red-500"
                        : "text-gray-400"
                    }`}
                  >
                    {predictionData
                      ? predictionData.spam_score < 0.2
                        ? "Clear"
                        : predictionData.spam_score < 0.8
                        ? "Warning"
                        : "Critical"
                      : "Loading..."}
                  </span>
                </div>
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Sender Trust</span>
                  <span
                    className={`font-bold ${
                      predictionData?.spf_valid && predictionData.dkim_valid
                        ? "text-blue-400"
                        : "text-yellow-500"
                    }`}
                  >
                    {predictionData?.spf_valid && predictionData.dkim_valid
                      ? "Trusted"
                      : "Not Verified"}
                  </span>
                </div>
                <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                  <span className="text-gray-300">Malicious content</span>
                  <span
                    className={`font-bold ${
                      predictionData?.malicious_content === "None"
                        ? "text-blue-400"
                        : "text-yellow-500"
                    }`}
                  >
                    {predictionData?.malicious_content}
                  </span>
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
              <h3 className="text-xl font-medium mb-3">Spam History</h3>
              <div className="w-full h-24 mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={spamStats}
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
              <div className="bg-zinc-700 rounded-xl p-3 flex justify-between items-center">
                <span className="text-gray-300"> Improvement Rate </span>
                <span
                  className={`font-bold ${
                    Number(improvementRate) >= 0
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {improvementRate}%
                </span>
              </div>
            </motion.div>
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default Dashboard;
