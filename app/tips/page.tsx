"use client";

import { useState, useEffect } from "react";
import type { EnergyTip } from "@/lib/types";
import { toggleBookmark, getBookmarkedTipIds } from "@/lib/storage";
import BottomNav from "@/components/BottomNav";

const TIPS: (EnergyTip & { extended: string })[] = [
  {
    id: "1",
    title: "Set AC to 25\u00B0C",
    description:
      "Don\u2019t freeze yourself! 25\u00B0C is cool enough and saves big cash. Every degree lower chops more units.",
    extended:
      "Each degree below 25\u00B0C increases energy use by 3-5%. At 20\u00B0C your AC works nearly twice as hard. Use a fan alongside AC to feel cooler at a higher temp setting.",
    category: "cooling",
    icon: "ac_unit",
    iconColor: "text-blue-400",
  },
  {
    id: "2",
    title: "Check Fridge Seals",
    description:
      "Loose seals leak cold air. If a paper slides out easily when the door is closed, your money is leaking too.",
    extended:
      "A faulty fridge seal can increase energy use by 20-30%. Test with a dollar bill: close the door on it. If it slides out easily, replace the seal. Also keep the fridge at least 70% full for best efficiency.",
    category: "kitchen",
    icon: "kitchen",
    iconColor: "text-cyan-400",
  },
  {
    id: "3",
    title: "Iron in Bulk",
    description:
      "Iron all your shirts at once. Heating up the iron repeatedly just wastes units. Do it one time!",
    extended:
      "An iron uses 1000-3000W. Each heat-up cycle wastes 5-10 minutes of full power. Ironing everything in one session can save up to 30% of ironing energy. Start with delicates (low heat) and finish with heavy fabrics.",
    category: "appliances",
    icon: "iron",
    iconColor: "text-orange-400",
  },
  {
    id: "4",
    title: "Use LED Bulbs",
    description:
      "Switch to LEDs. They shine bright but chop very little current compared to those old yellow bulbs.",
    extended:
      "A 10W LED gives the same light as a 60W incandescent bulb \u2014 that\u2019s 83% less energy. LEDs last 25,000+ hours vs 1,000 for old bulbs. The upfront cost pays for itself within months.",
    category: "lighting",
    icon: "lightbulb",
    iconColor: "text-yellow-400",
  },
  {
    id: "5",
    title: "Unplug Chargers",
    description:
      "Phone full? Comot the plug. Even if not charging, the charger still chops small small power.",
    extended:
      "Standby power (phantom load) accounts for 5-10% of home electricity use. Phone chargers, TV boxes, game consoles \u2014 all draw power when plugged in. Use power strips to easily cut off multiple devices.",
    category: "habits",
    icon: "power_off",
    iconColor: "text-red-400",
  },
  {
    id: "6",
    title: "Fan Over AC",
    description:
      "Ceiling fans use way less power than AC. Try the fan first before you turn on the big machine.",
    extended:
      "A ceiling fan uses about 75W vs 1,500W+ for an AC. That\u2019s 20x less energy! Fans don\u2019t cool the air but create a wind-chill effect. In mild weather, a fan alone can keep you comfortable.",
    category: "cooling",
    icon: "mode_fan",
    iconColor: "text-teal-400",
  },
  {
    id: "7",
    title: "Cool Food First",
    description:
      "Don\u2019t put hot Jollof inside the fridge. Let it cool down outside first, or your fridge will overwork.",
    extended:
      "Hot food raises the fridge\u2019s internal temperature, forcing the compressor to work overtime. Let food cool to room temperature (within 2 hours for food safety) before refrigerating. This can reduce fridge energy use by 10-15%.",
    category: "kitchen",
    icon: "soup_kitchen",
    iconColor: "text-rose-400",
  },
  {
    id: "8",
    title: "Full Loads Only",
    description:
      "Wait until you have plenty dirty clothes. Running the machine for two shirts is a waste of cash.",
    extended:
      "A washing machine uses roughly the same energy whether it\u2019s quarter-full or completely full. Running full loads can cut your laundry energy use in half. Also, cold water washes save 75-90% of the energy used for heating water.",
    category: "appliances",
    icon: "local_laundry_service",
    iconColor: "text-indigo-400",
  },
];

const CATEGORIES = [
  { key: "all", label: "All Tips", icon: "" },
  { key: "saved", label: "Saved", icon: "bookmark" },
  { key: "kitchen", label: "Kitchen", icon: "kitchen" },
  { key: "cooling", label: "Cooling", icon: "ac_unit" },
  { key: "lighting", label: "Lighting", icon: "lightbulb" },
  { key: "appliances", label: "Appliances", icon: "devices" },
];

const ICON_STYLES: Record<
  string,
  { bg: string; text: string; hoverBg: string }
> = {
  "text-blue-400": {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    hoverBg: "group-hover:bg-blue-500",
  },
  "text-cyan-400": {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    hoverBg: "group-hover:bg-cyan-500",
  },
  "text-orange-400": {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    hoverBg: "group-hover:bg-orange-500",
  },
  "text-yellow-400": {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    hoverBg: "group-hover:bg-yellow-500",
  },
  "text-red-400": {
    bg: "bg-red-500/10",
    text: "text-red-400",
    hoverBg: "group-hover:bg-red-500",
  },
  "text-teal-400": {
    bg: "bg-teal-500/10",
    text: "text-teal-400",
    hoverBg: "group-hover:bg-teal-500",
  },
  "text-rose-400": {
    bg: "bg-rose-500/10",
    text: "text-rose-400",
    hoverBg: "group-hover:bg-rose-500",
  },
  "text-indigo-400": {
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    hoverBg: "group-hover:bg-indigo-500",
  },
};

