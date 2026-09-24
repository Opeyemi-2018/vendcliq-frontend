"use client";
import React, { useState, useEffect } from "react";

// The auth screens' rotating headline: slides one message out and the next in
// every few seconds, with a progress bar per message.
export default function RotatingHeroCopy() {
  const content = [
    {
      title: "Stock Smarter, Not Harder",
      description:
        "Get real-time insights on what sells fast in your area. Know when to restock, and never run out again.",
    },
    {
      title: "Inventory Made Simple",
      description:
        "Automate your stock management with intelligent tracking. Spend less time counting, more time growing.",
    },
    {
      title: "Never Run Out Again",
      description:
        "Predictive alerts keep your shelves stocked. Stay ahead of demand and keep customers happy.",
    },
    {
      title: "Predict What Sells Next",
      description:
        "AI-powered forecasting shows you trends before they happen. Stock what matters, when it matters.",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % content.length);
        setIsAnimating(false);
      }, 500);
    }, 3500);

    return () => clearInterval(interval);
  }, [content.length]);

  return (
    <>
      <div className="overflow-hidden mb-4">
        <h2
          className={`font-clash text-white text-[20px] md:text-[25px] font-semibold transition-all duration-500 ${
            isAnimating
              ? "translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
          }`}
          style={{
            transform: isAnimating ? "translateY(100%)" : "translateY(0)",
          }}
        >
          {content[currentIndex].title}
        </h2>
      </div>

      <div className="overflow-hidden mb-6">
        <p
          className={`text-white font-medium text-[16px] font-sans max-w-lg transition-all duration-500 delay-75 ${
            isAnimating
              ? "translate-y-full opacity-0"
              : "translate-y-0 opacity-100"
          }`}
          style={{
            transform: isAnimating ? "translateY(100%)" : "translateY(0)",
          }}
        >
          {content[currentIndex].description}
        </p>
      </div>

      <div className="flex gap-2">
        {content.map((_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-[#0A6DC0] w-16" : "bg-white w-16"
            }`}
          ></div>
        ))}
      </div>
    </>
  );
}
