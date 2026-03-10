"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

interface Voice {
    id: string;
    name: string;
    gender: string;
    accent_region: string;
    description: string;
    recommended_speed: number;
    language: string;
    is_premium?: boolean;
    base_voices?: Record<string, number>;
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
    const [selectedLanguage, setSelectedLanguage] = useState("English");
    const [languages, setLanguages] = useState<string[]>(["English"]);
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
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);
            try {
                const res = await fetch(`${API_BASE}/voices`, { signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await res.json();
                const list: Voice[] = data.voices || [];
                setVoices(list);

                // Extract unique languages
                const langs = Array.from(new Set(list.map(v => v.language || "English")));
                setLanguages(langs);

                // Set default voice
                const defaultId = data.default_voice || "";
                const defaultVoice = list.find((v) => v.id === defaultId) || list[0] || null;
                setVoice(defaultVoice);
                if (defaultVoice) setSelectedLanguage(defaultVoice.language || "English");
            } catch (err) {
                console.error("Failed to fetch voices:", err);
                setVoices([]);
                setVoice(null);
            } finally {
                setVoicesLoading(false);
            }
        };
        fetchVoices();
    }, []);

    const filteredVoices = voices.filter(v => (v.language || "English") === selectedLanguage);

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

    interface AudioItem {
        cacheKey: string;
        textSnippet: string;
        voiceName: string;
    }
    const [audioHistory, setAudioHistory] = useState<AudioItem[]>([]);

    const handleGenerate = async () => {
        if (!text.trim() || !voice) return;
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    voice_id: voice.id,
                    lang: voice.language === "English" ? "en-us" : "en-gb" // Fallback phonetic mapping
                }),
            });
            const data = await response.json();
            if (data.status === "success") {
                setAudioHistory((prev) => [
                    {
                        cacheKey: data.cache_key,
                        textSnippet: text.length > 50 ? text.substring(0, 50) + "..." : text,
                        voiceName: voice.name
                    },
                    ...prev
                ]);
            } else {
                alert("Generation failed: " + data.message);
            }
        } catch {
            alert("Error connecting to the TTS service.");
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (cacheKey: string, format: "wav" | "mp3") => {
        const url = `${API_BASE}/api/audio/${cacheKey}.${format}`;
        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to download");
            const blob = await res.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;
            a.download = `mzansi-speak-${cacheKey}.${format}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(downloadUrl);
        } catch (e) {
            console.error("Download error:", e);
            alert("Could not download audio.");
        }
    };

    const voiceLabel = voice ? `${voice.name} (${voice.gender})` : "Select a voice";

    return (
        <div id="top" className="page-root" data-theme={theme}>
            {/* Navigation */}
            <nav className="navbar">
                <a href="#top" className="logo">ms.</a>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <button
                        type="button"
                        className="theme-btn"
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? "\u263D" : "\u2600"}
                    </button>
                </div>
            </nav>

            <main>
                {/* Hero */}
                <section className="hero">
                    {/* Add Image for LCP Optimization */}
                    <Image
                        src="/hero-bg.webp"
                        alt="Mzansi-Speak Abstract Waveform"
                        fill
                        priority
                        className="hero-bg-img"
                        style={{ objectFit: "cover", zIndex: -1, opacity: 0.15 }}
                    />
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

                            {/* Language Switcher */}
                            <div className="language-row" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                                {languages.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => {
                                            setSelectedLanguage(lang);
                                            // Auto-select first voice in this language if current voice is different lang
                                            const firstInLang = voices.find(v => (v.language || "English") === lang);
                                            if (firstInLang) setVoice(firstInLang);
                                        }}
                                        className={`lang-tab ${selectedLanguage === lang ? "active" : ""}`}
                                        style={{
                                            padding: '0.5rem 1rem',
                                            borderRadius: '2rem',
                                            border: '1px solid var(--border)',
                                            background: selectedLanguage === lang ? 'var(--primary)' : 'transparent',
                                            color: selectedLanguage === lang ? 'var(--bg)' : 'var(--text)',
                                            fontSize: '0.8rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s ease',
                                            opacity: selectedLanguage === lang ? 1 : 0.6
                                        }}
                                    >
                                        {lang}
                                    </button>
                                ))}
                            </div>

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
                                    {filteredVoices.length > 0 && (
                                        <ul className={`dropdown-list ${dropdownOpen ? "open" : ""}`} role="listbox">
                                            {filteredVoices.map((v) => (
                                                <li
                                                    key={v.id}
                                                    role="option"
                                                    className={`dropdown-item ${voice?.id === v.id ? "active" : ""}`}
                                                    onClick={() => { setVoice(v); setDropdownOpen(false); }}
                                                >
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                            <span className="voice-name">{v.name}</span>
                                                            {v.is_premium && (
                                                                <span className="premium-badge" style={{
                                                                    fontSize: '0.6rem',
                                                                    background: 'var(--primary)',
                                                                    color: 'var(--bg)',
                                                                    padding: '0.1rem 0.4rem',
                                                                    borderRadius: '1rem',
                                                                    fontWeight: 'bold',
                                                                    textTransform: 'uppercase'
                                                                }}>
                                                                    Pro
                                                                </span>
                                                            )}
                                                        </div>
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

                            {audioHistory.length > 0 && (
                                <div className="history-section" style={{ marginTop: '4rem', paddingTop: '3rem', borderTop: '1px solid var(--border)' }}>
                                    <h4 className="suptitle" style={{ marginBottom: '2rem' }}>Session History</h4>
                                    <div className="history-list" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                        {audioHistory.map((item) => (
                                            <div key={item.cacheKey} className="audio-result" style={{ marginTop: 0 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                                                    <h5 className="result-title">Voice: {item.voiceName}</h5>
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{item.textSnippet}</span>
                                                </div>
                                                <audio
                                                    ref={audioRef}
                                                    src={`${API_BASE}/api/audio/${item.cacheKey}.wav`}
                                                    controls
                                                    className="audio-player"
                                                />

                                                <div className="download-actions">
                                                    <p className="download-label">Download Audio As:</p>
                                                    <div className="download-buttons">
                                                        <button
                                                            className="dl-btn"
                                                            onClick={() => handleDownload(item.cacheKey, "wav")}
                                                            aria-label="Download WAV"
                                                        >
                                                            WAV (Lossless)
                                                        </button>
                                                        <button
                                                            className="dl-btn"
                                                            onClick={() => handleDownload(item.cacheKey, "mp3")}
                                                            aria-label="Download MP3"
                                                        >
                                                            MP3 (Compressed)
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
                            <li><a href="/privacy">Privacy</a></li>
                            <li><a href="/terms">Terms</a></li>
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
