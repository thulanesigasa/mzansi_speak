"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
// @ts-ignore
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

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

    // Auth & MFA State
    const supabase = createClientComponentClient();
    const [user, setUser] = useState<any>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [secret, setSecret] = useState<string | null>(null);
    const [verifyCode, setVerifyCode] = useState("");
    const [showEnrollModal, setShowEnrollModal] = useState(false);

    // Check user session
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        checkUser();

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setUser(session?.user || null);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, [supabase]);

    const handleEnrollMFA = async () => {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
            if (error) throw error;
            if (data.totp.qr_code && data.id) {
                setQrCode(data.totp.qr_code);
                setSecret(data.id); // Storing factor_id in secret for verification
            }
        } catch (err) {
            console.error("MFA Enrollment Error:", err);
            alert("Failed to initiate MFA enrollment.");
        }
    };

    const handleVerifyMFA = async () => {
        if (!secret) return;
        try {
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: secret });
            if (challengeError) throw challengeError;

            const { error: verifyError } = await supabase.auth.mfa.verify({
                factorId: secret,
                challengeId: challengeData.id,
                code: verifyCode
            });

            if (verifyError) throw verifyError;

            alert("MFA successfully enabled and verified!");
            setShowEnrollModal(false);
        } catch (err) {
            console.error("MFA Verification Error:", err);
            alert("Invalid verification code. Please try again.");
        }
    };

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
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            try {
                const res = await fetch(`${API_BASE}/voices`, { signal: controller.signal });
                clearTimeout(timeoutId);
                const data = await res.json();
                const list: Voice[] = data.voices || [];
                setVoices(list);
                // Set default voice
                const defaultId = data.default_voice || "";
                const defaultVoice = list.find((v) => v.id === defaultId) || list[0] || null;
                setVoice(defaultVoice);
            } catch (err) {
                console.error("Failed to fetch voices:", err);
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
                body: JSON.stringify({ text, voice_id: voice.id }),
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
                    {user ? (
                        <button className="theme-btn" style={{ fontSize: '0.9rem', width: 'auto', padding: '0 1rem' }} onClick={() => setShowEnrollModal(true)}>
                            Admin MFA
                        </button>
                    ) : (
                        <button className="theme-btn" style={{ fontSize: '0.9rem', width: 'auto', padding: '0 1rem' }} onClick={() => supabase.auth.signInWithOAuth({ provider: 'github' })}>
                            Admin Login
                        </button>
                    )}
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
                                    {voices.length > 0 && (
                                        <ul className={`dropdown-list ${dropdownOpen ? "open" : ""}`} role="listbox">
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

                {showEnrollModal && (
                    <div className="modal-overlay" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
                        <div className="modal-content" style={{ background: 'var(--surface)', padding: '2rem', borderRadius: '16px', maxWidth: '400px', width: '100%', border: '1px solid var(--border)' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--text)' }}>Enroll MFA Endpoint</h3>
                            <p style={{ marginBottom: '1.5rem', fontSize: '0.9rem', color: 'var(--muted)' }}>Secure your admin session with Time-Based One-Time Passwords.</p>

                            {!qrCode ? (
                                <button onClick={handleEnrollMFA} className="gen-btn" style={{ width: '100%' }}>
                                    Start Enrollment
                                </button>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                                    {/* The SVG is embedded directly into the src */}
                                    <img src={qrCode} alt="TOTP QR Code" style={{ background: '#fff', padding: '1rem', borderRadius: '8px', maxWidth: '100%' }} />
                                    <input
                                        type="text"
                                        placeholder="6-digit verification code"
                                        value={verifyCode}
                                        onChange={(e) => setVerifyCode(e.target.value)}
                                        className="script-input"
                                        style={{ minHeight: 'auto', padding: '0.8rem', textAlign: 'center', letterSpacing: '4px', fontSize: '1.2rem' }}
                                    />
                                    <button onClick={handleVerifyMFA} className="gen-btn" style={{ width: '100%' }}>
                                        Verify & Enable
                                    </button>
                                </div>
                            )}

                            <button onClick={() => setShowEnrollModal(false)} style={{ marginTop: '1rem', background: 'transparent', color: 'var(--muted)', width: '100%', border: 'none', cursor: 'pointer', outline: 'none' }}>
                                Close
                            </button>
                        </div>
                    </div>
                )}
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
