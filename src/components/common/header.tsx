import React from "react";

export const Header = () => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-[#2C3E50] rounded-lg flex items-center justify-center">
          <span className="text-white font-serif text-xl">∑</span>
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#2C3E50]">
            MathClavier <span className="font-light text-slate-400 mx-1">|</span> <span className="text-sm font-medium">par Frank Berrocal</span>
          </h1>
        </div>
      </div>
      <nav className="flex items-center space-x-8 text-sm font-semibold text-slate-600">
        <a href="/" className="hover:text-blue-600 transition-colors">Composer</a>
        <a href="#disclaimer" className="text-red-500 hover:text-red-600 transition-colors">Disclaimer</a>
      </nav>
    </header>
  );
};
