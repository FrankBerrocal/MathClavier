import React, { useEffect, useRef } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

interface FormulaDisplayProps {
  latex_string: string;
}

export const FormulaDisplay = ({ latex_string }: FormulaDisplayProps) => {
  const container_ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (container_ref.current) {
      try {
        katex.render(latex_string || "\\dots", container_ref.current, {
          throwOnError: false,
          displayMode: true
        });
      } catch (err) {
        console.error("KaTeX error:", err);
      }
    }
  }, [latex_string]);

  return (
    <div className="math-display-sleek" id="formula-canvas-area">
      <div ref={container_ref} className="text-5xl text-slate-700 tracking-wider" />
    </div>
  );
};
