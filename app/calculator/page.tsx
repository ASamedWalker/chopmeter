"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calculator,
  Search,
  RotateCcw,
  Zap,
  Snowflake,
  Fan,
  Thermometer,
  Coffee,
  CookingPot,
  Lightbulb,
  Shirt,
  Monitor,
  Laptop,
  Smartphone,
  Volume2,
  Droplets,
  Wind,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { APPLIANCES, CATEGORIES } from "@/lib/appliances";
import type { Appliance } from "@/lib/appliances";
import { getSettings } from "@/lib/storage";
import { getCountry } from "@/lib/countries";
import BottomNav from "@/components/BottomNav";

const ICON_MAP: Record<string, LucideIcon> = {
  snowflake: Snowflake,
  fan: Fan,
  thermometer: Thermometer,
  zap: Zap,
  coffee: Coffee,
  cooking_pot: CookingPot,
  lightbulb: Lightbulb,
  shirt: Shirt,
  monitor: Monitor,
  laptop: Laptop,
  smartphone: Smartphone,
  volume_2: Volume2,
  droplets: Droplets,
  wind: Wind,
};

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  cooling: { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/30" },
  kitchen: { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/30" },
  lighting: { bg: "bg-yellow-500/10", text: "text-yellow-400", border: "border-yellow-500/30" },
  laundry: { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/30" },
  entertainment: { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/30" },
  other: { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30" },
};

interface SelectedAppliance {
  hours: number;
}

export default function CalculatorPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, SelectedAppliance>>({});
  const [tariffRate, setTariffRate] = useState(2.0);
  const [currencySymbol, setCurrencySymbol] = useState("GH\u20B5");

  useEffect(() => {
    const settings = getSettings();
    setTariffRate(settings.tariffRate);
    const country = getCountry(settings.countryCode);
    setCurrencySymbol(country.currencySymbol);
  }, []);

  const filtered = useMemo(() => {
    return APPLIANCES.filter((a) => {
      const matchesCategory = activeCategory === "all" || a.category === activeCategory;
      const matchesSearch =
        search === "" ||
        a.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, search]);

  const toggleAppliance = (appliance: Appliance) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[appliance.id]) {
        delete next[appliance.id];
      } else {
        next[appliance.id] = { hours: appliance.defaultHours };
      }
      return next;
    });
  };

  const updateHours = (id: string, hours: number) => {
    setSelected((prev) => ({
      ...prev,
      [id]: { hours },
    }));
  };

  const resetAll = () => {
    setSelected({});
  };

  const summary = useMemo(() => {
    let totalDailyKwh = 0;
    let totalDailyCost = 0;
    let count = 0;

    for (const appliance of APPLIANCES) {
      const sel = selected[appliance.id];
      if (!sel) continue;
      count++;
      const dailyKwh = (appliance.wattage * sel.hours) / 1000;
      totalDailyKwh += dailyKwh;
      totalDailyCost += dailyKwh * tariffRate;
    }

    return {
      count,
      totalDailyKwh,
      totalDailyCost,
      totalMonthlyCost: totalDailyCost * 30,
    };
  }, [selected, tariffRate]);

  const getDailyCost = (appliance: Appliance, hours: number) => {
    const dailyKwh = (appliance.wattage * hours) / 1000;
    return dailyKwh * tariffRate;
  };

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark font-display text-gray-50">
      <div className="flex-1 px-4 sm:px-6 pt-6 max-w-[1200px] mx-auto w-full pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 animate-fade-in-up">
          <button
            onClick={() => router.back()}
            className="size-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-300 hover:text-white hover:border-blue-500/50 transition-colors active:scale-[0.95]"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-white text-2xl font-extrabold tracking-tight flex items-center gap-2">
              <Calculator size={24} className="text-blue-400" />
              Appliance Calculator
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">
              See which appliances cost you the most
            </p>
          </div>
          {summary.count > 0 && (
            <button
              onClick={resetAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-gray-400 text-xs font-bold hover:text-white hover:border-red-500/50 transition-colors active:scale-[0.95]"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-4 animate-fade-in-up" style={{ animationDelay: "50ms" }}>
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            <Search size={20} />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search appliances..."
            className="block w-full p-3.5 pl-12 text-sm text-white bg-white/[0.03] border border-white/[0.06] rounded-xl placeholder-gray-500 shadow-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-6 animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 text-sm font-bold transition-all ${
                activeCategory === cat.id
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/[0.03] border border-white/[0.06] text-gray-300 hover:border-blue-500/50 hover:text-white"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Summary Panel */}
        {summary.count > 0 && (
          <div className="glass-card gradient-hero p-5 mb-6 animate-fade-in-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Selected
                </p>
                <p className="text-white text-xl font-bold">
                  {summary.count}
                  <span className="text-gray-500 text-sm font-medium ml-1">items</span>
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Daily kWh
                </p>
                <p className="text-white text-xl font-bold">
                  {summary.totalDailyKwh.toFixed(1)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Daily Cost
                </p>
                <p className="text-xl font-bold gradient-primary-text">
                  {currencySymbol} {summary.totalDailyCost.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                  Monthly Cost
                </p>
                <p className="text-xl font-bold gradient-primary-text">
                  {currencySymbol} {summary.totalMonthlyCost.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Appliance Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((appliance, idx) => {
            const isSelected = !!selected[appliance.id];
            const sel = selected[appliance.id];
            const colors = CATEGORY_COLORS[appliance.category];
            const Icon = ICON_MAP[appliance.icon] ?? Zap;

            return (
              <div
                key={appliance.id}
                className={`flex flex-col gap-3 rounded-2xl border p-4 transition-all backdrop-blur-xl cursor-pointer active:scale-[0.98] ${
                  isSelected
                    ? `border-blue-500/50 bg-white/[0.05] shadow-lg shadow-blue-500/5`
                    : "border-white/[0.06] bg-white/[0.03] hover:border-blue-500/30"
                }`}
                style={{
                  animationDelay: `${(idx % 12) * 50 + 150}ms`,
                  animation: "fade-in-up 0.4s ease-out both",
                }}
                onClick={() => toggleAppliance(appliance)}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`size-11 rounded-xl flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} transition-colors`}
                  >
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm truncate">
                      {appliance.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
                        {appliance.wattage}W
                      </span>
                      <span className="text-gray-500 text-xs capitalize">
                        {appliance.category}
                      </span>
                    </div>
                  </div>
                  {/* Toggle indicator */}
                  <div
                    className={`w-11 h-6 rounded-full flex items-center transition-colors shrink-0 ${
                      isSelected
                        ? "bg-gradient-to-r from-blue-500 to-violet-500"
                        : "bg-white/[0.08]"
                    }`}
                  >
                    <div
                      className={`size-5 rounded-full bg-white shadow-md transition-transform mx-0.5 ${
                        isSelected ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded controls when selected */}
                {isSelected && sel && (
                  <div
                    className="pt-3 border-t border-white/[0.06] animate-fade-in-up"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Hours per day
                      </label>
                      <span className="text-white text-sm font-bold">
                        {sel.hours.toFixed(1)}h
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="24"
                      step="0.1"
                      value={sel.hours}
                      onChange={(e) =>
                        updateHours(appliance.id, parseFloat(e.target.value))
                      }
                      className="w-full h-2 rounded-full appearance-none bg-white/[0.08] accent-blue-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0.1h</span>
                      <span>24h</span>
                    </div>

                    <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div>
                        <p className="text-gray-400 text-xs">Daily cost</p>
                        <p className="text-white font-bold text-sm">
                          {currencySymbol}{" "}
                          {getDailyCost(appliance, sel.hours).toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Monthly cost</p>
                        <p className="gradient-primary-text font-bold text-sm">
                          {currencySymbol}{" "}
                          {(getDailyCost(appliance, sel.hours) * 30).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Search size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">
              No appliances found. Try a different search term.
            </p>
          </div>
        )}
      </div>

      <BottomNav active="dashboard" />
    </div>
  );
}
