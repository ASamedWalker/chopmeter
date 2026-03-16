"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveReading, saveSettings, getSettings, generateId, getDefaultMeter } from "@/lib/storage";
import { getCountry } from "@/lib/countries";
import { recognizeMeterReading } from "@/lib/ocr";
import { X, Zap, Keyboard, Wallet, Check, RotateCcw, AlertCircle } from "lucide-react";

type ScanState = "idle" | "scanning" | "success" | "manual";

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scanningRef = useRef(false);
  const failCountRef = useRef(0);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedValue, setScannedValue] = useState<string>("");
  const [manualValue, setManualValue] = useState<string>("");
  const [balanceValue, setBalanceValue] = useState<string>("");
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [scanAttempts, setScanAttempts] = useState(0);
  const [showTip, setShowTip] = useState(false);

  const settings = getSettings();
  const country = getCountry(settings.countryCode);

  const activeMeter = typeof window !== "undefined" ? getDefaultMeter() : null;
  const activeMeterId = activeMeter?.id;

  const stopScanning = useCallback(() => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  }, []);

  const captureAndScan = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || scanningRef.current) return;
    scanningRef.current = true;
    // Only show "Analyzing..." after a few silent attempts so the user
    // has time to position their camera without the status flickering
    if (failCountRef.current >= 2) {
      setScanState("scanning");
    }
    setError("");
    setProgress(0);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) { scanningRef.current = false; return; }
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    const result = await recognizeMeterReading(dataUrl, (p) => setProgress(p));

    if (result.value !== null) {
      setScannedValue(result.value.toString());
      setScanState("success");
      stopScanning();
      failCountRef.current = 0;
      navigator.vibrate?.(100);
    } else {
      failCountRef.current += 1;
      setScanAttempts(failCountRef.current);
      setScanState("idle");

      // After 3 failed attempts, show helpful tip
      if (failCountRef.current === 3) {
        setShowTip(true);
      }
    }
    setProgress(0);
    scanningRef.current = false;
  }, [stopScanning]);

  const startScanning = useCallback(() => {
    stopScanning();
    failCountRef.current = 0;
    setScanAttempts(0);
    setShowTip(false);
    captureAndScan();
    scanIntervalRef.current = setInterval(captureAndScan, 3500);
  }, [stopScanning, captureAndScan]);

  const startCamera = useCallback(async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: 1280, height: 720 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      startScanning();
    } catch {
      setError("Camera access denied.");
      setScanState("manual");
    }
  }, [startScanning]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
      stopScanning();
    };
  }, [startCamera, stopCamera, stopScanning]);

  const toggleFlash = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    const capabilities = track.getCapabilities() as MediaTrackCapabilities & {
      torch?: boolean;
    };
    if ("torch" in capabilities) {
      const newFlash = !flashOn;
      await track.applyConstraints({
        advanced: [{ torch: newFlash } as MediaTrackConstraintSet],
      } as MediaTrackConstraints);
      setFlashOn(newFlash);
    }
  };

  const handleSave = (value: string, source: "ocr" | "manual") => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0 || numValue > 99999.99) {
      setError("Please enter a valid meter reading (0–99,999.99).");
      return;
    }

    saveReading({
      id: generateId(),
      value: numValue,
      timestamp: Date.now(),
      source,
    }, activeMeterId);

    const balNum = parseFloat(balanceValue);
    if (!isNaN(balNum) && balNum > 0 && balNum <= 999999.99) {
      saveSettings({
        lastBalance: balNum,
        lastBalanceDate: Date.now(),
      });
    }

    stopCamera();
    stopScanning();
    router.push("/dashboard");
  };

  const goToManual = () => {
    setScanState("manual");
    stopCamera();
    stopScanning();
  };

  // Status badge config
  const statusBadge = scanState === "scanning"
    ? { label: `Analyzing... ${progress}%`, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" }
    : scanState === "success"
    ? { label: "Reading found!", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" }
    : { label: "Point camera at meter display", color: "text-gray-400", bg: "bg-black/60" };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-40">
      <canvas ref={canvasRef} className="hidden" />

      <div className="absolute inset-0 z-0">
        <video
          ref={videoRef}
          className="w-full h-full object-cover opacity-60"
          playsInline
          muted
          autoPlay
        />
      </div>

      <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6 w-full">
        <button
          onClick={() => {
            stopCamera();
            stopScanning();
            router.push("/dashboard");
          }}
          className="flex items-center justify-center size-10 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-white text-lg font-bold tracking-tight drop-shadow-md">
          Scan Meter
        </h2>
        <button
          onClick={toggleFlash}
          className={`flex items-center justify-center size-10 rounded-full backdrop-blur-md transition-colors ${
            flashOn
              ? "bg-gradient-to-r from-blue-500 to-violet-500 text-white"
              : "bg-white/10 text-white hover:bg-blue-500/30 hover:text-white"
          }`}
          title="Toggle Flash"
        >
          <Zap size={20} />
        </button>
      </header>

      {/* Scanner Mode */}
      {scanState !== "manual" && (
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full">
          <div className={`relative w-full aspect-[4/3] max-h-[280px] rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
            scanState === "success" ? "ring-2 ring-emerald-500" : "ring-1 ring-white/20"
          }`}>
            {/* Corner markers */}
            {[
              { pos: "top-0 left-0", border: "border-t-4 border-l-4 rounded-tl-lg" },
              { pos: "top-0 right-0", border: "border-t-4 border-r-4 rounded-tr-lg" },
              { pos: "bottom-0 left-0", border: "border-b-4 border-l-4 rounded-bl-lg" },
              { pos: "bottom-0 right-0", border: "border-b-4 border-r-4 rounded-br-lg" },
            ].map((c, i) => (
              <div key={i} className={`absolute ${c.pos} w-8 h-8 ${c.border} z-20 transition-colors ${
                scanState === "success" ? "border-emerald-500" : "border-blue-500"
              }`} />
            ))}

            {/* Scanning line — only animates when actively scanning */}
            {scanState === "scanning" && (
              <div className="absolute inset-x-0 top-0 h-0.5 bg-blue-500/80 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-scan z-10 w-full" />
            )}

            <div className="absolute inset-0 bg-transparent ring-[1000px] ring-black/50 pointer-events-none" />

            {/* Progress bar — only during active scan */}
            {scanState === "scanning" && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50 z-30">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Status badge */}
            <div className="absolute bottom-4 left-0 right-0 text-center z-20">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 backdrop-blur-sm rounded-full text-xs font-semibold border ${statusBadge.bg} ${statusBadge.color}`}>
                {scanState === "scanning" && (
                  <span className="size-2 rounded-full bg-amber-400 animate-pulse" />
                )}
                {scanState === "success" && <Check size={14} />}
                {statusBadge.label}
              </span>
            </div>
          </div>

          {/* Guidance text below viewfinder */}
          {scanState === "success" ? (
            /* Found result card */
            <div className="mt-4 bg-white/[0.05] backdrop-blur-xl border border-emerald-500/30 rounded-xl p-4 w-full max-w-xs animate-[fadeIn_300ms_ease-out]">
              <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                Detected Reading
              </p>
              <p className="text-white text-3xl font-bold tracking-wider text-center">
                {scannedValue}{" "}
                <span className="text-lg text-gray-400">kWh</span>
              </p>

              <div className="mt-4 pt-3 border-t border-white/[0.08]">
                <label className="flex items-center gap-1.5 text-gray-400 text-xs uppercase tracking-wider mb-1.5">
                  <Wallet size={12} />
                  Credit Balance (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                    {country.currencySymbol}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    min="0"
                    max="999999.99"
                    value={balanceValue}
                    onChange={(e) => setBalanceValue(e.target.value)}
                    placeholder="e.g. 500.00"
                    className="w-full h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-10 pr-3 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setScanState("idle");
                    setScannedValue("");
                    setBalanceValue("");
                    startScanning();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border border-white/[0.06] text-white text-sm font-bold hover:bg-white/[0.05] transition-colors"
                >
                  <RotateCcw size={14} />
                  Rescan
                </button>
                <button
                  onClick={() => handleSave(scannedValue, "ocr")}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-violet-500 text-white text-sm font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all"
                >
                  <Check size={14} />
                  Save
                </button>
              </div>

              <button
                onClick={() => { setManualValue(scannedValue); goToManual(); }}
                className="w-full text-center text-gray-500 text-xs mt-3 hover:text-blue-400 transition-colors"
              >
                Wrong number? Edit manually
              </button>
            </div>
          ) : (
            /* Guidance area when not found */
            <div className="mt-5 w-full max-w-xs text-center">
              {/* Attempt counter */}
              {scanAttempts > 0 && scanAttempts < 5 && (
                <p className="text-gray-500 text-xs mb-2">
                  Scan attempt {scanAttempts}... looking for meter numbers
                </p>
              )}

              {/* Tip after 3 failed attempts */}
              {showTip && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 mb-3 text-left animate-[fadeIn_300ms_ease-out]">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-amber-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-amber-300 text-xs font-semibold mb-1">Having trouble scanning?</p>
                      <ul className="text-gray-400 text-xs space-y-0.5">
                        <li>- Hold phone closer to the meter display</li>
                        <li>- Make sure the numbers are well-lit</li>
                        <li>- Try turning on the flash</li>
                        <li>- Or just enter the reading manually below</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* After 5+ attempts, strongly suggest manual */}
              {scanAttempts >= 5 && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-3 animate-[fadeIn_300ms_ease-out]">
                  <p className="text-blue-300 text-sm font-semibold mb-1">
                    Can&apos;t detect the reading?
                  </p>
                  <p className="text-gray-400 text-xs">
                    No worries — just type it in. It&apos;s just as fast.
                  </p>
                </div>
              )}

              {!showTip && scanAttempts === 0 && (
                <p className="text-gray-400 text-sm">
                  Point camera at the number display on your meter
                </p>
              )}
            </div>
          )}

          {error && (
            <p className="mt-3 text-danger text-sm text-center">{error}</p>
          )}
        </main>
      )}

      {/* Manual Entry Mode */}
      {scanState === "manual" && (
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-xs space-y-6">
            <div className="text-center">
              <Keyboard size={48} className="text-blue-400 mx-auto mb-4" />
              <h3 className="text-white text-xl font-bold mb-1">
                Enter Reading
              </h3>
              <p className="text-gray-500 text-sm">
                Type the number shown on your meter
              </p>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5 text-left">
                Meter Reading (kWh)
              </label>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                max="99999.99"
                value={manualValue}
                onChange={(e) => setManualValue(e.target.value)}
                placeholder="e.g. 2450.5"
                autoFocus
                className="w-full h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-2xl font-bold text-center placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-gray-400 text-xs font-bold uppercase tracking-wider mb-1.5">
                <Wallet size={12} />
                Credit Balance (optional)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-bold">
                  {country.currencySymbol}
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  min="0"
                  max="999999.99"
                  value={balanceValue}
                  onChange={(e) => setBalanceValue(e.target.value)}
                  placeholder="e.g. 500.00"
                  className="w-full h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] text-white text-sm font-bold pl-12 pr-4 placeholder:text-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            <button
              onClick={() => handleSave(manualValue, "manual")}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-blue-500 to-violet-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/20 transition-all active:scale-[0.98]"
            >
              Save Reading
            </button>

            <button
              onClick={() => {
                setScanState("idle");
                setError("");
                startCamera();
              }}
              className="w-full text-center text-blue-400 text-sm font-bold hover:underline"
            >
              Try Camera Instead
            </button>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent">
        {scanState !== "manual" && scanState !== "success" ? (
          <button
            onClick={goToManual}
            className={`w-full flex items-center justify-center gap-3 h-14 rounded-xl backdrop-blur-md border text-white font-bold text-base active:bg-white/5 transition-all group ${
              scanAttempts >= 3
                ? "bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30"
                : "bg-white/10 border-white/10 hover:bg-white/20"
            }`}
          >
            <Keyboard size={20} className={`${scanAttempts >= 3 ? "text-white" : "text-blue-400"} group-hover:text-white transition-colors`} />
            <span>Enter Manually</span>
          </button>
        ) : scanState === "manual" ? (
          <p className="text-center text-xs text-gray-500">
            Powered by ChopMeter
          </p>
        ) : null}
      </footer>
    </div>
  );
}
