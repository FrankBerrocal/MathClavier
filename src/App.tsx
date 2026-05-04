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

import { FormulaCalculator } from "./components/calculator/FormulaCalculator";

export default function App() {
  const [latex_string, set_latex_string] = useState<string>("f(x) = \\int_{a}^{b} \\frac{e^{-(x-\\mu)^2/2\\sigma^2}}{\\sigma\\sqrt{2\\pi}} dx");
  const [history, set_history] = useState<{ latex: string; stack: { mode: string; step: number }[] }[]>([]);
  const [is_exporting, set_is_exporting] = useState<boolean>(false);
  const textarea_ref = React.useRef<HTMLTextAreaElement>(null);
  
  // Variable Calculation State
  const [active_variable, set_active_variable] = useState<string | null>(null);
  const [variable_values, set_variable_values] = useState<Record<string, string>>({});
  const [calculated_result, set_calculated_result] = useState<string | null>(null);

  // Guided Input Stack for nested structures
  const [guide_stack, set_guide_stack] = useState<{ mode: string; step: number }[]>([]);

  // Bracket counting for safety/fallback
  const open_braces = (latex_string.match(/\{/g) || []).length;
  const closed_braces = (latex_string.match(/\}/g) || []).length;
  const open_parens = (latex_string.match(/\\left\(/g) || []).length;
  const closed_parens = (latex_string.match(/\\right\)/g) || []).length;
  const brackets_open = (open_braces - closed_braces) > 0 || (open_parens - closed_parens) > 0;

  // Focus utility to keep cursor and keyboard active
  const focus_textarea = (pos?: number) => {
    setTimeout(() => {
      if (textarea_ref.current) {
        textarea_ref.current.focus();
        if (typeof pos === "number") {
          textarea_ref.current.selectionStart = pos;
          textarea_ref.current.selectionEnd = pos;
        }
      }
    }, 10);
  };

  const insert_at_cursor = (text: string) => {
    const textarea = textarea_ref.current;
    if (!textarea) return { new_val: latex_string + text, next_pos: (latex_string + text).length };

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = latex_string.substring(0, start);
    const after = latex_string.substring(end);
    
    return {
      new_val: before + text + after,
      next_pos: start + text.length
    };
  };

  const handle_add_symbol = (symbol: MathSymbol) => {
    // If a calculator variable is focused, input goes there instead
    if (active_variable && symbol.category === "Numbers") {
      set_variable_values(prev => ({
        ...prev,
        [active_variable]: (prev[active_variable] || "") + symbol.latex
      }));
      return;
    }

    set_history(prev => [...prev, { latex: latex_string, stack: [...guide_stack] }]);
    
    // 1. Handle Activation of Guided Modes (Push to stack)
    if (symbol.latex === "\\frac{n}{d}") {
      const { new_val } = insert_at_cursor("\\frac{");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "fraction", step: 1 }]);
      focus_textarea();
      return;
    }
    if (symbol.latex === "\\sqrt{x}") {
      const { new_val } = insert_at_cursor("\\sqrt{");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "sqrt", step: 1 }]);
      focus_textarea();
      return;
    }
    if (symbol.latex === "x^{n}") {
      const { new_val } = insert_at_cursor("^{");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "power", step: 1 }]);
      focus_textarea();
      return;
    }
    if (symbol.latex === "x_{n}") {
      const { new_val } = insert_at_cursor("_{");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "subscript", step: 1 }]);
      focus_textarea();
      return;
    }
    if (symbol.latex === "\\sqrt[n]{x}") {
      const { new_val } = insert_at_cursor("\\sqrt[");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "nth_root", step: 1 }]);
      focus_textarea();
      return;
    }
    if (symbol.latex === "\\int" || symbol.latex === "\\sum") {
      const { new_val } = insert_at_cursor(symbol.latex + "_{");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "limits", step: 1 }]);
      focus_textarea();
      return;
    }

    if (symbol.latex === "\\text{ }") {
      const { new_val } = insert_at_cursor("\\text{");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "text", step: 1 }]);
      focus_textarea();
      return;
    }

    if (symbol.latex === "( )") {
      const { new_val } = insert_at_cursor("\\left(");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "parentheses", step: 1 }]);
      focus_textarea();
      return;
    }

    if (symbol.latex === "\\log(") {
      const { new_val } = insert_at_cursor("\\log \\left(");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "parentheses", step: 1 }]);
      focus_textarea();
      return;
    }

    if (symbol.latex === "\\ln(") {
      const { new_val } = insert_at_cursor("\\ln \\left(");
      set_latex_string(new_val);
      set_guide_stack(prev => [...prev, { mode: "parentheses", step: 1 }]);
      focus_textarea();
      return;
    }

    // 2. Default behavior (Standard insertion)
    const insert_text = symbol.latex === "\\lim_{x \\to \\infty}" ? "\\lim_{x \\to \\infty}" : 
                       symbol.latex;
    const { new_val } = insert_at_cursor(insert_text);
    set_latex_string(new_val);
    focus_textarea();
  };

  const handle_close_bracket = () => {
    const open_braces = (latex_string.match(/\{/g) || []).length;
    const closed_braces = (latex_string.match(/\}/g) || []).length;
    const braces_diff = open_braces - closed_braces;

    if (guide_stack.length === 0 && braces_diff <= 0) return;
    
    set_history(prev => [...prev, { latex: latex_string, stack: [...guide_stack] }]);
    
    const textarea = textarea_ref.current;
    const cursor = textarea ? textarea.selectionStart : latex_string.length;
    
    let next_val = "";
    let next_cursor = cursor + 1;

    if (guide_stack.length > 0) {
      const current_guide = guide_stack[guide_stack.length - 1];
      const remaining_guides = guide_stack.slice(0, -1);
      
      if (current_guide.mode === "fraction") {
        if (current_guide.step === 1) {
          next_val = latex_string.substring(0, cursor) + "}{" + latex_string.substring(cursor);
          next_cursor = cursor + 2; // Position between }{ i.e. start of denominator
          set_latex_string(next_val);
          set_guide_stack([...remaining_guides, { ...current_guide, step: 2 }]);
        } else {
          next_val = latex_string.substring(0, cursor) + "}" + latex_string.substring(cursor);
          next_cursor = cursor + 1;
          set_latex_string(next_val);
          set_guide_stack(remaining_guides);
        }
      } else if (current_guide.mode === "nth_root") {
        if (current_guide.step === 1) {
          next_val = latex_string.substring(0, cursor) + "]{" + latex_string.substring(cursor);
          next_cursor = cursor + 2; // Inside the root radicand
          set_latex_string(next_val);
          set_guide_stack([...remaining_guides, { ...current_guide, step: 2 }]);
        } else {
          next_val = latex_string.substring(0, cursor) + "}" + latex_string.substring(cursor);
          next_cursor = cursor + 1;
          set_latex_string(next_val);
          set_guide_stack(remaining_guides);
        }
      } else if (current_guide.mode === "limits") {
        if (current_guide.step === 1) {
          next_val = latex_string.substring(0, cursor) + "}^{" + latex_string.substring(cursor);
          next_cursor = cursor + 3; // After }^{ (position in upper limit)
          set_latex_string(next_val);
          set_guide_stack([...remaining_guides, { ...current_guide, step: 2 }]);
        } else {
          next_val = latex_string.substring(0, cursor) + "}" + latex_string.substring(cursor);
          next_cursor = cursor + 1;
          set_latex_string(next_val);
          set_guide_stack(remaining_guides);
        }
      } else if (current_guide.mode === "parentheses") {
        next_val = latex_string.substring(0, cursor) + "\\right)" + latex_string.substring(cursor);
        next_cursor = cursor + 7; // Length of \right)
        set_latex_string(next_val);
        set_guide_stack(remaining_guides);
      } else {
        // sqrt, power, subscript (One step only)
        next_val = latex_string.substring(0, cursor) + "}" + latex_string.substring(cursor);
        next_cursor = cursor + 1;
        set_latex_string(next_val);
        set_guide_stack(remaining_guides);
      }
    } else {
      // Unguided brace closure fallback - check what is open
      const open_braces = (latex_string.match(/\{/g) || []).length;
      const closed_braces = (latex_string.match(/\}/g) || []).length;
      const open_parens = (latex_string.match(/\\left\(/g) || []).length;
      const closed_parens = (latex_string.match(/\\right\)/g) || []).length;

      if (open_parens > closed_parens) {
        next_val = latex_string.substring(0, cursor) + "\\right)" + latex_string.substring(cursor);
        next_cursor = cursor + 7;
      } else {
        next_val = latex_string.substring(0, cursor) + "}" + latex_string.substring(cursor);
        next_cursor = cursor + 1;
      }
      set_latex_string(next_val);
    }
    focus_textarea(next_cursor);
  };

  const handle_clear = () => {
    set_history(prev => [...prev, { latex: latex_string, stack: [...guide_stack] }]);
    set_latex_string("");
    set_guide_stack([]);
  };

  const handle_undo = () => {
    if (history.length > 0) {
      const prev_state = history[history.length - 1];
      set_latex_string(prev_state.latex);
      set_guide_stack(prev_state.stack);
      set_history(history.slice(0, -1));
    }
  };

  const export_as_image = async () => {
    const element = document.getElementById("formula-canvas-area");
    if (!element) return;

    set_is_exporting(true);
    try {
      // High-quality professional capture
      const data_url = await toJpeg(element, { 
        quality: 1, 
        backgroundColor: "#ffffff",
        pixelRatio: 4, 
      });
      const link = document.createElement("a");
      link.download = `mathclavier-formula-${Date.now()}.jpg`;
      link.href = data_url;
      link.click();
      
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#f59e0b']
      });
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      set_is_exporting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-700">
      <Header />

      <main className="flex-grow p-4 md:p-6 flex flex-col space-y-6 max-w-7xl mx-auto w-full">
        {/* Display Section */}
        <section className="relative flex flex-col shrink-0 space-y-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              Composer Viewport
              {guide_stack.length > 0 && (
                <span className="bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full animate-pulse capitalize">
                  {guide_stack[guide_stack.length - 1].mode.replace("_", " ")}: Step {guide_stack[guide_stack.length - 1].step}
                </span>
              )}
            </span>
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
            <FormulaDisplay 
              latex_string={latex_string} 
              variable_values={variable_values}
              result={calculated_result}
            />
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
        <section className="flex-grow flex flex-col md:flex-row space-y-6 md:space-y-0 md:space-x-6">
          {/* Main Keypad Column */}
          <div className="flex-grow flex flex-col space-y-4">
            <div className="flex-grow min-h-[300px]">
              <Keypad on_symbol_click={handle_add_symbol} />
            </div>

            {/* LaTeX Code Panel - MOVED HERE */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">LaTeX Code Editor</span>
              <textarea
                ref={textarea_ref}
                value={latex_string}
                onFocus={() => set_active_variable(null)}
                onChange={(e) => set_latex_string(e.target.value)}
                className="w-full text-2xl text-slate-700 font-mono bg-slate-50 p-4 rounded-xl border border-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-400 min-h-[100px] font-bold"
                placeholder="Empty LaTeX output..."
                spellCheck={false}
              />
            </div>
          </div>

          {/* Numeric Panel Sidebar */}
          <div className="w-full md:w-80 flex flex-col space-y-4 shrink-0">
            <div className="bg-slate-800 rounded-2xl p-4 grid grid-cols-4 gap-2 shadow-lg h-full content-start">
              {[
                { l: "7", v: "7" }, { l: "8", v: "8" }, { l: "9", v: "9" }, { l: "/", v: "/" },
                { l: "4", v: "4" }, { l: "5", v: "5" }, { l: "6", v: "6" }, { l: "×", v: "\\times" },
                { l: "1", v: "1" }, { l: "2", v: "2" }, { l: "3", v: "3" }, { l: "−", v: "-" },
                { l: ".", v: "." }, { l: "0", v: "0" }, { l: "=", v: "=" }, { l: "+", v: "+" },
              ].map(item => (
                <button 
                  key={item.l}
                  onClick={() => handle_add_symbol({ label: item.l, latex: item.v, category: "Numbers" })}
                  className="h-12 bg-slate-700 text-white rounded-lg font-bold text-xl hover:bg-slate-600 transition-colors border-b-2 border-slate-900 active:border-b-0 active:translate-y-0.5"
                >
                  {item.l}
                </button>
              ))}
              
              <button 
                onClick={() => {
                  if (active_variable) {
                    set_variable_values(prev => ({
                      ...prev,
                      [active_variable]: prev[active_variable].slice(0, -1)
                    }));
                  } else {
                    set_history(prev => [...prev, { latex: latex_string, stack: [...guide_stack] }]);
                    set_latex_string(latex_string.slice(0, -1));
                  }
                }}
                className="col-span-2 h-12 bg-red-500/20 text-red-400 rounded-lg font-bold text-xs hover:bg-red-500/30 transition-colors border-b-2 border-red-500/10 active:border-b-0 active:translate-y-0.5"
                title="Delete last character"
              >
                BACKSPACE
              </button>
              <button 
                onClick={handle_clear}
                className="col-span-2 h-12 bg-slate-600 text-white rounded-lg font-bold text-xs hover:bg-slate-500 transition-colors border-b-2 border-slate-700 active:border-b-0 active:translate-y-0.5"
              >
                CLEAR ALL
              </button>

              <button 
                onClick={() => handle_add_symbol({ label: "⍰", latex: "?", category: "Numbers" })}
                className="h-12 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xl transition-colors border-b-2 border-amber-800 active:border-b-0 active:translate-y-0.5"
              >
                ⍰
              </button>

              <AnimatePresence>
                {(guide_stack.length > 0 || brackets_open) && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    onClick={handle_close_bracket}
                    className="col-span-4 h-11 bg-blue-500/10 text-blue-400 rounded-lg font-bold text-[10px] hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2 border border-blue-500/20"
                  >
                    <span className="tracking-widest uppercase">Close Expression Part</span>
                    <span className="bg-blue-500/30 text-white px-2 py-0.5 rounded text-[10px]">{"}"}</span>
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
            
            <div className="hidden md:flex h-24 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex-col justify-center space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</span>
              <p className={`text-xs truncate italic font-mono p-1 rounded border ${guide_stack.length > 0 || brackets_open ? 'bg-blue-50 text-blue-600 border-blue-100 font-bold' : 'bg-slate-50 text-slate-600 border-slate-100'}`}>
                {guide_stack.length > 0 || brackets_open ? "Close current expression part" : "Ready for input"}
              </p>
            </div>
          </div>
        </section>

        {/* Formula Calculation Panel */}
        <section className="shrink-0">
          <FormulaCalculator 
            latex={latex_string}
            on_focus_variable={set_active_variable}
            on_result_change={set_calculated_result}
            active_variable={active_variable}
            variable_values={variable_values}
            set_variable_values={set_variable_values}
          />
        </section>
      </main>

      <DisclaimerPage />
      <Footer />
    </div>
  );
}
