import { useState } from "react";

export default function TabsOne() {
  const [activeTab, setActiveTab] = useState("ideas");

  const tabs = [
    { id: "ideas", label: "Ideas" },
    { id: "feed", label: "Feed" },
    { id: "live", label: "Live Trades" },
  ];

  return (
    <div className="w-full max-w-3xl relative z-10">
      {/* Tabs Header */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                relative px-4 py-2 text-sm font-medium
                transition-colors duration-200
                ${
                  isActive
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }
              `}
            >
              {tab.label}

              {/* Active underline */}
              {isActive && (
                <span className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-600 dark:bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tabs Content */}
      <div className="mt-4 text-gray-700 dark:text-gray-300 p-4">
        {activeTab === "ideas" && <div>Ideas content goes here.</div>}
        {activeTab === "feed" && <div>Feed content goes here.</div>}
        {activeTab === "live" && <div>Live trades content goes here.</div>}
      </div>
    </div>
  );
}
