"use client";

import { useState, useRef } from "react";

// PTechSolutions Day1 Portfolio color palette
const COLORS = {
    dark: "#1c1c1c",
    light: "#f2f2f2",
    muted: "#8c8c8c",
    orange: "#ff9800",
    red: "#e68a00",
};

export default function Home() {
    const [text, setText] = useState("");
    const [voice, setVoice] = useState("za_male_1");
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isDark, setIsDark] = useState(true);

    const bg = isDark ? COLORS.dark : COLORS.light;
    const fg = isDark ? COLORS.light : COLORS.dark;
    const fgSoft = isDark ? "rgba(242,242,242,0.65)" : "rgba(28,28,28,0.65)";
    const sectionBg = isDark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)";
    const borderColor = isDark ? "rgba(140,140,140,0.2)" : "rgba(28,28,28,0.12)";
    const inputBorderColor = isDark ? "rgba(140,140,140,0.35)" : "rgba(28,28,28,0.25)";
    const selectBg = isDark ? COLORS.dark : COLORS.light;

    const handleGenerate = async () => {
        if (!text.trim()) return;

        setLoading(true);
        setAudioUrl(null);

        try {
            const response = await fetch("http://localhost:8000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, voice_id: voice }),
            });

            const data = await response.json();

            if (data.status === "success") {
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
        <div
            id="top"
            className="min-h-screen font-sans overflow-x-hidden relative"
            style={{ backgroundColor: bg, color: fg, transition: "background-color 0.5s, color 0.5s" }}
        >
            {/* Navigation Frame */}
            <div
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md"
                style={{ backgroundColor: `${bg}f2`, borderBottom: `1px solid ${borderColor}`, transition: "background-color 0.5s" }}
            >
                <a
                    href="#top"
                    className="text-3xl font-extrabold tracking-tighter hover:opacity-80 transition-opacity"
                    style={{ color: COLORS.orange }}
                >
                    ms.
                </a>

                <div className="flex items-center gap-8">
                    {/* Theme Toggle Switch */}
                    <label className="switch">
                        <input
                            type="checkbox"
                            checked={isDark}
                            onChange={() => setIsDark(!isDark)}
                        />
                        <span className="slider"></span>
                    </label>
                </div>
            </div>

            <main>
                {/* Banner Section */}
                <section className="relative min-h-[90vh] flex flex-col justify-center px-8 pt-32 pb-16">
                    <div className="max-w-6xl mx-auto w-full relative z-10">
                        <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black leading-none tracking-tight mb-8" style={{ color: fg, transition: "color 0.5s" }}>
                            Mzansi-Speak <br />
                            <span className="font-light block mt-4" style={{ color: COLORS.muted }}>TTS Catalyst.</span>
                        </h1>
                        <div className="flex flex-col md:flex-row gap-12 mt-16 max-w-4xl">
                            <p className="text-xl md:text-2xl font-light leading-relaxed flex-1" style={{ color: fgSoft, transition: "color 0.5s" }}>
                                By harnessing the power of cutting-edge AI and striking graphic design, we can transform creative ideas into impactful audio experiences.
                            </p>
                            <div className="flex-1 flex items-end">
                                <a href="#playground" className="inline-flex items-center gap-4 group">
                                    <span className="text-sm font-bold uppercase tracking-[0.2em] transition-colors" style={{ color: COLORS.orange }}>
                                        Scroll to App
                                    </span>
                                    <div
                                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all group-hover:opacity-80"
                                        style={{ border: `1px solid ${COLORS.orange}`, color: fg }}
                                    >
                                        &darr;
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Application Section */}
                <section
                    id="playground"
                    className="px-8 py-32 border-t relative"
                    style={{ backgroundColor: sectionBg, borderColor: borderColor, transition: "background-color 0.5s" }}
                >
                    <div className="max-w-4xl mx-auto w-full">
                        <div className="mb-24">
                            <span
                                className="block text-sm font-bold uppercase tracking-[0.3em] mb-8 pl-12 relative"
                                style={{ color: COLORS.muted }}
                            >
                                <span
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-[2px]"
                                    style={{ backgroundColor: COLORS.orange }}
                                />
                                Interaction
                            </span>
                            <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ color: fg, transition: "color 0.5s" }}>
                                Unique <span className="font-light" style={{ color: COLORS.muted }}>Voices</span> <br />
                                For Your <span className="font-light" style={{ color: COLORS.muted }}>Business.</span>
                            </h2>
                        </div>

                        <div className="space-y-12">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your script here..."
                                className="w-full h-40 bg-transparent border-b-2 pb-4 text-2xl outline-none resize-none transition-colors"
                                style={{
                                    color: fg,
                                    borderColor: inputBorderColor,
                                    caretColor: COLORS.orange,
                                    transition: "color 0.5s, border-color 0.5s",
                                }}
                            />

                            <div className="flex flex-col md:flex-row gap-8 items-end justify-between">
                                <div className="w-full md:w-1/2 relative">
                                    <label className="block text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: COLORS.muted }}>
                                        Voice Selection
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={voice}
                                            onChange={(e) => setVoice(e.target.value)}
                                            className="w-full rounded-none px-6 py-5 text-lg outline-none cursor-pointer appearance-none border-2 transition-colors"
                                            style={{
                                                backgroundColor: selectBg,
                                                borderColor: inputBorderColor,
                                                color: fg,
                                                transition: "background-color 0.5s, color 0.5s, border-color 0.5s",
                                            }}
                                        >
                                            <option value="za_male_1">Thabo (Male)</option>
                                            <option value="za_female_1">Zanele (Female)</option>
                                        </select>
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: COLORS.orange }}>▼</div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !text.trim()}
                                    className="group relative w-full md:w-1/2 inline-flex items-center justify-between px-8 py-5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    style={{ backgroundColor: COLORS.orange, color: COLORS.dark }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = COLORS.red)}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = COLORS.orange)}
                                >
                                    <span className="text-sm font-black uppercase tracking-[0.2em]">
                                        {loading ? "Processing..." : "Generate Audio"}
                                    </span>
                                    <span className="font-bold transition-transform group-hover:translate-x-2">&rarr;</span>
                                </button>
                            </div>

                            {audioUrl && (
                                <div
                                    className="mt-16 p-10 relative"
                                    style={{
                                        backgroundColor: bg,
                                        border: `1px solid ${borderColor}`,
                                        borderLeft: `4px solid ${COLORS.orange}`,
                                        transition: "background-color 0.5s",
                                    }}
                                >
                                    <h5 className="text-xl font-bold mb-2" style={{ color: fg }}>Generated Result</h5>
                                    <p className="text-sm font-bold uppercase tracking-[0.2em] mb-8" style={{ color: COLORS.muted }}>Audible File</p>
                                    <audio ref={audioRef} src={audioUrl} controls className="w-full outline-none" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer
                className="px-8 py-12"
                style={{ backgroundColor: bg, borderTop: `1px solid ${borderColor}`, transition: "background-color 0.5s" }}
            >
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="text-2xl font-bold tracking-widest" style={{ color: COLORS.orange }}>ms.</div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em]" style={{ color: COLORS.muted }}>
                            &copy; 2026 Mzansi-Speak South Africa
                        </p>
                        <ul className="flex gap-8 text-sm font-bold uppercase tracking-[0.2em]" style={{ color: fgSoft }}>
                            <li>
                                <a href="#" className="transition-colors hover:opacity-80" style={{ color: fgSoft }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.orange)}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = fgSoft)}>
                                    Privacy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="transition-colors" style={{ color: fgSoft }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = COLORS.orange)}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = fgSoft)}>
                                    Terms
                                </a>
                            </li>
                        </ul>
                    </div>
                    {/* ts.industries attribution - bottom right */}
                    <div className="flex justify-end">
                        <p className="text-xs uppercase tracking-[0.25em]" style={{ color: `${COLORS.muted}88` }}>
                            A product of{" "}
                            <span className="font-bold cursor-pointer hover:opacity-80 transition-opacity" style={{ color: COLORS.orange }}>
                                ts.industries
                            </span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
