import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface FormulaDisplayProps {
  latex_string: string;
  variable_values?: Record<string, string>;
  result?: string | null;
}

export const FormulaDisplay = ({ latex_string, variable_values, result }: FormulaDisplayProps) => {
  const container_ref = useRef<HTMLDivElement>(null);
  const outer_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container_ref.current) {
      try {
        katex.render(latex_string || "\\dots", container_ref.current, {
          throwOnError: false,
          displayMode: true
        });

        // Auto-scale logic
        const outer = outer_ref.current;
        const inner = container_ref.current;
        if (outer && inner) {
          inner.style.transform = 'scale(1)';
          const outer_width = outer.offsetWidth - 40; // padding
          const inner_width = inner.scrollWidth;
          
          if (inner_width > outer_width) {
            const ratio = outer_width / inner_width;
            inner.style.transform = `scale(${Math.max(0.4, ratio)})`;
            inner.style.transformOrigin = 'center';
          }
        }
      } catch (err) {
        console.error("KaTeX error:", err);
      }
    }
  }, [latex_string]);

  const active_vars = variable_values ? Object.entries(variable_values).filter(([_, val]) => val !== "") : [];

  return (
    <div className="math-display-sleek flex-1 flex flex-col items-center justify-center relative overflow-hidden p-6" id="formula-canvas-area" ref={outer_ref}>
      <div ref={container_ref} className="text-5xl text-slate-700 tracking-wider transition-transform duration-300" />
      
      {/* Overlay data for export/view */}
      {(active_vars.length > 0 || result) && (
        <div className="absolute bottom-4 left-6 right-6 flex flex-wrap gap-x-4 gap-y-1 justify-center border-t border-slate-100 pt-2 bg-white/80 backdrop-blur-sm rounded-lg px-3">
          {active_vars.map(([name, val]) => (
            <div key={name} className="flex items-center gap-1">
              <span className="text-[9px] font-bold text-blue-500 uppercase">{name}=</span>
              <span className="text-[10px] font-mono font-bold text-slate-600">{val}</span>
            </div>
          ))}
          {result && (
            <div className="flex items-center gap-1 border-l border-slate-200 pl-4 ml-2">
              <span className="text-[9px] font-bold text-green-600 uppercase">Result=</span>
              <span className="text-[10px] font-mono font-bold text-green-700">{result}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