export default function TipsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [expandedTip, setExpandedTip] = useState<string | null>(null);
  const [bookmarks, setBookmarks] = useState<Set<string>>(new Set());

  // Load bookmarks on mount
  useEffect(() => {
    setBookmarks(new Set(getBookmarkedTipIds()));
  }, []);

  const handleBookmark = (tipId: string) => {
    navigator.vibrate?.(30);
    const nowBookmarked = toggleBookmark(tipId);
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (nowBookmarked) {
        next.add(tipId);
      } else {
        next.delete(tipId);
      }
      return next;
    });
  };

  const filtered = TIPS.filter((tip) => {
    if (activeCategory === "saved") {
      return bookmarks.has(tip.id);
    }
    const matchesCategory =
      activeCategory === "all" || tip.category === activeCategory;
    const matchesSearch =
      search === "" ||
      tip.title.toLowerCase().includes(search.toLowerCase()) ||
      tip.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark font-display text-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-xl border-b border-white/[0.06] bg-bg-dark/80">
        <div className="px-4 sm:px-6 max-w-[1200px] mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="size-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 text-blue-400">
              <span className="material-symbols-outlined text-2xl">bolt</span>
            </div>
            <h2 className="text-white text-xl font-extrabold tracking-tight">
              ChopMeter
            </h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 px-4 sm:px-6 py-6 max-w-[1200px] mx-auto w-full pb-24">
        {/* Hero Banner */}
        <div className="glass-card gradient-hero p-6 md:p-10 relative overflow-hidden mb-6">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/20">
              <span className="material-symbols-outlined text-sm">
                tips_and_updates
              </span>
              Chop Smart
            </div>
            <h1 className="text-white text-3xl md:text-4xl font-black leading-tight mb-3">
              Make your meter{" "}
              <span className="gradient-primary-text">run slow</span> like tortoise
            </h1>
            <p className="text-gray-400 text-base md:text-lg font-medium mb-6 max-w-lg">
              Cut down your electricity bill with these simple changes. Save
              money for better things, charley!
            </p>
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tips (e.g., 'Fridge', 'AC', 'Ironing')..."
                className="block w-full p-3.5 pl-12 text-sm text-white bg-white/[0.03] border border-white/[0.06] rounded-xl placeholder-gray-500 shadow-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 text-sm font-bold transition-all ${
                activeCategory === cat.key
                  ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white shadow-lg shadow-blue-500/20"
                  : "bg-white/[0.03] border border-white/[0.06] text-gray-300 hover:border-blue-500/50 hover:text-white"
              }`}
            >
              {cat.icon && (
                <span className="material-symbols-outlined text-lg">
                  {cat.icon}
                </span>
              )}
              {cat.label}
              {cat.key === "saved" && bookmarks.size > 0 && (
                <span className="text-xs bg-blue-500/20 text-blue-400 rounded-full size-5 flex items-center justify-center">
                  {bookmarks.size}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tips Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((tip) => {
            const iconStyle = ICON_STYLES[tip.iconColor] ?? {
              bg: "bg-gray-500/10",
              text: "text-gray-400",
              hoverBg: "group-hover:bg-gray-500",
            };
            const isExpanded = expandedTip === tip.id;
            const isSaved = bookmarks.has(tip.id);

            return (
              <div
                key={tip.id}
                onClick={() =>
                  setExpandedTip(isExpanded ? null : tip.id)
                }
                className={`flex flex-col gap-4 rounded-2xl border p-5 transition-all group cursor-pointer active:scale-[0.98] backdrop-blur-xl ${
                  isExpanded
                    ? "border-blue-500/50 bg-white/[0.05] shadow-lg shadow-blue-500/5"
                    : "border-white/[0.06] bg-white/[0.03] hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5"
                }`}
              >
                <div
                  className={`size-12 rounded-lg flex items-center justify-center ${iconStyle.bg} ${iconStyle.text} ${iconStyle.hoverBg} group-hover:text-white transition-colors`}
                >
                  <span className="material-symbols-outlined text-3xl">
                    {tip.icon}
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-white text-lg font-bold leading-tight group-hover:text-blue-400 transition-colors">
                    {tip.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {tip.description}
                  </p>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div className="mt-2 pt-3 border-t border-white/[0.06] animate-fade-in-up">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {tip.extended}
                      </p>
                    </div>
                  )}
                </div>
                <div className="mt-auto pt-4 flex items-center justify-between border-t border-white/[0.06]">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                    {tip.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookmark(tip.id);
                    }}
                    className={`transition-colors ${
                      isSaved
                        ? "text-blue-400"
                        : "text-gray-500 hover:text-white"
                    }`}
                  >
                    <span
                      className={`material-symbols-outlined ${
                        isSaved ? "filled" : ""
                      }`}
                    >
                      bookmark
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-gray-600 text-5xl mb-4 block">
              {activeCategory === "saved" ? "bookmark_border" : "search_off"}
            </span>
            <p className="text-gray-400">
              {activeCategory === "saved"
                ? "No saved tips yet. Tap the bookmark icon on any tip to save it."
                : "No tips found. Try a different search term."}
            </p>
          </div>
        )}
      </div>

      <BottomNav active="tips" />
    </div>
  );
}
