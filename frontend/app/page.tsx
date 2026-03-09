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
        <div className="min-h-screen bg-mzansi-dark text-mzansi-light font-sans selection:bg-mzansi-orange selection:text-mzansi-dark overflow-x-hidden relative">

            {/* Navigation Frame */}
            <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-mzansi-dark/95 backdrop-blur-md border-b border-mzansi-muted/20">
                <a href="/" className="text-3xl font-extrabold tracking-tighter text-mzansi-orange hover:text-mzansi-light transition-colors">ms.</a>
                <div className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-xs uppercase tracking-widest font-bold text-mzansi-light group-hover:text-mzansi-orange transition-colors">Menu</span>
                    <div className="w-8 h-[2px] bg-mzansi-muted group-hover:bg-mzansi-orange transition-colors relative">
                        <div className="absolute top-2 w-6 right-0 h-[2px] bg-mzansi-muted group-hover:bg-mzansi-orange transition-colors"></div>
                    </div>
                </div>
            </div>

            <main>
                {/* Banner Section */}
                <section className="relative min-h-[90vh] flex flex-col justify-center px-8 pt-32 pb-16">
                    <div className="max-w-6xl mx-auto w-full relative z-10">
                        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black leading-none tracking-tight mb-8 text-mzansi-light">
                            Mzansi-Speak <br />
                            <span className="font-light text-mzansi-muted block mt-4">TTS Catalyst.</span>
                        </h1>
                        <div className="flex flex-col md:flex-row gap-12 mt-16 max-w-4xl">
                            <p className="text-xl md:text-2xl text-mzansi-light/70 font-light leading-relaxed flex-1">
                                By harnessing the power of cutting-edge AI and striking graphic design, we can transform creative ideas into impactful audio experiences.
                            </p>
                            <div className="flex-1 flex items-end">
                                <a href="#playground" className="inline-flex items-center gap-4 group">
                                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-mzansi-orange group-hover:text-mzansi-red transition-colors">Scroll to App</span>
                                    <div className="w-12 h-12 rounded-full border border-mzansi-orange flex items-center justify-center group-hover:bg-mzansi-orange group-hover:text-mzansi-dark transition-all">
                                        ↓
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Application Section */}
                <section id="playground" className="bg-[#241314] px-8 py-32 border-t border-mzansi-muted/10 relative">
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="mb-24">
                            <span className="block text-sm font-bold uppercase tracking-[0.3em] text-mzansi-muted mb-8 relative pl-12 before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:w-8 before:h-[2px] before:bg-mzansi-orange">
                                Interaction
                            </span>
                            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-mzansi-light">
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
                                    className="w-full h-40 bg-transparent border-b-2 border-mzansi-muted/30 pb-4 text-2xl text-mzansi-light placeholder:text-mzansi-muted/50 focus:border-mzansi-orange outline-none transition-colors resize-none hover:border-mzansi-muted/60"
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
                                <div className="w-full md:w-1/2 relative">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-mzansi-muted mb-4">Voice Selection</label>
                                    <div className="relative">
                                        <select
                                            value={voice}
                                            onChange={(e) => setVoice(e.target.value)}
                                            className="w-full bg-[#1c0f10] border-2 border-mzansi-muted/20 text-mzansi-light rounded-none px-6 py-5 text-lg outline-none focus:border-mzansi-orange cursor-pointer appearance-none hover:border-mzansi-muted/40 transition-colors"
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
                                    className="group relative w-full md:w-1/2 inline-flex items-center justify-between px-8 py-5 bg-mzansi-orange text-mzansi-dark overflow-hidden transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:bg-mzansi-red hover:text-mzansi-light"
                                >
                                    <span className="relative z-10 text-sm font-black uppercase tracking-[0.2em]">
                                        {loading ? "Processing..." : "Generate Audio"}
                                    </span>
                                    <span className="relative z-10 font-bold transition-transform group-hover:translate-x-2">→</span>
                                </button>
                            </div>

                            {audioUrl && (
                                <div className="mt-16 p-10 bg-mzansi-dark border border-mzansi-muted/20 relative before:content-[''] before:absolute before:top-0 before:left-0 before:w-1 before:h-full before:bg-mzansi-orange animate-in slide-in-from-bottom-8 fade-in duration-700">
                                    <h5 className="text-xl font-bold mb-2 text-mzansi-light">Generated Result</h5>
                                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-mzansi-muted mb-8">Audible File</p>
                                    <audio ref={audioRef} src={audioUrl} controls className="w-full outline-none" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="px-8 py-16 bg-mzansi-dark border-t border-mzansi-muted/20">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-2xl font-bold tracking-widest text-mzansi-muted">ms.</div>
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-mzansi-muted/70">
                        © 2026 Mzansi-Speak South Africa
                    </p>
                    <ul className="flex gap-8 text-sm font-bold uppercase tracking-[0.2em] text-mzansi-light/70">
                        <li><a href="#" className="hover:text-mzansi-orange transition-colors">Privacy</a></li>
                        <li><a href="#" className="hover:text-mzansi-orange transition-colors">Terms</a></li>
                    </ul>
                </div>
            </footer>
        </div>
    );
}
