"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getSettings,
  saveSettings,
  getAllReadings,
  clearAllData,
} from "@/lib/storage";
import { COUNTRIES, getCountry, type CountryConfig } from "@/lib/countries";
import type { UserSettings } from "@/lib/types";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettingsLocal] = useState<UserSettings | null>(null);
  const [country, setCountry] = useState<CountryConfig>(COUNTRIES[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [meterNumber, setMeterNumber] = useState("");
  const [balance, setBalance] = useState("");
  const [tariff, setTariff] = useState("");
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

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
        <span className="material-symbols-outlined text-primary text-5xl animate-pulse">
          electric_bolt
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-bg-dark font-display text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-surface-border bg-bg-dark/95">
        <div className="px-4 sm:px-6 max-w-[600px] mx-auto flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="size-8 flex items-center justify-center rounded-lg bg-primary/20 text-primary">
              <span className="material-symbols-outlined text-2xl">
                settings
              </span>
            </div>
            <h2 className="text-white text-xl font-extrabold tracking-tight">
              Settings
            </h2>
          </div>
        </div>
      </header>

      {/* Flash message */}
      {saved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-primary text-bg-dark font-bold text-sm rounded-full shadow-lg animate-fade-in-up">
          {saved}
        </div>
      )}

      <div className="flex-1 px-4 sm:px-6 py-6 max-w-[600px] mx-auto w-full pb-28 space-y-6">
        {/* Country & Currency */}
        <section className="rounded-2xl bg-surface-dark border border-surface-border p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              public
            </span>
            Country & Currency
          </h3>

          <button
            onClick={() => setShowCountryPicker(!showCountryPicker)}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-dark border border-surface-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{country.flag}</span>
              <div className="text-left">
                <p className="text-white font-bold text-sm">{country.name}</p>
                <p className="text-slate-400 text-xs">
                  {country.currencySymbol} ({country.currencyCode})
                </p>
              </div>
            </div>
            <span
              className={`material-symbols-outlined text-slate-400 transition-transform ${
                showCountryPicker ? "rotate-180" : ""
              }`}
            >
              expand_more
            </span>
          </button>

          {showCountryPicker && (
            <div className="mt-3 grid grid-cols-2 gap-2 animate-fade-in-up">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCountryChange(c)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-all text-left ${
                    c.code === country.code
                      ? "border-primary bg-primary/10"
                      : "border-surface-border hover:border-primary/40"
                  }`}
                >
                  <span className="text-xl">{c.flag}</span>
                  <div>
                    <p className="text-white text-xs font-bold">{c.name}</p>
                    <p className="text-slate-400 text-[10px]">
                      {c.currencySymbol}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        {/* Meter Details */}
        <section className="rounded-2xl bg-surface-dark border border-surface-border p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              electric_meter
            </span>
            Meter Details
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Meter Number
              </label>
              <input
                type="text"
                value={meterNumber}
                onChange={(e) => setMeterNumber(e.target.value)}
                placeholder="e.g. 01234567890"
                className="w-full h-12 rounded-xl bg-bg-dark border border-surface-border text-white text-sm font-bold px-4 placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Current Balance
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                  {country.currencySymbol}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-12 rounded-xl bg-bg-dark border border-surface-border text-white text-sm font-bold pl-14 pr-4 placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Updating resets the balance date to now
              </p>
            </div>

            <div>
              <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                Tariff Rate (per kWh)
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                    {country.currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    value={tariff}
                    onChange={(e) => setTariff(e.target.value)}
                    className="w-full h-12 rounded-xl bg-bg-dark border border-surface-border text-white text-sm font-bold pl-14 pr-4 placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>
                <button
                  onClick={handleResetTariff}
                  className="h-12 px-3 rounded-xl border border-surface-border text-slate-400 text-xs font-bold hover:border-primary/50 hover:text-white transition-colors"
                  title="Reset to default"
                >
                  <span className="material-symbols-outlined text-lg">
                    restart_alt
                  </span>
                </button>
              </div>
              <p className="text-slate-500 text-xs mt-1">
                Default: {country.currencySymbol} {country.defaultTariff} for{" "}
                {country.name}
              </p>
            </div>

            <button
              onClick={handleSaveMeter}
              className="w-full h-12 rounded-xl bg-primary text-bg-dark font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
            >
              Update Meter Details
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="rounded-2xl bg-surface-dark border border-surface-border p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              database
            </span>
            Data Management
          </h3>

          <div className="space-y-3">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-dark border border-surface-border hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">
                  download
                </span>
                <div className="text-left">
                  <p className="text-white text-sm font-bold">
                    Export Readings
                  </p>
                  <p className="text-slate-400 text-xs">
                    Download as CSV file
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">
                chevron_right
              </span>
            </button>

            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-bg-dark border border-danger/20 hover:border-danger/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-danger">
                  delete_forever
                </span>
                <div className="text-left">
                  <p className="text-danger text-sm font-bold">
                    Clear All Data
                  </p>
                  <p className="text-slate-400 text-xs">
                    Remove all readings and settings
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-slate-400">
                chevron_right
              </span>
            </button>

            {showClearConfirm && (
              <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 animate-fade-in-up">
                <p className="text-white text-sm font-bold mb-3">
                  Are you sure? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 h-10 rounded-lg border border-surface-border text-slate-300 text-sm font-bold hover:bg-surface-dark transition-colors"
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
        <section className="rounded-2xl bg-surface-dark border border-surface-border p-5">
          <h3 className="text-white text-sm font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              info
            </span>
            About
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">App</span>
              <span className="text-white font-bold">ChopMeter</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Version</span>
              <span className="text-white font-bold">2.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Type</span>
              <span className="text-white font-bold">PWA</span>
            </div>
          </div>
        </section>
      </div>

      <BottomNav active="settings" />
    </div>
  );
}
