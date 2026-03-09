"use client";

import { useState, useRef } from "react";

export default function Home() {
    const [text, setText] = useState("");
    const [voice, setVoice] = useState("za_male_1");
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [theme, setTheme] = useState<"dark" | "light">("dark");

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

    const isDark = theme === "dark";

    return (
        <div id="top" className={`min-h-screen font-sans overflow-x-hidden relative transition-colors duration-500
            ${isDark ? "bg-mzansi-dark text-mzansi-light selection:bg-mzansi-orange selection:text-mzansi-dark"
                : "bg-mzansi-light text-mzansi-dark selection:bg-mzansi-muted selection:text-mzansi-light"}`}>

            {/* Navigation Frame */}
            <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md border-b transition-colors duration-500
                ${isDark ? "bg-mzansi-dark/95 border-mzansi-muted/20" : "bg-mzansi-light/95 border-mzansi-muted/10"}`}>
                <a href="#top" className="text-3xl font-extrabold tracking-tighter text-mzansi-orange hover:opacity-80 transition-opacity">ms.</a>

                <div className="flex items-center gap-8">
                    {/* Theme Toggle Switch */}
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={!isDark}
                            onChange={() => setTheme(isDark ? "light" : "dark")}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <main>
                {/* Banner Section */}
                <section className="relative min-h-[90vh] flex flex-col justify-center px-8 pt-32 pb-16">
                    <div className="max-w-6xl mx-auto w-full relative z-10">
                        <h1 className={`text-6xl md:text-8xl lg:text-[7rem] font-black leading-none tracking-tight mb-8 transition-colors
                            ${isDark ? "text-mzansi-light" : "text-mzansi-dark"}`}>
                            Mzansi-Speak <br />
                            <span className={`font-light block mt-4 transition-colors ${isDark ? "text-mzansi-muted" : "text-mzansi-muted"}`}>TTS Catalyst.</span>
                        </h1>
                        <div className="flex flex-col md:flex-row gap-12 mt-16 max-w-4xl">
                            <p className={`text-xl md:text-2xl font-light leading-relaxed flex-1 transition-colors
                                ${isDark ? "text-mzansi-light/70" : "text-mzansi-dark/70"}`}>
                                By harnessing the power of cutting-edge AI and striking graphic design, we can transform creative ideas into impactful audio experiences.
                            </p>
                            <div className="flex-1 flex items-end">
                                <a href="#playground" className="inline-flex items-center gap-4 group">
                                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-mzansi-orange group-hover:text-mzansi-red transition-colors">Scroll to App</span>
                                    <div className={`w-12 h-12 rounded-full border border-mzansi-orange flex items-center justify-center transition-all
                                        ${isDark ? "group-hover:bg-mzansi-orange group-hover:text-mzansi-dark" : "group-hover:bg-mzansi-orange group-hover:text-mzansi-light"}`}>
                                        ↓
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Application Section */}
                <section id="playground" className={`px-8 py-32 border-t relative transition-colors duration-500
                    ${isDark ? "bg-black/20 border-mzansi-muted/10" : "bg-white/40 border-mzansi-dark/10"}`}>
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="mb-24">
                            <span className="block text-sm font-bold uppercase tracking-[0.3em] text-mzansi-muted mb-8 relative pl-12 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-8 before:h-[2px] before:bg-mzansi-orange">
                                Interaction
                            </span>
                            <h2 className={`text-5xl md:text-6xl font-bold mb-6 transition-colors ${isDark ? "text-mzansi-light" : "text-mzansi-dark"}`}>
                                Unique <span className="font-light text-mzansi-muted">Voices</span> <br />
                                For Your <span className="font-light text-mzansi-muted">Business.</span>
                            </h2>
                        </div>

                        <div className="space-y-12">
                            <div className="relative group">
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type your script here..."
                                    className={`w-full h-40 bg-transparent border-b-2 pb-4 text-2xl outline-none transition-colors resize-none 
                                        ${isDark ? "text-mzansi-light border-mzansi-muted/30 placeholder:text-mzansi-muted/50 focus:border-mzansi-orange hover:border-mzansi-muted/60"
                                            : "text-mzansi-dark border-mzansi-dark/20 placeholder:text-mzansi-dark/40 focus:border-mzansi-orange hover:border-mzansi-dark/40"}`}
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
                                <div className="w-full md:w-1/2 relative">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-mzansi-muted mb-4">Voice Selection</label>
                                    <div className="relative">
                                        <select
                                            value={voice}
                                            onChange={(e) => setVoice(e.target.value)}
                                            className={`w-full rounded-none px-6 py-5 text-lg outline-none cursor-pointer appearance-none transition-colors border-2 focus:border-mzansi-orange
                                                ${isDark ? "bg-mzansi-dark border-mzansi-muted/20 text-mzansi-light hover:border-mzansi-muted/40"
                                                    : "bg-mzansi-light border-mzansi-dark/10 text-mzansi-dark hover:border-mzansi-dark/30"}`}
                                        >
                                            <option value="za_male_1">Thabo (Male)</option>
                                            <option value="za_female_1">Zanele (Female)</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-mzansi-orange">▼</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !text.trim()}
                                    className="group relative w-full md:w-1/2 inline-flex items-center justify-between px-8 py-5 bg-mzansi-orange text-mzansi-light hover:text-mzansi-light overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mzansi-red"
                                >
                                    <span className="relative z-10 text-sm font-black uppercase tracking-[0.2em]">
                                        {loading ? "Processing..." : "Generate Audio"}
                                    </span>
                                    <span className="relative z-10 font-bold transition-transform group-hover:translate-x-2">→</span>
                                </button>
                            </div>

                            {audioUrl && (
                                <div className={`mt-16 p-10 relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-mzansi-orange animate-in slide-in-from-bottom-8 fade-in duration-700
                                    ${isDark ? "bg-mzansi-dark border border-mzansi-muted/20" : "bg-mzansi-light border border-mzansi-dark/10 shadow-lg"}`}>
                                    <h5 className={`text-xl font-bold mb-2 ${isDark ? "text-mzansi-light" : "text-mzansi-dark"}`}>Generated Result</h5>
                                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-mzansi-muted mb-8">Audible File</p>
                                    <audio ref={audioRef} src={audioUrl} controls className="w-full outline-none" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className={`px-8 py-16 border-t transition-colors duration-500
                ${isDark ? "bg-mzansi-dark border-mzansi-muted/20" : "bg-mzansi-light border-mzansi-dark/10"}`}>
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-2xl font-bold tracking-widest text-mzansi-muted">ms.</div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-mzansi-muted/70">
                        © 2026 Mzansi-Speak South Africa
                    </p>
                    <ul className={`flex gap-8 text-sm font-bold uppercase tracking-[0.2em] 
                        ${isDark ? "text-mzansi-light/70" : "text-mzansi-dark/70"}`}>
                        <li><a href="#" className="hover:text-mzansi-orange transition-colors">Privacy</a></li>
                        <li><a href="#" className="hover:text-mzansi-orange transition-colors">Terms</a></li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}
