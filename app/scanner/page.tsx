"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveReading, generateId } from "@/lib/storage";
import { recognizeMeterReading } from "@/lib/ocr";

type ScanState = "idle" | "scanning" | "success" | "manual";

export default function ScannerPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [scanState, setScanState] = useState<ScanState>("idle");
  const [scannedValue, setScannedValue] = useState<string>("");
  const [manualValue, setManualValue] = useState<string>("");
  const [flashOn, setFlashOn] = useState(false);
  const [error, setError] = useState<string>("");

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
    } catch {
      setError("Camera access denied. You can enter the reading manually.");
      setScanState("manual");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

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

  const captureAndScan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setScanState("scanning");
    setError("");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    const dataUrl = canvas.toDataURL("image/png");
    const result = await recognizeMeterReading(dataUrl);

    if (result.value !== null) {
      setScannedValue(result.value.toString());
      setScanState("success");
    } else {
      setError("Could not read meter. Try again or enter manually.");
      setScanState("idle");
    }
  };

  const handleSave = (value: string, source: "ocr" | "manual") => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) {
      setError("Please enter a valid meter reading.");
      return;
    }

    saveReading({
      id: generateId(),
      value: numValue,
      timestamp: Date.now(),
      source,
    });

    stopCamera();
    router.push("/dashboard");
  };

  return (
    <div className="fixed inset-0 bg-black flex flex-col z-50">
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
            router.back();
          }}
          className="flex items-center justify-center size-10 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 transition-colors"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        <h2 className="text-white text-lg font-bold tracking-tight drop-shadow-md">
          Scan Meter
        </h2>
        <button
          onClick={toggleFlash}
          className={`flex items-center justify-center size-10 rounded-full backdrop-blur-md transition-colors ${
            flashOn
              ? "bg-primary text-black"
              : "bg-white/10 text-white hover:bg-primary hover:text-black"
          }`}
          title="Toggle Flash"
        >
          <span className="material-symbols-outlined text-xl">flash_on</span>
        </button>
      </header>

      {/* Scanner Mode */}
      {scanState !== "manual" && (
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 w-full">
          <div className="relative w-full aspect-[4/3] max-h-[300px] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg z-20" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg z-20" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg z-20" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg z-20" />

            <div className="absolute inset-x-0 top-0 h-0.5 bg-primary/80 shadow-[0_0_15px_rgba(0,255,65,0.8)] animate-scan z-10 w-full" />
            <div className="absolute inset-0 bg-transparent ring-[1000px] ring-black/50 pointer-events-none" />

            <div className="absolute bottom-4 left-0 right-0 text-center z-20">
              <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-sm rounded-full text-xs font-medium text-primary uppercase tracking-wider">
                {scanState === "scanning"
                  ? "Scanning..."
                  : scanState === "success"
                  ? "Reading Found!"
                  : "Align Display"}
              </span>
            </div>
          </div>

          <div className="mt-8 text-center max-w-[280px]">
            <p className="text-white text-lg font-bold mb-2">
              Align Meter Here
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              Position the meter display within the frame to scan automatically.
            </p>
          </div>

          {error && (
            <p className="mt-3 text-danger text-sm text-center">{error}</p>
          )}

          {scanState === "success" && (
            <div className="mt-4 bg-surface-dark/90 backdrop-blur-md border border-primary/30 rounded-xl p-4 w-full max-w-xs">
              <p className="text-slate-400 text-xs uppercase tracking-wider mb-1">
                Detected Reading
              </p>
              <p className="text-white text-3xl font-bold tracking-wider text-center">
                {scannedValue}{" "}
                <span className="text-lg text-slate-400">kWh</span>
              </p>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => {
                    setScanState("idle");
                    setScannedValue("");
                  }}
                  className="flex-1 py-2 rounded-lg border border-surface-border text-white text-sm font-bold hover:bg-surface-border transition-colors"
                >
                  Rescan
                </button>
                <button
                  onClick={() => handleSave(scannedValue, "ocr")}
                  className="flex-1 py-2 rounded-lg bg-primary text-bg-dark text-sm font-bold hover:brightness-110 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {scanState === "idle" && (
            <button
              onClick={captureAndScan}
              className="mt-8 size-16 rounded-full border-4 border-white/20 flex items-center justify-center group transition-all hover:scale-105 active:scale-95"
            >
              <div className="size-12 rounded-full bg-white group-hover:bg-primary transition-colors shadow-lg" />
            </button>
          )}
        </main>
      )}

      {/* Manual Entry Mode */}
      {scanState === "manual" && (
        <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-full max-w-xs space-y-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-primary text-5xl mb-4 block">
                keyboard
              </span>
              <h3 className="text-white text-xl font-bold mb-2">
                Enter Reading Manually
              </h3>
              <p className="text-slate-400 text-sm">
                Type the number shown on your meter display.
              </p>
            </div>

            <input
              type="number"
              inputMode="decimal"
              value={manualValue}
              onChange={(e) => setManualValue(e.target.value)}
              placeholder="e.g. 2450.5"
              className="w-full h-16 rounded-xl bg-surface-dark border border-surface-border text-white text-2xl font-bold text-center placeholder:text-slate-600 focus:border-primary focus:ring-1 focus:ring-primary"
            />

            {error && (
              <p className="text-danger text-sm text-center">{error}</p>
            )}

            <button
              onClick={() => handleSave(manualValue, "manual")}
              className="w-full h-14 rounded-xl bg-primary text-bg-dark font-bold text-lg hover:brightness-110 transition-colors shadow-lg shadow-primary/20"
            >
              Save Reading
            </button>

            <button
              onClick={() => {
                setScanState("idle");
                setError("");
                startCamera();
              }}
              className="w-full text-center text-primary text-sm font-bold hover:underline"
            >
              Try Camera Again
            </button>
          </div>
        </main>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 pb-8 bg-gradient-to-t from-black via-black/90 to-transparent">
        {scanState !== "manual" ? (
          <>
            <button
              onClick={() => {
                setScanState("manual");
                stopCamera();
              }}
              className="w-full flex items-center justify-center gap-3 h-14 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold text-base hover:bg-white/20 active:bg-white/5 transition-all group"
            >
              <span className="material-symbols-outlined text-primary group-hover:text-white transition-colors">
                keyboard
              </span>
              <span>Enter Code Manually</span>
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              Powered by ChopMeter Intelligence
            </p>
          </>
        ) : (
          <p className="text-center text-xs text-slate-500">
            Powered by ChopMeter Intelligence
          </p>
        )}
      </footer>
    </div>
  );
}
