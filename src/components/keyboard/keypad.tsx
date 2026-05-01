import React, { useState } from "react";
import { MATH_SYMBOLS, MathSymbol } from "../../constants";

interface KeypadProps {
  on_symbol_click: (symbol: MathSymbol) => void;
}

export const Keypad = ({ on_symbol_click }: KeypadProps) => {
  const [active_tab, set_active_tab] = useState<string>("Algebra");

  const categories = Array.from(new Set(MATH_SYMBOLS.map(s => s.category)));

  const filtered_symbols = MATH_SYMBOLS.filter(s => s.category === active_tab);

  return (
    <div className="sleek-card flex-1 flex flex-col h-full">
      <div className="flex bg-slate-50 border-b border-slate-200 px-4">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => set_active_tab(category)}
            className={`px-6 py-3 text-xs font-bold uppercase tracking-tighter transition-all whitespace-nowrap ${
              active_tab === category 
                ? "text-blue-600 border-b-2 border-blue-600" 
                : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {category}
          </button>
        ))}
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
