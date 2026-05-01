import React from "react";

export const Footer = () => {
  const current_year = 2026;
  return (
    <footer className="h-14 bg-slate-100 border-t border-slate-200 px-8 flex items-center justify-between shrink-0">
      <p className="text-xs text-slate-500 font-medium">Conceptualized, Designed, and Created by <span className="text-slate-800">Frank Berrocal</span>, copyright {current_year}</p>
      <div className="flex items-center space-x-4">
        <span className="flex items-center text-[10px] font-bold text-green-600 bg-green-100 px-2 py-1 rounded">
          <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-2"></span>SYSTEM ONLINE
        </span>
        <span className="text-[10px] text-slate-400">v2.4.0-stable</span>
      </div>
    </footer>
  );
};
