"use client";

import { useState, useEffect, useRef } from "react";
import PullToRefresh from "@/components/PullToRefresh";
import { useRouter } from "next/navigation";
import {
  getSettings,
  saveSettings,
  getAllReadings,
  clearAllData,
  getReminderSettings,
  saveReminderSettings,
  getMeters,
  saveMeter,
  deleteMeter as deleteStorageMeter,
  setDefaultMeter,
  generateId,
} from "@/lib/storage";
import { COUNTRIES, getCountry, type CountryConfig } from "@/lib/countries";
import type { UserSettings, Meter } from "@/lib/types";
import type { ReminderSettings } from "@/lib/notifications";
import {
  requestNotificationPermission,
  getNotificationStatus,
} from "@/lib/notifications";
import { getMeterIcon } from "@/components/MeterSwitcher";
import {
  Zap,
  Globe,
  ChevronDown,
  Gauge,
  RotateCcw,
  Database,
  Download,
  FileText,
  Trash2,
  ChevronRight,
  User,
  Target,
  Bell,
  BellOff,
  AlertTriangle,
  Clock,
  Calendar,
  Plus,
  Pencil,
  X,
  Check,
  Home,
  Store,
  Building,
  Warehouse,
  Factory,
  Sun,
  Moon,
  Monitor,
  Palette,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { ChopMeterLogo, ChopMeterTagline } from "@/components/ChopMeterLogo";
import { useTheme } from "@/lib/ThemeContext";
import BottomNav from "@/components/BottomNav";
import { getAllAchievements, getProgressHint, getAchievementStats } from "@/lib/achievements";
import { getStreakData } from "@/lib/streak";
import type { Achievement, UserProgress } from "@/lib/types";
import ShareCard from "@/components/ShareCard";
import {
  ScanLine,
  Wallet as WalletIcon,
  PlusCircle,
  Activity,
  Flame,
  Award,
  Crown,
  ShieldCheck,
  Eye,
  Search,
  Trophy,
  TrendingDown,
} from "lucide-react";

const METER_ICONS: { name: string; icon: LucideIcon; label: string }[] = [
  { name: "home", icon: Home, label: "Home" },
  { name: "store", icon: Store, label: "Shop" },
  { name: "building", icon: Building, label: "Office" },
  { name: "warehouse", icon: Warehouse, label: "Warehouse" },
  { name: "factory", icon: Factory, label: "Factory" },
];

const METER_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#EC4899",
];

