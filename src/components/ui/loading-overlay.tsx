"use client";

import { useState, useEffect } from "react";
import { LoadingSpinner } from "./loading-spinner";

const funFacts = [
  "Did you know? The first computer mouse was made of wood! 🪚",
  "The term 'bug' in computing came from an actual moth in a computer! 🦋",
  "The first website is still online, created in 1991! 🌐",
  "More than 90% of the world's currency is digital! 💰",
  "The first programmer was Ada Lovelace, a woman! 👩‍💻"
];

export function LoadingOverlay({ message = "Loading..." }: { message?: string }) {
  const [currentFact, setCurrentFact] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Rotate through fun facts
    const factInterval = setInterval(() => {
      setCurrentFact(prev => (prev + 1) % funFacts.length);
    }, 4000);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 99));
    }, 700);

    return () => {
      clearInterval(factInterval);
      clearInterval(progressInterval);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-50">
      <LoadingSpinner className="mb-8" />
      
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-2">
          <h3 className="text-xl font-semibold text-gray-800">{message}</h3>
          <p className="text-sm text-gray-600">Please wait while we prepare your dashboard</p>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-brand-blue h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Fun fact card */}
        <div className="bg-white/80 p-4 rounded-lg shadow-sm border border-gray-100">
          <p className="text-sm text-gray-700 text-center animate-fade-in">
            {funFacts[currentFact]}
          </p>
        </div>
      </div>
    </div>
  );
}