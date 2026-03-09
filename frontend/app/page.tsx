"use client";

import { useState, useRef } from "react";

export default function Home() {
    const [text, setText] = useState("");
    const [voice, setVoice] = useState("za_male_1");
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const handleGenerate = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setAudioUrl(null);

        try {
            const response = await fetch("http://localhost:8000/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text, voice_id: voice }),
            });

            const data = await response.json();

            if (data.status === "success") {
                // Constructing the URL based on the cache key
                const url = `http://localhost:8000/api/audio/${data.cache_key}.wav`;
                setAudioUrl(url);
            } else {
                alert("Generation failed: " + data.message);
            }
        } catch (error) {
            console.error("Error connecting to backend:", error);
            alert("Error connecting to the TTS service.");
        } finally {
            setLoading(false);
        }
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
                    <div className="space-y-6 text-left">
                        <label className="block text-slate-300 font-medium mb-2">Speak your mind:</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter text here... (e.g., Hello, how are you today?)"
                            className="w-full h-40 bg-slate-800 border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        />

                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="w-full md:w-auto">
                                <label className="block text-slate-300 font-medium mb-2">Choose a Voice:</label>
                                <select
                                    value={voice}
                                    onChange={(e) => setVoice(e.target.value)}
                                    className="bg-slate-800 border-slate-700 text-slate-200 rounded-lg px-4 py-2 outline-none w-full"
                                >
                                    <option value="za_male_1">Thabo (Male)</option>
                                    <option value="za_female_1">Zanele (Female)</option>
                                </select>
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={loading || !text.trim()}
                                className="w-full md:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-50 mt-auto"
                            >
                                {loading ? "Generating..." : "Generate Audio"}
                            </button>
                        </div>

                        {audioUrl && (
                            <div className="mt-8 p-6 bg-slate-800/80 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <p className="text-sm text-slate-400 mb-4">Click play to listen:</p>
                                <audio ref={audioRef} src={audioUrl} controls className="w-full" />
                            </div>
                        )}
                    </div>
                </section>

                <footer className="pt-12 text-slate-500 text-sm">
                    <p>© 2026 Mzansi-Speak. High-performance South African TTS Engine.</p>
                </footer>
            </div>
        </main>
    );
}
