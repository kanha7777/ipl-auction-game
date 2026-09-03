import React from "react";
import { Gavel, ShieldCheck, Users2, HelpCircle } from "lucide-react";

export type TabType = "auction" | "squad" | "teams" | "info";

interface BottomNavProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  squadCount: number;
  teamsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  squadCount,
  teamsCount,
}) => {
  const tabs = [
    {
      id: "auction" as TabType,
      label: "Auction",
      icon: Gavel,
      badge: null,
    },
    {
      id: "squad" as TabType,
      label: "My Squad",
      icon: ShieldCheck,
      badge: squadCount > 0 ? squadCount : null,
    },
    {
      id: "teams" as TabType,
      label: "Teams",
      icon: Users2,
      badge: teamsCount > 0 ? teamsCount : null,
    },
    {
      id: "info" as TabType,
      label: "Info & Rules",
      icon: HelpCircle,
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#0E1A2B]/95 backdrop-blur-lg border-t border-[#1E304F] py-1 px-2 safe-area-inset-bottom">
      <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative active:scale-95 ${
                isActive
                  ? "text-ipl-yellow font-bold bg-[#131F33] border border-ipl-yellow/30 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "text-ipl-yellow animate-bounce-short" : ""}`} />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 bg-ipl-blue text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-[#1E304F]">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight font-medium leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
