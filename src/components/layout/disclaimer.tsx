import React from "react";
import { DISCLAIMER_TEXT } from "../../constants";

export const DisclaimerPage = () => {
  return (
    <div id="disclaimer" className="py-20 bg-white border-t border-slate-200">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-3xl font-serif font-bold mb-8 text-slate-800 border-b border-slate-100 pb-4">
          {DISCLAIMER_TEXT.title}
        </h2>
        
        <div className="space-y-8 text-lg leading-relaxed text-slate-600">
          <section>
            <h3 className="font-bold text-slate-800 mb-2">License</h3>
            <p className="font-mono text-sm bg-slate-50 p-4 border border-slate-200 rounded-xl">
              Copyright (c) {new Date().getFullYear()} Frank Berrocal
              <br /><br />
              Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction...
            </p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">Mathematical Guide</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-bold text-sm text-blue-600 mb-2 underline decoration-blue-200">Fractions</p>
                <p className="text-sm">Structure: <code className="bg-white px-1">\frac{`{numerator}`}{`{denominator}`}</code></p>
                <p className="text-sm mt-1 text-slate-500">Example: <code className="bg-white px-1">\frac{1}{2}</code> results in 1/2.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <p className="font-bold text-sm text-blue-600 mb-2 underline decoration-blue-200">Powers & Roots</p>
                <p className="text-sm">Power: <code className="bg-white px-1">x^{`{n}`}</code></p>
                <p className="text-sm">Root: <code className="bg-white px-1">\sqrt{`{x}`}</code></p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">Privacy & Data (GDPR)</h3>
            <p>{DISCLAIMER_TEXT.statement}</p>
          </section>

          <section>
            <h3 className="font-bold text-slate-800 mb-2">Attribution</h3>
            <p className="italic text-slate-400">{DISCLAIMER_TEXT.copyright}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
