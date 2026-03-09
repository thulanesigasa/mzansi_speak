"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Voice {
    id: string;
    name: string;
    gender: string;
    accent_region: string;
    description: string;
    recommended_speed: number;
}

const API_BASE = "http://localhost:8000";

export default function Home() {
    const [text, setText] = useState("");
    const [voices, setVoices] = useState<Voice[]>([]);
    const [voice, setVoice] = useState<Voice | null>(null);
    const [voicesLoading, setVoicesLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [theme, setTheme] = useState<"dark" | "light">("dark");
    const audioRef = useRef<HTMLAudioElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === "dark" ? "light" : "dark";
            console.log("Theme toggled:", prev, "->", next);
            return next;
        });
    }, []);

    // Sync data-theme attribute to html and body so CSS vars cascade everywhere
    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        document.body.setAttribute("data-theme", theme);
    }, [theme]);

    // Fetch voices from backend on mount
    useEffect(() => {
        const fetchVoices = async () => {
            try {
                const res = await fetch(`${API_BASE}/voices`);
                const data = await res.json();
                const list: Voice[] = data.voices || [];
                setVoices(list);
                // Set default voice
                const defaultId = data.default_voice || "";
                const defaultVoice = list.find((v) => v.id === defaultId) || list[0] || null;
                setVoice(defaultVoice);
            } catch {
                // Fallback: empty list
                setVoices([]);
                setVoice(null);
            } finally {
                setVoicesLoading(false);
            }
        };
        fetchVoices();
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
        if (!text.trim() || !voice) return;
        setLoading(true);
        setAudioUrl(null);
        try {
            const response = await fetch(`${API_BASE}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, voice_id: voice.id }),
            });
            const data = await response.json();
            if (data.status === "success") {
                setAudioUrl(`${API_BASE}/api/audio/${data.cache_key}.wav`);
            } else {
                alert("Generation failed: " + data.message);
            }
        } catch {
            alert("Error connecting to the TTS service.");
        } finally {
            setLoading(false);
        }
    };

    const voiceLabel = voice ? `${voice.name} (${voice.gender})` : "Select a voice";

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
                                        disabled={voicesLoading}
                                    >
                                        <span>{voicesLoading ? "Loading voices..." : voiceLabel}</span>
                                        <span className={`dropdown-arrow ${dropdownOpen ? "open" : ""}`}>&#9660;</span>
                                    </button>
                                    {dropdownOpen && voices.length > 0 && (
                                        <ul className="dropdown-list" role="listbox">
                                            {voices.map((v) => (
                                                <li
                                                    key={v.id}
                                                    role="option"
                                                    className={`dropdown-item ${voice?.id === v.id ? "active" : ""}`}
                                                    onClick={() => { setVoice(v); setDropdownOpen(false); }}
                                                >
                                                    <div>
                                                        <span className="voice-name">{v.name}</span>
                                                        <span className="voice-meta">{v.gender} / {v.accent_region}</span>
                                                    </div>
                                                    {voice?.id === v.id && <span className="check">&#10003;</span>}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>

                                <button
                                    onClick={handleGenerate}
                                    disabled={loading || !text.trim() || !voice}
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
