"use client";

import { useState, useEffect } from "react";
import PullToRefresh from "@/components/PullToRefresh";
import { useRouter } from "next/navigation";
import {
  getSettings,
  saveSettings,
  getAllReadings,
  clearAllData,
  getReminderSettings,
  saveReminderSettings,
} from "@/lib/storage";
import { COUNTRIES, getCountry, type CountryConfig } from "@/lib/countries";
import type { UserSettings } from "@/lib/types";
import type { ReminderSettings } from "@/lib/notifications";
import {
  requestNotificationPermission,
  getNotificationStatus,
} from "@/lib/notifications";
import {
  Zap,
  Globe,
  ChevronDown,
  Gauge,
  RotateCcw,
  Database,
  Download,
  Trash2,
  ChevronRight,
  User,
  Target,
  Bell,
  BellOff,
  AlertTriangle,
  Clock,
  Calendar,
} from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();
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
  }, [router]);

  const flash = (msg: string) => {
    setSaved(msg);
    setTimeout(() => setSaved(null), 2000);
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

  const handleSaveProfile = () => {
    saveSettings({ displayName: displayName.trim() });
    flash("Profile updated");
  };

  const handleSaveMeter = () => {
    const balNum = parseFloat(balance) || 0;
    const tarNum = parseFloat(tariff) || country.defaultTariff;
    saveSettings({
      meterNumber,
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
                placeholder="e.g. Kofi"
                className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold px-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <p className="text-gray-500 text-xs mt-1">
                Used for personalized greetings on the dashboard
              </p>
            </div>

            <button
              onClick={handleSaveProfile}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Save Profile
            </button>
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
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  onBlur={() => {
                    const val = parseFloat(budgetAmount) || 0;
                    saveSettings({ monthlyBudget: val });
                    flash(val > 0 ? "Budget updated" : "Budget cleared");
                  }}
                  placeholder="0.00"
                  className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-14 pr-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Set a monthly spending target to track your electricity costs
              </p>
            </div>
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
              onClick={handleSaveMeter}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Update Meter Details
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="glass-card p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <Database size={18} className="text-blue-400" />
            Data Management
          </h3>

          <div className="space-y-3">
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
            <div className="size-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4">
              <Zap size={32} className="text-white" fill="white" />
            </div>
            <h3 className="text-white text-lg font-bold">ChopMeter</h3>
            <p className="text-gray-500 text-xs mt-1">Version 1.0.0</p>
            <p className="text-gray-400 text-sm mt-3 max-w-[260px] leading-relaxed">
              Track your prepaid electricity usage and spending with ease.
            </p>
          </div>
        </section>
      </div>
      </PullToRefresh>

      <BottomNav active="settings" />
    </div>
  );
}
