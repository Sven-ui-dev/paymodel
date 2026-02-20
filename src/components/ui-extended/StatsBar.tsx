"use client";

import { cn } from "@/lib/utils";

interface StatsBarProps {
  modelCount: number;
  providerCount: number;
}

export function StatsBar({ modelCount, providerCount }: StatsBarProps) {
  const stats = [
    { label: "AI-MODELLE", value: modelCount },
    { label: "ANBIETER", value: providerCount },
    { label: "24h PREIS-UPDATES", value: true, highlight: false },
    { label: "Ø EINSPARPOTENZIAL", value: "60%", highlight: true },
  ];

  return (
    <div className="bg-primary/5 border-y py-3">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm">
          {stats.map((stat, index) => (
            <div 
              key={stat.label} 
              className={cn(
                "flex items-center gap-1.5 sm:gap-2",
                index > 2 && "hidden sm:flex"
              )}
            >
              {typeof stat.value === "number" ? (
                <span className="font-bold">{stat.value}</span>
              ) : stat.highlight ? (
                <span className="font-bold text-green-600">{stat.value}</span>
              ) : (
                <span className="font-bold">{stat.label.split(" ")[0]}</span>
              )}
              <span className="text-muted-foreground">{stat.label}</span>
              {index < stats.length - 1 && (
                <span className="text-muted-foreground/30 hidden sm:inline">|</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
