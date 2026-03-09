"use client";

import { useState } from "react";

export default function Home() {
    const [text, setText] = useState("");
    const [voice, setVoice] = useState("za_male_1");
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        // Logic for generating speech
        console.log("Generating speech for:", text, "with voice:", voice);
        setLoading(false);
    };

    return (
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-b from-slate-900 to-slate-950">
            <div className="max-w-4xl w-full space-y-12 text-center">
                <header className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                        Mzansi-Speak
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Experience high-quality South African AI voices. Pure, natural, and free.
                    </p>
                </header>

                <section className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 backdrop-blur-sm shadow-2xl">
                    <div className="space-y-6">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text to speak..."
                            className="w-full h-40 bg-slate-800 border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        />

                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <select
                                value={voice}
                                onChange={(e) => setVoice(e.target.value)}
                                className="bg-slate-800 border-slate-700 text-slate-200 rounded-lg px-4 py-2 outline-none"
                            >
                                <option value="za_male_1">Thabo (Male)</option>
                                <option value="za_female_1">Zanele (Female)</option>
                            </select>

                            <button
                                onClick={handleGenerate}
                                disabled={loading}
                                className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50"
                            >
                                {loading ? "Generating..." : "Try it now"}
                            </button>
                        </div>
                    </div>
                </section>

                <footer className="pt-12 text-slate-500 text-sm">
                    <p>© 2026 Mzansi-Speak. Powered by Kokoro-82M.</p>
                </footer>
            </div>
        </main>
    );
}
