import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Play, Calculator, HelpCircle, X, Check, Info } from "lucide-react";
import * as math from "mathjs";

interface FormulaCalculatorProps {
  latex: string;
  on_focus_variable: (variable_name: string | null) => void;
  active_variable: string | null;
  variable_values: Record<string, string>;
  set_variable_values: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export const FormulaCalculator = ({ 
  latex, 
  on_focus_variable, 
  active_variable, 
  variable_values, 
  set_variable_values 
}: FormulaCalculatorProps) => {
  const [steps, set_steps] = useState<string[]>([]);
  const [result, set_result] = useState<string | null>(null);
  const [error, set_error] = useState<string | null>(null);
  const [is_solving, set_is_solving] = useState(false);

  // Extract variables from LaTeX
  const variables = useMemo(() => {
    const cleaned = latex.replace(/\\[a-zA-Z]+/g, ' ');
    const matches = cleaned.match(/[a-zA-Z]/g) || [];
    return Array.from(new Set(matches)).sort();
  }, [latex]);

  // Sync variables with values state
  useEffect(() => {
    const new_values = { ...variable_values };
    let changed = false;
    
    variables.forEach(v => {
      if (!(v in new_values)) {
        new_values[v] = "";
        changed = true;
      }
    });

    if (changed) {
      set_variable_values(new_values);
    }
  }, [variables]);

  // Reset results when formula is cleared
  useEffect(() => {
    if (latex.trim() === "") {
      set_steps([]);
      set_result(null);
      set_error(null);
    }
  }, [latex]);

  const handle_value_change = (v: string, val: string) => {
    set_variable_values(prev => ({ ...prev, [v]: val }));
  };

  const solve_formula = async () => {
    set_is_solving(true);
    set_error(null);
    set_result(null);
    set_steps([]);

    try {
      // 1. Check for Calculus/Complex patterns to set expectations
      const hasCalculus = latex.includes("\\int") || latex.includes("\\sum");
      
      // 2. Detect unknown
      const unknown_vars = variables.filter(v => variable_values[v] === "?");
      if (unknown_vars.length > 1) {
        throw new Error("Multi-variable solving is not supported. Please limit '?' to exactly one variable.");
      }
      
      const unknown = unknown_vars[0] || null;

      // 3. Robust LaTeX to Math String Translation
      const toMathStr = (tex: string) => {
        let s = tex;
        // Handle Greek symbols used as variables (e.g. \mu, \sigma, \pi)
        const greekMap: Record<string, string> = {
          "\\pi": "PI",
          "\\mu": "mu",
          "\\sigma": "sigma",
          "\\theta": "theta",
          "\\phi": "phi",
          "\\alpha": "alpha",
          "\\beta": "beta",
          "\\gamma": "gamma",
          "\\delta": "delta",
          "\\epsilon": "epsilon"
        };
        
        Object.entries(greekMap).forEach(([texSym, mathSym]) => {
          s = s.replace(new RegExp(texSym.replace("\\", "\\\\"), "g"), mathSym);
        });

        return s
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)")
          .replace(/\\sqrt\{([^}]+)\}/g, "sqrt($1)")
          .replace(/\\sqrt\[([^\]]+)\]\{([^}]+)\}/g, "nthRoot($2, $1)")
          .replace(/\\times/g, "*")
          .replace(/\\div/g, "/")
          .replace(/\\cdot/g, "*")
          .replace(/\^\{([^}]+)\}/g, "^($1)")
          .replace(/\^([0-9a-zA-Z])/g, "^($1)")
          .replace(/_\{([^}]+)\}/g, "_$1")
          .replace(/\\left\(/g, "(")
          .replace(/\\right\(/g, ")")
          .replace(/\{([^}]+)\}/g, "($1)")
          .replace(/\\int|\\sum/g, "") // Strip calculus names 
          .replace(/\\[a-zA-Z]+/g, "") // Strip remaining commands
          .replace(/dx|dy|dz/g, "")    // Strip differentials
          .trim();
      };

      const math_str = toMathStr(latex);
      let lhs = "";
      let rhs = "";
      if (math_str.includes("=")) {
        [lhs, rhs] = math_str.split("=").map((s) => s.trim());
      } else {
        lhs = math_str;
        rhs = "0";
      }

      // 4. Validation
      const missing = variables.filter(v => (!variable_values[v] || (variable_values[v] !== "?" && isNaN(Number(variable_values[v])))));
      if (missing.length > 0) {
        throw new Error(`Please provide a numeric value or '?' for these variables: ${missing.join(', ')}`);
      }

      const res_steps: string[] = [];
      let final_res: any = null;

      if (hasCalculus) {
        res_steps.push("Note: Complex calculus symbols detected. Solving will treat bounds as static numbers.");
      }

      // 5. Substitution Step
      const known_vars = variables.filter((v) => variable_values[v] !== "?");
      if (known_vars.length > 0) {
        res_steps.push(`Values: ${known_vars.map((v) => `${v}=${variable_values[v]}`).join(", ")}`);
      }

      const substitute = (expr: string) => {
        let s = expr;
        // Sort variables by length descending to avoid partial replacements (e.g. sigma vs sigma_0)
        const sortedVars = [...variables].sort((a, b) => b.length - a.length);
        sortedVars.forEach((v) => {
          if (variable_values[v] !== "?") {
            const re = new RegExp(`(?<![a-zA-Z0-9])${v}(?![a-zA-Z0-9])`, "g");
            s = s.replace(re, `(${variable_values[v]})`);
          }
        });
        return s;
      };

      const lhs_sub = substitute(lhs);
      const rhs_sub = substitute(rhs);
      
      res_steps.push(`Ready Expression: ${lhs_sub}${math_str.includes("=") ? " = " + rhs_sub : ""}`);

      // 6. Logic for solving
      if (!unknown) {
        try {
          const val_l = math.evaluate(lhs_sub);
          const val_r = math.evaluate(rhs_sub);
          
          if (math_str.includes("=")) {
            res_steps.push(`Left evaluates to ${val_l.toFixed(4)}, Right matches ${val_r.toFixed(4)}`);
            final_res = Math.abs(val_l - val_r) < 1e-6 ? "Equation is Balanced" : "Equation is NOT Balanced";
          } else {
            final_res = val_l;
          }
        } catch (e) {
          throw new Error("Parsing error: The current expression contains operations (like integrals or non-standard notation) that the solver cannot evaluate directly. Please simplify the formula.");
        }
      } else {
        res_steps.push(`Finding solution for unknown variable: ${unknown}`);
        
        if (lhs.trim() === unknown) {
          final_res = math.evaluate(rhs_sub);
        } else if (rhs.trim() === unknown) {
          final_res = math.evaluate(lhs_sub);
        } else {
          const scope_base: Record<string, number> = {};
          variables.forEach((v) => {
            if (v !== unknown) scope_base[v] = Number(variable_values[v]);
          });

          const f_expr = `(${lhs}) - (${rhs})`;
          const f_node = math.parse(f_expr);
          const f = (x: number) => f_node.evaluate({ ...scope_base, [unknown]: x });

          // Numerical Solver (Newton-Raphson or Bisection)
          let x0 = -1000, x1 = 1000;
          let f0 = f(x0), f1 = f(x1);
          if (f0 * f1 > 0) { x0 = -1e5; x1 = 1e5; f0 = f(x0); f1 = f(x1); }

          if (f0 * f1 <= 0) {
            let mid = 0;
            for (let i = 0; i < 60; i++) {
              mid = (x0 + x1) / 2;
              const fm = f(mid);
              if (Math.abs(fm) < 1e-12) break;
              if (fm * f0 < 0) x1 = mid;
              else { x0 = mid; f0 = fm; }
            }
            final_res = mid;
            res_steps.push(`Root discovered via numerical convergence.`);
          } else {
            throw new Error(`Could not find a valid real solution for ${unknown} in a reasonable range. The equation might be impossible or require complex numbers.`);
          }
        }
      }

      set_steps(res_steps);
      set_result(typeof final_res === "number" ? final_res.toLocaleString(undefined, { maximumFractionDigits: 6 }) : String(final_res));
    } catch (err: any) {
      let msg = err.message;
      if (msg.includes("Value expected")) {
        msg = "The formula has a structural error (e.g. empty brackets or missing operator). Please check your LaTeX input.";
      } else if (msg.includes("Undefined symbol")) {
        msg = `A symbol used in the formula was not recognized. Please ensure all variables are defined.`;
      }
      set_error(msg);
    } finally {
      set_is_solving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="bg-slate-50 border-b border-slate-100 px-6 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2 group relative">
          <Calculator className="text-blue-500" size={18} />
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Formula Calculation</h3>
          <div className="text-slate-300 cursor-help hover:text-blue-400 transition-colors">
            <Info size={14} />
          </div>
          
          {/* Tooltip */}
          <div className="absolute left-0 top-full mt-2 w-64 bg-slate-800 text-white text-[10px] p-3 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none line-height-relaxed">
            <p className="font-bold mb-1 border-b border-white/10 pb-1">Mathematical Principles</p>
            <p>Enter values for variables. Use <span className="text-blue-400 font-bold">?</span> for the unknown variable you wish to solve for. The calculator will find the value that balances the equation.</p>
          </div>
        </div>
        <button 
          onClick={solve_formula}
          disabled={variables.length === 0 || is_solving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 disabled:grayscale"
        >
          {is_solving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><Calculator size={14}/></motion.div> : <Play size={14} fill="currentColor" />}
          SOLVE
        </button>
      </div>

      <div className="p-6">
        {variables.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
            <HelpCircle size={32} opacity={0.5} />
            <p className="text-sm italic">Insert variables like x, y, a, b into your formula to calculate values.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {variables.map(v => (
              <div key={v} className="flex flex-col space-y-1">
                <div className="flex items-center justify-between">
                  <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-tighter">Variable {v}</span>
                  {variable_values[v] === "?" ? (
                    <span className="text-blue-500 text-[10px] font-bold">Unknown</span>
                  ) : (
                    variable_values[v] && !isNaN(Number(variable_values[v])) && <Check className="text-green-500" size={12} />
                  )}
                </div>
                <input
                  type="text"
                  value={variable_values[v] || ""}
                  onChange={(e) => handle_value_change(v, e.target.value)}
                  onFocus={() => on_focus_variable(v)}
                  className={`bg-slate-50 border p-2 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${active_variable === v ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-100'} ${variable_values[v] === "?" ? 'text-blue-600 font-bold bg-blue-50/30' : ''}`}
                  placeholder={`Value or ? for unknown...`}
                />
              </div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {(result || error || steps.length > 0) && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-6 border-t border-slate-100 pt-6"
            >
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Steps</span>
                  <button onClick={() => { set_result(null); set_error(null); set_steps([]); }} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
                
                {error ? (
                  <p className="text-red-500 text-sm font-medium bg-red-50 p-2 rounded border border-red-100">{error}</p>
                ) : (
                  <div className="space-y-3">
                    {steps.map((step, i) => (
                      <div key={i} className="flex gap-3 items-start">
                        <span className="bg-slate-200 text-slate-500 text-[10px] w-5 h-5 flex items-center justify-center rounded-full shrink-0 mt-0.5">{i+1}</span>
                        <p className="text-sm text-slate-600 font-mono break-all">{step}</p>
                      </div>
                    ))}
                    {result && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl flex flex-col items-center justify-center space-y-1">
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Final Result</span>
                        <span className="text-3xl font-bold text-green-700 font-mono">{result}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

