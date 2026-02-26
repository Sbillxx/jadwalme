"use client";

import React, { useState } from "react";
import { Lock, User, Globe, Loader2, Sparkles, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface LoginFormProps {
    onSyncComplete: (schedule: any) => void;
}

export default function LoginForm({ onSyncComplete }: LoginFormProps) {
    const [username, setUsername] = useState("2303010252");
    const [password, setPassword] = useState("M4dadsyekhakbar");
    const [url, setUrl] = useState("https://simantap.unper.ac.id/akademik/krs");
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            const response = await fetch("/api/sync", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password, url }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Gagal sinkronisasi jadwal");
            }

            setIsSuccess(true);
            // Give a small delay so user can see success state
            setTimeout(() => {
                onSyncComplete(data.schedule);
            }, 1000);
        } catch (err: any) {
            setError(err.message);
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-8">
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="glass p-8 rounded-[2.5rem] space-y-6">
                    <div className="text-center space-y-2 mb-4">
                        <div className="w-16 h-16 bg-blue-500/10 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-4">
                            <Globe className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-100">Masuk ke Simantap</h3>
                        <p className="text-secondary text-sm">Masukkan kredensial SIAKAD Anda untuk sinkronisasi otomatis.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="NIM / Username"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                required
                            />
                        </div>

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-200 outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading || isSuccess}
                        className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-3 disabled:opacity-80 ${isSuccess
                            ? "bg-green-500 text-white shadow-lg shadow-green-900/20"
                            : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20"
                            }`}
                    >
                        {isSuccess ? (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Sinkronisasi Berhasil!
                            </>
                        ) : isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Menghubungkan...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Sinkronkan Sekarang
                            </>
                        )}
                    </button>
                </div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-2xl bg-red-400/10 border border-red-400/20 text-red-400 flex items-center gap-3 text-sm"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {error}
                    </motion.div>
                )}

                <p className="text-center text-slate-500 text-xs px-4">
                    Data Anda aman. Kredensial hanya digunakan untuk pengambilan data sekali jalan dan tidak akan disimpan oleh aplikasi.
                </p>
            </form>
        </div>
    );
}
