"use client";

import { useState, useRef, useEffect, useCallback } from "react";

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
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const audioRef = useRef<HTMLAudioElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

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
        <div id="top" className="page-root" data-theme={theme}>
            {/* Navigation */}
            <nav className="navbar">
                <a href="#top" className="logo">ms.</a>
                <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                    <span className="toggle-track">
                        <span className="toggle-thumb" />
                    </span>
                </button>
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
