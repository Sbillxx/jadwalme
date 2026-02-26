"use client";

import React, { useState } from "react";
import LoginForm from "./components/LoginForm";
import ScheduleDashboard from "./components/ScheduleDashboard";
import { WeeklySchedule } from "./types/schedule";
import { initialSchedule } from "./data";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Globe } from "lucide-react";

export default function Home() {
  const [schedule, setSchedule] = useState<WeeklySchedule>(initialSchedule);
  const [showSync, setShowSync] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  const hasSchedule = Object.keys(schedule).length > 0;

  const handleSyncComplete = (newSchedule: WeeklySchedule) => {
    setSchedule(newSchedule);
    setShowSync(false);
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  return (
    <div className={theme}>
      <main className="min-h-screen relative overflow-hidden bg-background">
        {/* Toggle Theme Button */}
        <div className="absolute top-6 right-6 z-50">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-2xl glass hover:bg-white/10 transition-all flex items-center justify-center text-accent"
            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {theme === "dark" ? (
              <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>
              </motion.div>
            ) : (
              <motion.div initial={{ rotate: 90 }} animate={{ rotate: 0 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" /></svg>
              </motion.div>
            )}
          </button>
        </div>
        {/* Background Orbs */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-6xl mx-auto pt-12 pb-20 px-4">
          <AnimatePresence mode="wait">
            {!hasSchedule || showSync ? (
              <motion.div
                key="sync"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center min-h-[70vh] text-center"
              >
                <div className="mb-8 px-4">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4">
                    <Globe className="w-4 h-4" />
                    SIAKAD Sync (Simantap)
                  </div>
                  <h1 className="text-4xl md:text-6xl font-bold mb-4 accent-text">
                    JadwalMe
                  </h1>
                  <p className="text-secondary text-lg max-w-lg mx-auto leading-relaxed">
                    Sinkronkan jadwal kuliah Anda dari Simantap UNPER dalam hitungan detik. Tanpa input manual, tanpa ribet.
                  </p>
                </div>

                <LoginForm onSyncComplete={handleSyncComplete} />

                {hasSchedule && (
                  <button
                    onClick={() => setShowSync(false)}
                    className="mt-6 text-secondary hover:text-accent transition-colors underline underline-offset-4"
                  >
                    Kembali ke jadwal yang sudah ada
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-8"
              >
                <ScheduleDashboard schedule={schedule} setSchedule={setSchedule} />

                <div className="flex justify-center mt-8">
                  <button
                    onClick={() => setShowSync(true)}
                    className="px-6 py-3 rounded-2xl glass hover:bg-white/5 text-secondary transition-all flex items-center gap-2 group"
                  >
                    <Sparkles className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                    Sinkronkan Jadwal Baru
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="w-full py-8 text-center text-secondary text-sm border-t border-white/5">
          <p>&copy; 2026 JadwalMe. Dibuat eksklusif untuk Mahasiswa UNPER.</p>
        </footer>
      </main>
    </div>
  );
}