export default function SettingsPage() {
  const router = useRouter();
  const { theme, isDark, setTheme } = useTheme();
  const [settings, setSettingsLocal] = useState<UserSettings | null>(null);
  const [country, setCountry] = useState<CountryConfig>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [meterNumber, setMeterNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [tariff, setTariff] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const [reminders, setReminders] = useState<ReminderSettings | null>(null);
  const [notifStatus, setNotifStatus] = useState<"granted" | "denied" | "default" | "unsupported">("default");

  // Multi-meter state
  const [meters, setMetersLocal] = useState<Meter[]>([]);
  const [editingMeter, setEditingMeter] = useState<Meter | null>(null);
  const [showMeterForm, setShowMeterForm] = useState(false);
  const [meterFormName, setMeterFormName] = useState("");
  const [meterFormNumber, setMeterFormNumber] = useState("");
  const [meterFormIcon, setMeterFormIcon] = useState("home");
  const [meterFormColor, setMeterFormColor] = useState(METER_COLORS[0]);
  const [deletingMeterId, setDeletingMeterId] = useState<string | null>(null);
  const [sharingBadge, setSharingBadge] = useState<Achievement | null>(null);

  useEffect(() => {
    const s = getSettings();
    if (!s.onboardingComplete) {
      router.replace("/onboarding");
      return;
    }
    setSettingsLocal(s);
    setCountry(getCountry(s.countryCode));
    setMeterNumber(s.meterNumber);
    setBalance(s.lastBalance.toString());
    setTariff(s.tariffRate.toString());
    setDisplayName(s.displayName || "");
    setBudgetAmount(s.monthlyBudget > 0 ? s.monthlyBudget.toString() : "");
    setReminders(getReminderSettings());
    setNotifStatus(getNotificationStatus());
    setMetersLocal(getMeters());

    // Auto-open add meter form if navigated with ?addMeter=1
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("addMeter") === "1") {
        setShowMeterForm(true);
        setEditingMeter(null);
        resetMeterForm();
      }
    }
  }, [router]);

  const savingRef = useRef(false);
  const flash = (msg: string) => {
    setSaved(msg);
    savingRef.current = false;
    setTimeout(() => setSaved(null), 2000);
  };
  const guardSave = (fn: () => void) => {
    if (savingRef.current) return;
    savingRef.current = true;
    fn();
  };

  const handleCountryChange = (c: CountryConfig) => {
    setCountry(c);
    setShowCountryPicker(false);
    const isOverridden = settings?.tariffOverridden ?? false;
    if (!isOverridden) {
      setTariff(c.defaultTariff.toString());
    }
    saveSettings({
      countryCode: c.code,
      tariffRate: isOverridden
        ? parseFloat(tariff) || c.defaultTariff
        : c.defaultTariff,
    });
    flash("Country updated");
  };

  const sanitize = (s: string) => s.replace(/<[^>]*>/g, "").trim();

  const handleSaveProfile = () => {
    const clean = sanitize(displayName);
    if (!clean) {
      flash("Please enter a display name");
      return;
    }
    if (clean.length > 50) {
      flash("Name must be 50 characters or less");
      return;
    }
    setDisplayName(clean);
    saveSettings({ displayName: clean });
    flash("Profile updated");
  };

  const handleSaveMeter = () => {
    const balNum = Math.min(999999.99, Math.max(0, parseFloat(balance) || 0));
    const tarNum = Math.min(99.99, Math.max(0, parseFloat(tariff) || country.defaultTariff));
    const cleanMeter = sanitize(meterNumber);
    setMeterNumber(cleanMeter);
    setBalance(balNum.toString());
    saveSettings({
      meterNumber: cleanMeter,
      lastBalance: balNum,
      lastBalanceDate: Date.now(),
      tariffRate: tarNum,
      tariffOverridden: tarNum !== country.defaultTariff,
    });
    flash("Meter details saved");
  };

  const updateReminder = async (partial: Partial<ReminderSettings>) => {
    const updated = { ...reminders!, ...partial };
    // If enabling notifications, request permission first
    if (partial.enabled && !reminders?.enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setNotifStatus(getNotificationStatus());
        flash("Notification permission denied");
        return;
      }
      setNotifStatus("granted");
    }
    saveReminderSettings(updated);
    setReminders(updated);
    flash("Notification settings updated");
  };

  const handleResetTariff = () => {
    setTariff(country.defaultTariff.toString());
    saveSettings({
      tariffRate: country.defaultTariff,
      tariffOverridden: false,
    });
    flash("Tariff reset to default");
  };

  const handleClearAll = () => {
    clearAllData();
    setShowClearConfirm(false);
    router.replace("/onboarding");
  };

  const handleExportCSV = () => {
    const readings = getAllReadings();
    if (readings.length === 0) {
      flash("No readings to export");
      return;
    }
    const header = "ID,Value (kWh),Timestamp,Source\n";
    const rows = readings
      .map(
        (r) =>
          `${r.id},${r.value},${new Date(r.timestamp).toISOString()},${r.source}`
      )
      .join("\n");
    const csv = header + rows;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chopmeter-readings-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    flash("CSV exported");
  };

  // --- Meter management ---

  const resetMeterForm = () => {
    setMeterFormName("");
    setMeterFormNumber("");
    setMeterFormIcon("home");
    setMeterFormColor(METER_COLORS[0]);
  };

  const openEditMeter = (meter: Meter) => {
    setEditingMeter(meter);
    setMeterFormName(meter.name);
    setMeterFormNumber(meter.meterNumber);
    setMeterFormIcon(meter.icon);
    setMeterFormColor(meter.color);
    setShowMeterForm(true);
  };

  const handleSaveMeterForm = () => {
    if (!meterFormName.trim()) return;

    if (editingMeter) {
      // Editing existing meter
      const updated: Meter = {
        ...editingMeter,
        name: meterFormName.trim(),
        meterNumber: meterFormNumber.trim(),
        icon: meterFormIcon,
        color: meterFormColor,
      };
      saveMeter(updated);
      flash("Meter updated");
    } else {
      // Adding new meter
      const newMeter: Meter = {
        id: generateId(),
        name: meterFormName.trim(),
        meterNumber: meterFormNumber.trim(),
        icon: meterFormIcon,
        color: meterFormColor,
        isDefault: meters.length === 0,
        createdAt: Date.now(),
      };
      saveMeter(newMeter);
      flash("Meter added");
    }

    setShowMeterForm(false);
    setEditingMeter(null);
    resetMeterForm();
    setMetersLocal(getMeters());
  };

  const handleDeleteMeter = (id: string) => {
    deleteStorageMeter(id);
    setDeletingMeterId(null);
    setMetersLocal(getMeters());
    flash("Meter deleted");
  };

  const handleSetDefault = (id: string) => {
    setDefaultMeter(id);
    setMetersLocal(getMeters());
    flash("Default meter updated");
  };

  if (!settings) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-bg-dark">
        <Zap size={48} className="text-blue-400 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark font-display text-gray-50">
      {/* Flash message */}
      {saved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm rounded-full shadow-lg animate-fade-in-up">
          {saved}
        </div>
      )}

      <PullToRefresh onRefresh={() => window.location.reload()}>
      <div className="flex-1 px-4 sm:px-6 py-6 max-w-[600px] mx-auto w-full pb-28 space-y-6">
        {/* Profile */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-400" />
            Profile
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={50}
                placeholder="e.g. Kofi"
                className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">
                Used for personalized greetings on the dashboard
              </p>
            </div>

            <button
              onClick={() => guardSave(handleSaveProfile)}
              disabled={!displayName.trim()}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Profile
            </button>
          </div>
        </section>

        {/* Meters */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Gauge size={18} className="text-blue-400" />
            Meters
          </h3>

          <div className="space-y-3">
            {meters.map((meter) => {
              const Icon = getMeterIcon(meter.icon);
              const isDeleting = deletingMeterId === meter.id;
              return (
                <div key={meter.id} className="relative">
                  {isDeleting && (
                    <div className="absolute inset-0 z-20 bg-bg-dark/95 backdrop-blur-sm rounded-xl flex items-center justify-center gap-3 animate-fade-in-up">
                      <span className="text-gray-400 text-sm">Delete this meter?</span>
                      <button
                        onClick={() => setDeletingMeterId(null)}
                        className="px-3 py-1.5 rounded-lg border border-white/[0.06] text-gray-300 text-sm font-bold hover:bg-white/[0.05] transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteMeter(meter.id)}
                        className="px-3 py-1.5 rounded-lg bg-danger text-white text-sm font-bold hover:brightness-110 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div
                      className="size-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${meter.color}20` }}
                    >
                      <Icon size={20} style={{ color: meter.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-bold text-sm truncate">{meter.name}</p>
                        {meter.isDefault && (
                          <span className="text-[10px] text-blue-400 font-semibold uppercase tracking-wider bg-blue-500/10 px-1.5 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      {meter.meterNumber && (
                        <p className="text-gray-500 text-xs truncate">#{meter.meterNumber}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!meter.isDefault && (
                        <button
                          onClick={() => handleSetDefault(meter.id)}
                          className="size-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                          title="Set as default"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => openEditMeter(meter)}
                        className="size-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-blue-400 hover:border-blue-500/30 transition-colors"
                        title="Edit meter"
                      >
                        <Pencil size={14} />
                      </button>
                      {meters.length > 1 && (
                        <button
                          onClick={() => setDeletingMeterId(meter.id)}
                          className="size-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-500 hover:text-red-400 hover:border-red-500/30 transition-colors"
                          title="Delete meter"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Add / Edit Meter Form */}
            {showMeterForm ? (
              <div className="p-4 rounded-xl bg-white/[0.03] border border-blue-500/20 space-y-4 animate-fade-in-up">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold text-sm">
                    {editingMeter ? "Edit Meter" : "Add New Meter"}
                  </h4>
                  <button
                    onClick={() => {
                      setShowMeterForm(false);
                      setEditingMeter(null);
                      resetMeterForm();
                    }}
                    className="size-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={meterFormName}
                    onChange={(e) => setMeterFormName(e.target.value)}
                    placeholder="e.g. Home, Shop, Rental"
                    className="w-full h-11 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold px-3 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Meter Number */}
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Meter Number
                  </label>
                  <input
                    type="text"
                    value={meterFormNumber}
                    onChange={(e) => setMeterFormNumber(e.target.value)}
                    placeholder="e.g. 01234567890"
                    className="w-full h-11 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold px-3 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Icon Picker */}
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Icon
                  </label>
                  <div className="flex gap-2">
                    {METER_ICONS.map((item) => {
                      const MIcon = item.icon;
                      const isSelected = meterFormIcon === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={() => setMeterFormIcon(item.name)}
                          className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all flex-1 ${
                            isSelected
                              ? "border-blue-500 bg-blue-500/10"
                              : "border-white/[0.06] hover:border-blue-500/30"
                          }`}
                        >
                          <MIcon size={20} className={isSelected ? "text-blue-400" : "text-gray-400"} />
                          <span className={`text-[10px] font-medium ${isSelected ? "text-blue-400" : "text-gray-500"}`}>
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Color Picker */}
                <div>
                  <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                    Color
                  </label>
                  <div className="flex gap-2">
                    {METER_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => setMeterFormColor(color)}
                        className={`size-9 rounded-full border-2 transition-all ${
                          meterFormColor === color
                            ? "border-white scale-110"
                            : "border-transparent hover:border-white/30"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                {/* Save */}
                <button
                  onClick={handleSaveMeterForm}
                  disabled={!meterFormName.trim()}
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingMeter ? "Update Meter" : "Add Meter"}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setShowMeterForm(true);
                  setEditingMeter(null);
                  resetMeterForm();
                }}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/[0.1] text-gray-400 hover:text-white hover:border-blue-500/30 transition-colors"
              >
                <Plus size={18} />
                <span className="font-bold text-sm">Add Meter</span>
              </button>
            )}
          </div>
        </section>

        {/* Achievements */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-400" />
            Achievements
            <span className="ml-auto text-gray-500 text-xs font-medium normal-case tracking-normal">
              {getAchievementStats().unlocked}/{getAchievementStats().total}
            </span>
          </h3>

          <div className="grid grid-cols-3 gap-3">
            {getAllAchievements().map((badge) => {
              const BADGE_ICON_MAP: Record<string, React.ElementType> = {
                "scan-line": ScanLine, wallet: WalletIcon, "plus-circle": PlusCircle,
                activity: Activity, flame: Flame, target: Target, award: Award,
                crown: Crown, "shield-check": ShieldCheck, eye: Eye, search: Search,
                trophy: Trophy, "trending-down": TrendingDown,
              };
              const Icon = BADGE_ICON_MAP[badge.icon] || Award;
              const unlocked = badge.unlockedAt !== null;
              const streakData = getStreakData();
              const progress: UserProgress = {
                totalScans: streakData.totalScans,
                currentStreak: streakData.currentStreak,
                longestStreak: streakData.longestStreak,
                totalTopUps: 0,
                budgetSet: false,
                budgetUnderCount: 0,
                healthCheckRun: false,
                healthGrade: null,
                spikeDetected: false,
                monthlySavingsPercent: 0,
              };
              const hint = !unlocked ? getProgressHint(badge.id, progress) : null;

              return (
                <div
                  key={badge.id}
                  onClick={() => unlocked && setSharingBadge(badge)}
                  className={`flex flex-col items-center text-center p-3 rounded-xl border transition-all ${
                    unlocked
                      ? "bg-white/[0.04] border-white/[0.08] cursor-pointer hover:border-blue-500/30"
                      : "bg-white/[0.01] border-white/[0.04] opacity-50"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      unlocked ? "" : "grayscale"
                    }`}
                    style={{
                      backgroundColor: unlocked ? `${badge.iconColor}20` : "rgba(255,255,255,0.04)",
                      border: `1.5px solid ${unlocked ? `${badge.iconColor}40` : "rgba(255,255,255,0.06)"}`,
                    }}
                  >
                    <Icon size={18} color={unlocked ? badge.iconColor : "#6B7280"} />
                  </div>
                  <p className="text-white text-[10px] font-bold leading-tight mb-0.5">
                    {badge.name}
                  </p>
                  {unlocked ? (
                    <p className="text-blue-400/60 text-[8px]">
                      Tap to share
                    </p>
                  ) : hint ? (
                    <p className="text-gray-600 text-[8px] leading-tight">{hint}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        {/* Monthly Budget */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Target size={18} className="text-blue-400" />
            Monthly Budget
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Budget Amount
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  {country.currencySymbol}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="999999.99"
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-14 pr-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Set a monthly spending target to track your electricity costs
              </p>
            </div>

            <button
              onClick={() => guardSave(() => {
                const val = Math.min(999999.99, Math.max(0, parseFloat(budgetAmount) || 0));
                saveSettings({ monthlyBudget: val });
                setBudgetAmount(val > 0 ? val.toString() : "");
                flash(val > 0 ? "Budget saved" : "Budget cleared");
              })}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Save Budget
            </button>
          </div>
        </section>

        {/* Notifications */}
        {reminders && (
          <section className="glass-card p-5">
            <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bell size={18} className="text-blue-400" />
              Notifications
            </h3>

            <div className="space-y-4">
              {/* Main toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-bold">Enable Notifications</p>
                  <p className="text-gray-500 text-xs">Get alerts about your electricity usage</p>
                </div>
                <button
                  onClick={() => updateReminder({ enabled: !reminders.enabled })}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    reminders.enabled ? "bg-blue-500" : "bg-white/[0.1]"
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                      reminders.enabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {reminders.enabled && (
                <div className="space-y-4 pt-2 border-t border-white/[0.06] animate-fade-in-up">
                  {/* Low Balance Alert */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-yellow-400" />
                        <p className="text-white text-sm font-bold">Low Balance Alert</p>
                      </div>
                      <button
                        onClick={() => updateReminder({ lowBalanceAlert: !reminders.lowBalanceAlert })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          reminders.lowBalanceAlert ? "bg-blue-500" : "bg-white/[0.1]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            reminders.lowBalanceAlert ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    {reminders.lowBalanceAlert && (
                      <div className="ml-6">
                        <label className="text-gray-400 text-xs">
                          Alert when credit drops below
                        </label>
                        <div className="flex items-center gap-2 mt-1">
                          <input
                            type="number"
                            min={1}
                            max={30}
                            value={reminders.lowBalanceThreshold}
                            onChange={(e) => {
                              const val = Math.max(1, Math.min(30, parseInt(e.target.value) || 3));
                              updateReminder({ lowBalanceThreshold: val });
                            }}
                            className="w-20 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold px-3 text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-gray-400 text-sm">days remaining</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Daily Check Reminder */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-blue-400" />
                        <p className="text-white text-sm font-bold">Daily Check Reminder</p>
                      </div>
                      <button
                        onClick={() => updateReminder({ dailyCheckReminder: !reminders.dailyCheckReminder })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          reminders.dailyCheckReminder ? "bg-blue-500" : "bg-white/[0.1]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            reminders.dailyCheckReminder ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                    {reminders.dailyCheckReminder && (
                      <div className="ml-6">
                        <label className="text-gray-400 text-xs">Remind me at</label>
                        <input
                          type="time"
                          value={reminders.dailyCheckTime}
                          onChange={(e) => updateReminder({ dailyCheckTime: e.target.value })}
                          className="mt-1 w-32 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                        />
                        <p className="text-gray-500 text-xs mt-1">
                          Remind me to scan my meter at this time
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Weekly Report */}
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-violet-400" />
                        <div>
                          <p className="text-white text-sm font-bold">Weekly Report</p>
                          <p className="text-gray-500 text-xs">Get a summary every Sunday</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updateReminder({ weeklyReport: !reminders.weeklyReport })}
                        className={`relative w-12 h-7 rounded-full transition-colors ${
                          reminders.weeklyReport ? "bg-blue-500" : "bg-white/[0.1]"
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            reminders.weeklyReport ? "translate-x-5" : "translate-x-0"
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Status indicator */}
                  <div className="pt-3 border-t border-white/[0.06]">
                    {notifStatus === "granted" ? (
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                        <Bell size={14} />
                        <span>Notifications permitted</span>
                      </div>
                    ) : notifStatus === "denied" ? (
                      <div className="flex items-start gap-2 text-red-400 text-xs font-medium">
                        <BellOff size={14} className="mt-0.5 shrink-0" />
                        <span>
                          Notifications blocked. Please enable them in your browser settings for this site and reload.
                        </span>
                      </div>
                    ) : notifStatus === "unsupported" ? (
                      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                        <BellOff size={14} />
                        <span>Notifications are not supported in this browser</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-yellow-400 text-xs font-medium">
                        <Bell size={14} />
                        <span>Notification permission not yet granted</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Country & Currency */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Globe size={18} className="text-blue-400" />
            Country & Currency
          </h3>

          <button
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{country.flag}</span>
              <div className="text-left">
                <p className="text-white font-bold text-sm">{country.name}</p>
                <p className="text-gray-400 text-xs">
                  {country.currencySymbol} ({country.currencyCode})
                </p>
              </div>
            </div>
            <ChevronDown
              size={20}
              className={`text-gray-400 transition-transform ${
                showCountryPicker ? "rotate-180" : ""
              }`}
            />
          </button>

          {showCountryPicker && (
            <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-in-up">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCountryChange(c)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                    c.code === country.code
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-white/[0.06] hover:border-blue-500/40"
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{c.name}</p>
                    <p className="text-gray-400 text-[10px]">
                      {c.currencySymbol}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Meter Details */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Gauge size={18} className="text-blue-400" />
            Meter Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Meter Number
              </label>
              <input
                type="text"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                maxLength={20}
                placeholder="e.g. 01234567890"
                className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Current Balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                  {country.currencySymbol}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="999999.99"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-14 pr-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Updating resets the balance date to now
              </p>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Tariff Rate (per kWh)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">
                    {country.currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    max="99.99"
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-14 pr-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={handleResetTariff}
                  className="h-12 px-3 rounded-xl border border-white/[0.06] text-gray-400 hover:border-blue-500/50 hover:text-white transition-colors"
                  title="Reset to default"
                >
                  <RotateCcw size={18} />
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Default: {country.currencySymbol} {country.defaultTariff} for{" "}
                {country.name}
              </p>
            </div>

            <button
              onClick={() => guardSave(handleSaveMeter)}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Update Meter Details
            </button>
          </div>
        </section>

        {/* Appearance */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Palette size={18} className="text-violet-400" />
            Appearance
          </h3>
          <div className="flex gap-2">
            {([
              { value: "dark" as const, label: "Dark", icon: Moon },
              { value: "light" as const, label: "Light", icon: Sun },
              { value: "system" as const, label: "System", icon: Monitor },
            ]).map((opt) => {
              const Icon = opt.icon;
              const active = theme === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border transition-all active:scale-95 ${
                    active
                      ? "bg-blue-500/15 border-blue-500/30 text-blue-400"
                      : "bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-gray-300"
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-xs font-bold">{opt.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Data Management */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database size={18} className="text-blue-400" />
            Data Management
          </h3>

          <div className="space-y-3">
            <Link
              href="/report"
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} className="text-blue-400" />
                <div className="text-left">
                  <p className="text-white text-sm font-bold">
                    Generate Report
                  </p>
                  <p className="text-gray-400 text-xs">
                    Monthly PDF summary
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </Link>

            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-blue-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Download size={20} className="text-blue-400" />
                <div className="text-left">
                  <p className="text-white text-sm font-bold">
                    Export Readings
                  </p>
                  <p className="text-gray-400 text-xs">
                    Download as CSV file
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border border-red-500/20 hover:border-red-500/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 size={20} className="text-danger" />
                <div className="text-left">
                  <p className="text-danger text-sm font-bold">
                    Clear All Data
                  </p>
                  <p className="text-gray-400 text-xs">
                    Remove all readings and settings
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-gray-400" />
            </button>

            {showClearConfirm && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 animate-fade-in-up">
                <p className="text-white text-sm font-bold mb-3">
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 h-10 rounded-lg border border-white/[0.06] text-gray-300 text-sm font-bold hover:bg-white/[0.05] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleClearAll}
                    className="flex-1 h-10 rounded-lg bg-danger text-white text-sm font-bold hover:brightness-110 transition-colors"
                  >
                    Delete Everything
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* About */}
        <section className="glass-card p-5">
          <div className="flex flex-col items-center text-center py-4">
            <div className="mb-3">
              <ChopMeterLogo size={180} color={isDark ? "#FFFFFF" : "#0A0E1A"} />
            </div>
            <ChopMeterTagline color={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"} />
            <p className="text-gray-500 text-xs mt-3">Version 1.0.0</p>
            <p className="text-gray-400 text-sm mt-3 max-w-[260px] leading-relaxed">
              Track your prepaid electricity usage and spending with ease.
            </p>
          </div>
        </section>
      </div>
      </PullToRefresh>

      <BottomNav active="settings" />

      {/* Achievement Share Modal */}
      {sharingBadge && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSharingBadge(null); }}
        >
          <div className="max-w-sm w-full">
            <ShareCard
              type="achievement"
              achievement={{
                name: sharingBadge.name,
                description: sharingBadge.description,
                tier: sharingBadge.tier,
                iconColor: sharingBadge.iconColor,
                userName: settings?.displayName || "",
              }}
            />
            <button
              onClick={() => setSharingBadge(null)}
              className="w-full mt-3 text-gray-400 text-sm font-bold py-2 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
