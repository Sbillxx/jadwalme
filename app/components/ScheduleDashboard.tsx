"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, MapPin, Download, Trash2, Plus, Share2, Sparkles } from "lucide-react";
import { WeeklySchedule, ScheduleItem } from "../types/schedule";
import { toPng } from "html-to-image";
import confetti from "canvas-confetti";

interface DashboardProps {
    schedule: WeeklySchedule;
    setSchedule: React.Dispatch<React.SetStateAction<WeeklySchedule>>;
}

const days = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export default function ScheduleDashboard({ schedule, setSchedule }: DashboardProps) {
    const [activeDay, setActiveDay] = useState(new Date().toLocaleDateString('id-ID', { weekday: 'long' }) || "Senin");
    const scheduleRef = useRef<HTMLDivElement>(null);
    const fullScheduleRef = useRef<HTMLDivElement>(null);

    // Normalize activeDay to match keys if necessary (though our data uses Bahasa Indonesia)
    const currentDaySchedule = schedule[activeDay] || [];

    const handleExport = async () => {
        if (scheduleRef.current === null) return;

        try {
            const dataUrl = await toPng(scheduleRef.current, { cacheBust: true, backgroundColor: "#0f172a" });
            const link = document.createElement('a');
            link.download = `Jadwal-${activeDay}.png`;
            link.href = dataUrl;
            link.click();
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#60a5fa', '#ffffff']
            });
        } catch (err) {
            console.error('oops, something went wrong!', err);
        }
    };

    const handleExportFull = async () => {
        if (fullScheduleRef.current === null) return;

        try {
            // Momentarily show the full schedule for capture or ensure it's rendered correctly
            const dataUrl = await toPng(fullScheduleRef.current, {
                cacheBust: true,
                backgroundColor: "#0f172a",
                style: {
                    transform: 'scale(1)',
                    opacity: '1',
                    display: 'block'
                }
            });
            const link = document.createElement('a');
            link.download = `Jadwal-Mingguan.png`;
            link.href = dataUrl;
            link.click();
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.6 },
                colors: ['#3b82f6', '#10b981', '#ffffff']
            });
        } catch (err) {
            console.error('Full export failed!', err);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto space-y-8 p-4 md:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold accent-text flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-blue-500" />
                        Jadwal Kuliah
                    </h2>
                    <p className="text-secondary mt-1">Atur waktu belajarmu dengan gaya.</p>
                </div>
                <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                        onClick={handleExportFull}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 rounded-xl transition-all glass text-sm md:text-base"
                        title="Ekspor Seluruh Jadwal"
                    >
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Ekspor Full</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-3 md:px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 glass text-sm md:text-base"
                        title="Ekspor Hari Ini"
                    >
                        <Download className="w-4 h-4" />
                        <span className="hidden sm:inline">Ekspor Hari</span>
                    </button>
                    <button
                        onClick={() => setSchedule({})}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all glass"
                        title="Hapus Semua"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Day Selector */}
            <div className="flex overflow-x-auto pb-4 no-scrollbar gap-2 -mx-4 px-4 md:mx-0 md:px-0 md:justify-center">
                {days.map((day) => (
                    <button
                        key={day}
                        onClick={() => setActiveDay(day)}
                        className={`px-5 py-2 rounded-full whitespace-nowrap transition-all border text-sm md:text-base ${activeDay === day
                            ? "bg-blue-500/20 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                            : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                            } glass`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Schedule Content */}
            <div ref={scheduleRef} className="p-1 rounded-3xl overflow-hidden bg-slate-900/50">
                <div className="glass rounded-[1.4rem] p-6 md:p-10 min-h-[400px]">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-semibold text-slate-200">{activeDay}</h3>
                        <div className="flex items-center text-sm text-secondary gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{currentDaySchedule.length} Mata Kuliah</span>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeDay}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-4"
                        >
                            {currentDaySchedule.length > 0 ? (
                                currentDaySchedule.sort((a, b) => a.startTime.localeCompare(b.startTime)).map((item) => (
                                    <div key={item.id} className="glass-card group flex flex-col md:flex-row md:items-center gap-4 p-5 rounded-2xl relative overflow-hidden">
                                        <div className="flex flex-col gap-1 min-w-[120px]">
                                            <div className="flex items-center gap-2 text-blue-400 font-medium">
                                                <Clock className="w-4 h-4" />
                                                {item.startTime} - {item.endTime}
                                            </div>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30 flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />
                                                    {item.room}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="h-px md:h-12 md:w-px bg-slate-800" />

                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors">
                                                    {item.course}
                                                </h4>
                                                {item.className && (
                                                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-slate-500 text-[10px] border border-white/10">
                                                        Kelas {item.className}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-secondary text-sm leading-relaxed">
                                                {item.lecturer}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-secondary text-center">
                                    <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                        <Calendar className="w-8 h-8 opacity-20" />
                                    </div>
                                    <p>Tidak ada jadwal untuk hari ini.</p>
                                    <p className="text-sm opacity-60">Waktunya istirahat!</p>
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Hidden Full Week View for Export */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                <div ref={fullScheduleRef} className="w-[1000px] p-10 bg-[#0f172a] space-y-8">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white">Jadwal Kuliah Mingguan</h1>
                            <p className="text-slate-400">Generated by JadwalMe</p>
                        </div>
                        <Sparkles className="w-12 h-12 text-blue-500" />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {days.map(day => {
                            const daySchedule = schedule[day] || [];
                            if (daySchedule.length === 0) return null;

                            return (
                                <div key={day} className="space-y-3">
                                    <h3 className="text-xl font-bold text-blue-400 px-2">{day}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        {daySchedule.sort((a, b) => a.startTime.localeCompare(b.startTime)).map(item => (
                                            <div key={item.id} className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2">
                                                <div className="flex justify-between items-start">
                                                    <span className="text-blue-400 font-bold text-sm">{item.startTime} - {item.endTime}</span>
                                                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/20">{item.room}</span>
                                                </div>
                                                <h4 className="text-white font-bold leading-tight">{item.course}</h4>
                                                <div className="flex justify-between items-end">
                                                    <span className="text-slate-500 text-xs truncate max-w-[150px]">{item.lecturer}</span>
                                                    {item.className && <span className="text-slate-600 text-[10px]">Kelas {item.className}</span>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <footer className="pt-8 text-center text-slate-700 text-xs">
                        &copy; 2026 JadwalMe. Dibuat eksklusif untuk Mahasiswa UNPER.
                    </footer>
                </div>
            </div>
        </div>
    );
}
