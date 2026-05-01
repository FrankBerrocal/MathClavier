/**
 * @license
 * SPDX-License-Identifier: MIT
 */

export const DISCLAIMER_TEXT = {
  title: "Disclaimer & Legal Information",
  license: "MIT License",
  statement: "GDPR Statement: No data is saved. Your data belongs to you. This application operates entirely locally in your browser for the frontend experience.",
  copyright: "Conceptualized, Designed, and Created by Frank Berrocal, copyright 2026"
};

export interface MathSymbol {
  label: string;
  latex: string;
  category: "Algebra" | "Statistics" | "Set Operations" | "Calculus" | "Trigonometry" | "Greek" | "Numbers" | "Letters";
}

export const MATH_SYMBOLS: MathSymbol[] = [
  // Letters (Common Variables)
  { label: "a", latex: "a", category: "Letters" },
  { label: "b", latex: "b", category: "Letters" },
  { label: "c", latex: "c", category: "Letters" },
  { label: "x", latex: "x", category: "Letters" },
  { label: "y", latex: "y", category: "Letters" },
  { label: "z", latex: "z", category: "Letters" },

  // Algebra
  { label: "+", latex: "+", category: "Algebra" },
  { label: "−", latex: "-", category: "Algebra" },
  { label: "×", latex: "\\times", category: "Algebra" },
  { label: "÷", latex: "\\div", category: "Algebra" },
  { label: "=", latex: "=", category: "Algebra" },
  { label: "x²", latex: "x^2", category: "Algebra" },
  { label: "xⁿ", latex: "x^{n}", category: "Algebra" },
  { label: "xₙ", latex: "x_{n}", category: "Algebra" },
  { label: "√x", latex: "\\sqrt{x}", category: "Algebra" },
  { label: "ⁿ√x", latex: "\\sqrt[n]{x}", category: "Algebra" },
  { label: "a/b", latex: "\\frac{n}{d}", category: "Algebra" },
  { label: "( )", latex: "( )", category: "Algebra" },
  { label: "±", latex: "\\pm", category: "Algebra" },
  { label: "≈", latex: "\\approx", category: "Algebra" },
  
  // Statistics
  { label: "μ", latex: "\\mu", category: "Statistics" },
  { label: "σ", latex: "\\sigma", category: "Statistics" },
  { label: "x̄", latex: "\\bar{x}", category: "Statistics" },
  { label: "Σ", latex: "\\sum", category: "Statistics" },
  { label: "P(A)", latex: "P(A)", category: "Statistics" },
  { label: "n!", latex: "n!", category: "Statistics" },
  { label: "σ²", latex: "\\sigma^2", category: "Statistics" },
  { label: "λ", latex: "\\lambda", category: "Statistics" },
  { label: "χ²", latex: "\\chi^2", category: "Statistics" },
  
  // Set Operations
  { label: "∈", latex: "\\in", category: "Set Operations" },
  { label: "∉", latex: "\\notin", category: "Set Operations" },
  { label: "⊂", latex: "\\subset", category: "Set Operations" },
  { label: "∪", latex: "\\cup", category: "Set Operations" },
  { label: "∩", latex: "\\cap", category: "Set Operations" },
  { label: "∅", latex: "\\emptyset", category: "Set Operations" },
  { label: "∀", latex: "\\forall", category: "Set Operations" },
  { label: "∃", latex: "\\exists", category: "Set Operations" },
  
  // Calculus
  { label: "∫", latex: "\\int", category: "Calculus" },
  { label: "∂", latex: "\\partial", category: "Calculus" },
  { label: "∇", latex: "\\nabla", category: "Calculus" },
  { label: "∞", latex: "\\infty", category: "Calculus" },
  { label: "lim", latex: "\\lim_{x \\to \\infty}", category: "Calculus" },
  
  // Trigonometry
  { label: "sin", latex: "\\sin", category: "Trigonometry" },
  { label: "cos", latex: "\\cos", category: "Trigonometry" },
  { label: "tan", latex: "\\tan", category: "Trigonometry" },
  { label: "θ", latex: "\\theta", category: "Trigonometry" },
  { label: "π", latex: "\\pi", category: "Trigonometry" },
  { label: "rad", latex: "^{rad}", category: "Trigonometry" },

  // Greek
  { label: "α", latex: "\\alpha", category: "Greek" },
  { label: "β", latex: "\\beta", category: "Greek" },
  { label: "γ", latex: "\\gamma", category: "Greek" },
  { label: "δ", latex: "\\delta", category: "Greek" },
  { label: "ε", latex: "\\epsilon", category: "Greek" },
  { label: "ζ", latex: "\\zeta", category: "Greek" },
  { label: "η", latex: "\\eta", category: "Greek" },
  { label: "θ", latex: "\\theta", category: "Greek" },
  { label: "ι", latex: "\\iota", category: "Greek" },
  { label: "κ", latex: "\\kappa", category: "Greek" },
  { label: "λ", latex: "\\lambda", category: "Greek" },
  { label: "μ", latex: "\\mu", category: "Greek" },
  { label: "ν", latex: "\\nu", category: "Greek" },
  { label: "ξ", latex: "\\xi", category: "Greek" },
  { label: "π", latex: "\\pi", category: "Greek" },
  { label: "ρ", latex: "\\rho", category: "Greek" },
  { label: "σ", latex: "\\sigma", category: "Greek" },
  { label: "τ", latex: "\\tau", category: "Greek" },
  { label: "φ", latex: "\\phi", category: "Greek" },
  { label: "χ", latex: "\\chi", category: "Greek" },
  { label: "ψ", latex: "\\psi", category: "Greek" },
  { label: "ω", latex: "\\omega", category: "Greek" },
  { label: "Δ", latex: "\\Delta", category: "Greek" },
  { label: "Σ", latex: "\\Sigma", category: "Greek" },
  { label: "Ω", latex: "\\Omega", category: "Greek" },
];
