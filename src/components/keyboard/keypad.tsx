import React, { useState } from "react";
import { MATH_SYMBOLS, MathSymbol } from "../../constants";

interface KeypadProps {
  on_symbol_click: (symbol: MathSymbol) => void;
}

export const Keypad = ({ on_symbol_click }: KeypadProps) => {
  const PREFERRED_ORDER: MathSymbol["category"][] = ["Algebra", "MicroEconomics", "Trigonometry", "Calculus", "Statistics", "Set Operations", "Greek", "Letters"];
  
  const categories = PREFERRED_ORDER.filter(cat => 
    MATH_SYMBOLS.some(s => s.category === cat) && cat !== "Numbers"
  );

  const [active_tab, set_active_tab] = useState<string>(categories[0] || "Algebra");

  const filtered_symbols = MATH_SYMBOLS.filter(s => s.category === active_tab);

  return (
    <div className="sleek-card flex-1 flex flex-col h-full">
      <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth">
        <div className="flex min-w-max px-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => set_active_tab(category)}
              className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border-b-2 ${
                active_tab === category 
                  ? "text-blue-600 border-blue-600 bg-white" 
                  : "text-slate-400 border-transparent hover:text-slate-600 hover:bg-slate-100/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-1 p-4 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 overflow-y-auto content-start">
        {filtered_symbols.map((symbol, index) => (
          <button
            key={`${symbol.label}-${index}`}
            onClick={() => on_symbol_click(symbol)}
            className="sleek-key"
            id={`math-key-${symbol.label}`}
          >
            {symbol.label}
          </button>
        ))}
      </div>
    </div>
  );
};
