"use client";

import { useState } from "react";

export default function FAQ({ items }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 px-6 bg-white">
      <div className="max-w-3xl mx-auto">

        <div className="text-center mb-16">
          <p className="text-orange-500 font-bold uppercase tracking-widest">
            Questions fréquentes
          </p>

          <h2 className="text-3xl md:text-5xl font-black mt-4">
            Vous avez des questions ?
          </h2>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center text-left p-6 font-bold text-lg hover:bg-gray-50 transition"
              >
                <span>{item.question}</span>
                <span className="text-orange-500 text-2xl shrink-0 ml-4">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

