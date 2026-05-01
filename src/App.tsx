import React, { useState } from "react";
import { Header } from "./components/common/header";
import { Footer } from "./components/common/footer";
import { Keypad } from "./components/keyboard/keypad";
import { FormulaDisplay } from "./components/display/formula-display";
import { DisclaimerPage } from "./components/layout/disclaimer";
import { MathSymbol } from "./constants";
import { toJpeg } from "html-to-image";
import { Download, Trash2, Undo } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import confetti from "canvas-confetti";

export default function App() {
  const [latex_string, set_latex_string] = useState<string>("f(x) = \\int_{a}^{b} \\frac{e^{-(x-\\mu)^2/2\\sigma^2}}{\\sigma\\sqrt{2\\pi}} dx");
  const [history, set_history] = useState<string[]>([]);
  const [is_exporting, set_is_exporting] = useState<boolean>(false);

  const handle_add_symbol = (symbol: MathSymbol) => {
    set_history(prev => [...prev, latex_string]);
    
    // Quick handle for complex LaTeX templates
    let new_latex = latex_string;
    if (symbol.latex === "\\frac{n}{d}") {
      new_latex += "\\frac{ }{ }";
    } else if (symbol.latex === "x^{n}") {
      new_latex += "^{ }";
    } else if (symbol.latex === "( )") {
       new_latex += "\\left( \\right)";
    } else if (symbol.latex === "\\sqrt[n]{x}") {
       new_latex += "\\sqrt[ ]{x}";
    } else if (symbol.latex === "\\lim_{x \\to \\infty}") {
       new_latex += "\\lim_{x \\to \\infty}";
    } else {
      new_latex += symbol.latex;
    }
    
    set_latex_string(new_latex);
  };

  const handle_clear = () => {
    set_history(prev => [...prev, latex_string]);
    set_latex_string("");
  };

  const handle_undo = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1];
      set_latex_string(prev);
      set_history(history.slice(0, -1));
    }
  };

  const export_as_image = async () => {
    const element = document.getElementById("formula-canvas-area");
    if (!element) return;

    set_is_exporting(true);
    try {
      const data_url = await toJpeg(element, { quality: 0.95, backgroundColor: "#ffffff" });
      const link = document.createElement("a");
      link.download = `mathclavier-formula-${Date.now()}.jpg`;
      link.href = data_url;
      link.click();
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      set_is_exporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-sleek-bg">
      <Header />

      <main className="flex-grow p-4 md:p-6 flex flex-col space-y-6 max-w-7xl mx-auto w-full">
        {/* Display Section */}
        <section className="relative flex flex-col shrink-0 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Composer Viewport</span>
            <div className="flex gap-2">
              <button 
                onClick={export_as_image}
                disabled={is_exporting}
                className="sleek-button flex items-center gap-2"
                id="export-button"
              >
                <Download size={14} />
                {is_exporting ? "EXPORTING..." : "EXPORT AS JPG"}
              </button>
            </div>
          </div>

          <div className="sleek-card min-h-[220px] flex flex-col">
            <FormulaDisplay latex_string={latex_string} />
            <div className="h-8 bg-slate-50 border-t border-slate-100 px-6 flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-widest">
              <span>LaTeX Render Engine Active</span>
              <div className="flex gap-4">
                <button onClick={handle_undo} disabled={history.length === 0} className="hover:text-blue-600 transition-colors flex items-center gap-1 disabled:opacity-30">
                  <Undo size={10} /> Undo
                </button>
                <button onClick={handle_clear} className="hover:text-red-500 transition-colors flex items-center gap-1">
                  <Trash2 size={10} /> Clear
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Keyboard System */}
        <section className="flex-grow flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6 min-h-[400px]">
          {/* Main Keypad */}
          <div className="flex-grow min-h-[300px]">
            <Keypad on_symbol_click={handle_add_symbol} />
          </div>

          {/* Numeric Panel Sidebar */}
          <div className="w-full md:w-80 flex flex-col space-y-4 shrink-0">
            <div className="bg-slate-800 rounded-2xl p-4 grid grid-cols-3 gap-2 shadow-lg h-full content-start">
              {["7", "8", "9", "4", "5", "6", "1", "2", "3", ".", "0"].map(num => (
                <button 
                  key={num}
                  onClick={() => handle_add_symbol({ label: num, latex: num, category: "Numbers" })}
                  className="h-14 bg-slate-700 text-white rounded-lg font-bold text-xl hover:bg-slate-600 transition-colors border-b-2 border-slate-900 active:border-b-0 active:translate-y-0.5"
                >
                  {num}
                </button>
              ))}
              <button 
                onClick={() => handle_add_symbol({ label: "=", latex: "=", category: "Algebra" })}
                className="h-14 bg-blue-500 text-white rounded-lg font-bold text-xl hover:bg-blue-400 transition-colors border-b-2 border-blue-700 active:border-b-0 active:translate-y-0.5"
              >
                =
              </button>
              
              <button 
                onClick={() => {
                  set_history(prev => [...prev, latex_string]);
                  set_latex_string(latex_string.slice(0, -1));
                }}
                className="col-span-1 h-12 bg-red-500/20 text-red-400 rounded-lg font-bold text-xs hover:bg-red-500/30 transition-colors"
                title="Delete last character"
              >
                DEL
              </button>
              <button 
                onClick={handle_clear}
                className="col-span-2 h-12 bg-slate-600 text-white rounded-lg font-bold text-xs hover:bg-slate-500 transition-colors"
              >
                CLEAR ALL
              </button>
            </div>
            
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col justify-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">LaTeX Code</span>
              <textarea
                value={latex_string}
                onChange={(e) => set_latex_string(e.target.value)}
                className="w-full text-xs text-slate-600 font-mono bg-slate-50 p-2 rounded border border-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[60px]"
                placeholder="Empty LaTeX output..."
                spellCheck={false}
              />
            </div>
          </div>
        </section>
      </main>

      <DisclaimerPage />
      <Footer />
    </div>
  );
}
