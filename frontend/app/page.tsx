"use client";

import { useState, useRef, useEffect } from "react";

const VOICES = [
    { value: "za_male_1", label: "Thabo (Male)" },
    { value: "za_female_1", label: "Zanele (Female)" },
];

export default function Home() {
    const [text, setText] = useState("");
    const [voice, setVoice] = useState(VOICES[0]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isDark, setIsDark] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Apply CSS variables directly to :root — foolproof, cache-proof theming
    useEffect(() => {
        const root = document.documentElement;
        if (isDark) {
            root.style.setProperty("--bg", "#1c1c1c");
            root.style.setProperty("--fg", "#f2f2f2");
            root.style.setProperty("--fg-soft", "rgba(242,242,242,0.6)");
            root.style.setProperty("--section-bg", "#161616");
            root.style.setProperty("--border", "rgba(140,140,140,0.18)");
            root.style.setProperty("--input-border", "rgba(140,140,140,0.3)");
            root.style.setProperty("--input-border-hover", "rgba(255,152,0,0.7)");
        } else {
            root.style.setProperty("--bg", "#f2f2f2");
            root.style.setProperty("--fg", "#1c1c1c");
            root.style.setProperty("--fg-soft", "rgba(28,28,28,0.6)");
            root.style.setProperty("--section-bg", "#e8e8e8");
            root.style.setProperty("--border", "rgba(28,28,28,0.12)");
            root.style.setProperty("--input-border", "rgba(28,28,28,0.25)");
            root.style.setProperty("--input-border-hover", "rgba(255,152,0,0.9)");
        }
    }, [isDark]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setAudioUrl(null);
        try {
            const response = await fetch("http://localhost:8000/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, voice_id: voice.value }),
            });
            const data = await response.json();
            if (data.status === "success") {
                setAudioUrl(`http://localhost:8000/api/audio/${data.cache_key}.wav`);
            } else {
                alert("Generation failed: " + data.message);
            }
        } catch {
            alert("Error connecting to the TTS service.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div id="top" className="page-root">
            {/* Navigation */}
            <nav className="navbar">
                <a href="#top" className="logo">ms.</a>
                <label className="switch">
                    <input
                        type="checkbox"
                        checked={isDark}
                        onChange={() => setIsDark(!isDark)}
                    />
                    <span className="slider"></span>
                </label>
            </nav>

            <main>
                {/* Hero */}
                <section className="hero">
                    <div className="hero-inner">
                        <h1 className="hero-title">
                            Mzansi-Speak
                            <span className="hero-sub">TTS Catalyst.</span>
                        </h1>
                        <div className="hero-row">
                            <p className="hero-desc">
                                By harnessing the power of cutting-edge AI and striking graphic design,
                                we can transform creative ideas into impactful audio experiences.
                            </p>
                            <div className="hero-cta-wrap">
                                <a href="#playground" className="hero-cta">
                                    <span>Scroll to App</span>
                                    <div className="cta-circle">&#8595;</div>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Playground */}
                <section id="playground" className="playground">
                    <div className="pg-inner">
                        <div className="pg-header">
                            <span className="suptitle">Interaction</span>
                            <h2 className="pg-title">
                                Unique <span className="muted">Voices</span><br />
                                For Your <span className="muted">Business.</span>
                            </h2>
                        </div>

                        <div className="form-stack">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type your script here..."
                                className="script-input"
                            />

                            <div className="controls-row">
                                {/* Custom Dropdown */}
                                <div className="dropdown-wrap" ref={dropdownRef}>
                                    <label className="field-label">Voice Selection</label>
                                    <button
                                        type="button"
                                        className="dropdown-btn"
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        aria-expanded={dropdownOpen}
                                    >
                                        <span>{voice.label}</span>
                                        <span className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}>&#9660;</span>
                                    </button>
                                    {dropdownOpen && (
                                        <ul className="dropdown-list" role="listbox">
                                            {VOICES.map((v) => (
                                                <li
                                                    key={v.value}
                                                    role="option"
                                                    className={`dropdown-item ${voice.value === v.value ? "active" : ""}`}
                                                    onClick={() => { setVoice(v); setDropdownOpen(false); }}
                                                >
                                                    {v.label}
                                                    {voice.value === v.value && <span className="check">&#10003;</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !text.trim()}
                                    className="gen-btn"
                                >
                                    <span>{loading ? "Processing..." : "Generate Audio"}</span>
                                    <span className="arrow">&#8594;</span>
                                </button>
                            </div>

                            {audioUrl && (
                                <div className="audio-result">
                                    <h5 className="result-title">Generated Result</h5>
                                    <p className="result-sub">Audible File</p>
                                    <audio ref={audioRef} src={audioUrl} controls className="audio-player" />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-inner">
                    <div className="footer-top">
                        <div className="footer-logo">ms.</div>
                        <p className="footer-copy">&copy; 2026 Mzansi-Speak South Africa</p>
                        <ul className="footer-links">
                            <li><a href="#">Privacy</a></li>
                            <li><a href="#">Terms</a></li>
                        </ul>
                    </div>
                    <div className="footer-bottom">
                        <p className="brand-credit">
                            A product of <span className="brand-name">ts.industries</span>
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
