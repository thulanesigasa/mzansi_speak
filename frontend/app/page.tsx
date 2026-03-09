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
        <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-mzansi-dark text-mzansi-light font-sans selection:bg-mzansi-orange selection:text-mzansi-dark">
            <div className="max-w-3xl w-full space-y-16">
                <header className="space-y-6 text-center">
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-mzansi-orange">
                        Mzansi-Speak
                    </h1>
                    <p className="text-xl text-mzansi-light/80 max-w-xl mx-auto font-light tracking-wide">
                        High fidelity South African AI voices. Pure, natural, and free.
                    </p>
                </header>

                <section className="space-y-8">
                    <div className="space-y-4">
                        <label className="block text-lg font-medium tracking-wide uppercase text-mzansi-muted">Speak your mind</label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type something here..."
                            className="w-full h-48 bg-mzansi-dark border-2 border-mzansi-muted rounded-none p-6 text-xl text-mzansi-light placeholder:text-mzansi-muted focus:border-mzansi-orange focus:ring-0 outline-none transition-colors resize-none shadow-[8px_8px_0_0_#7A4B47]"
                        />
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-end justify-between">
                        <div className="w-full md:w-1/2 space-y-4">
                            <label className="block text-lg font-medium tracking-wide uppercase text-mzansi-muted">Voice Selection</label>
                            <select
                                value={voice}
                                onChange={(e) => setVoice(e.target.value)}
                                className="w-full bg-mzansi-dark border-2 border-mzansi-muted text-mzansi-light rounded-none px-4 py-4 text-lg outline-none focus:border-mzansi-orange cursor-pointer appearance-none shadow-[4px_4px_0_0_#7A4B47]"
                            >
                                <option value="za_male_1">Thabo (Male)</option>
                                <option value="za_female_1">Zanele (Female)</option>
                            </select>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading || !text.trim()}
                            className="w-full md:w-1/2 px-8 py-4 bg-mzansi-orange text-mzansi-dark text-lg font-bold uppercase tracking-widest border-2 border-mzansi-orange hover:bg-mzansi-red hover:border-mzansi-red hover:text-mzansi-light transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_0_0_#B32C1A] hover:translate-y-1 hover:shadow-none"
                        >
                            {loading ? "Generating..." : "Generate Audio"}
                        </button>
                    </div>

                    {audioUrl && (
                        <div className="mt-12 p-8 border-2 border-mzansi-muted bg-mzansi-dark shadow-[8px_8px_0_0_#FE7F42] animate-in slide-in-from-bottom-4 fade-in duration-300">
                            <p className="text-sm font-bold uppercase tracking-widest text-mzansi-orange mb-6">Generated Audio</p>
                            <audio ref={audioRef} src={audioUrl} controls className="w-full outline-none" />
                        </div>
                    )}
                </section>

                <footer className="pt-16 pb-8 text-center text-mzansi-muted text-sm font-medium tracking-widest uppercase border-t border-mzansi-muted/30">
                    <p>© 2026 Mzansi-Speak</p>
                </footer>
            </div>
        </main>
    );
}
