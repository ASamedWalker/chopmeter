"use client";

import { useState, useRef, useEffect } from "react";
import type { Meter } from "@/lib/types";
import {
  Home,
  Store,
  Building,
  Warehouse,
  Factory,
  ChevronDown,
  Check,
  Plus,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  store: Store,
  building: Building,
  warehouse: Warehouse,
  factory: Factory,
};

export function getMeterIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] ?? Home;
}

interface MeterSwitcherProps {
  meters: Meter[];
  activeMeter: Meter;
  onSwitch: (meter: Meter) => void;
  onAddNew: () => void;
}

export default function MeterSwitcher({
  meters,
  activeMeter,
  onSwitch,
  onAddNew,
}: MeterSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const ActiveIcon = getMeterIcon(activeMeter.icon);

  return (
    <div ref={containerRef} className="relative mb-4 animate-fade-in-up">
      {/* Collapsed trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] hover:border-blue-500/30 transition-colors active:scale-[0.98]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="size-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${activeMeter.color}20` }}
          >
            <ActiveIcon size={18} style={{ color: activeMeter.color }} />
          </div>
          <div className="text-left min-w-0">
            <p className="text-white font-bold text-sm truncate">{activeMeter.name}</p>
            {activeMeter.meterNumber && (
              <p className="text-gray-500 text-[10px] font-medium truncate">
                #{activeMeter.meterNumber}
              </p>
            )}
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-500 transition-transform shrink-0 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-[#0E1225]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden animate-fade-in-up">
          <div className="py-1">
            {meters.map((meter) => {
              const Icon = getMeterIcon(meter.icon);
              const isActive = meter.id === activeMeter.id;
              return (
                <button
                  key={meter.id}
                  onClick={() => {
                    onSwitch(meter);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-white/[0.05]"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="size-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${meter.color}20` }}
                    >
                      <Icon size={18} style={{ color: meter.color }} />
                    </div>
                    <div className="text-left min-w-0">
                      <p className="text-white font-semibold text-sm truncate">
                        {meter.name}
                      </p>
                      {meter.meterNumber && (
                        <p className="text-gray-500 text-[10px] truncate">
                          #{meter.meterNumber}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {meter.isDefault && (
                      <span className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                    {isActive && (
                      <Check size={16} className="text-blue-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="border-t border-white/[0.06]">
            <button
              onClick={() => {
                onAddNew();
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
            >
              <div className="size-9 rounded-xl bg-white/[0.05] border border-dashed border-white/[0.15] flex items-center justify-center">
                <Plus size={16} className="text-gray-400" />
              </div>
              <p className="text-gray-400 font-semibold text-sm">Add New Meter</p>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
