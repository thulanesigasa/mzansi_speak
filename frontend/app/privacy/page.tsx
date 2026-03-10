export default function PrivacyPolicy() {
    return (
        <div className="page-root" style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Privacy Policy</h1>
            <p className="hero-desc" style={{ marginBottom: '2rem' }}>Last Updated: March 2026</p>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Introduction</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        Mzansi-Speak ("we", "us", or "our") is committed to protecting your privacy in accordance with the Protection of Personal Information Act (POPIA) of South Africa.
                    </p>
                </div>

                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Data We Collect</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        When you use our Text-to-Speech service, we collect:
                        <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                            <li>The text you input for audio generation.</li>
                            <li>Metadata about the generation (voice used, character count).</li>
                            <li>If logged in via GitHub, your public profile information.</li>
                        </ul>
                    </p>
                </div>

                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. How We Use Data</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        We use this data to provide the TTS service, prevent abuse, and improve our AI voice models. We do not sell your personal information to third parties.
                    </p>
                </div>

                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Storage and Security</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        Audio files are stored securely in Supabase Cloud. We implement industry-standard security measures to protect your data.
                    </p>
                </div>

                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>5. Your Rights</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        Under POPIA, you have the right to access, correct, or request deletion of your personal information. Contact us at privacy@mzansi-speak.com.
                    </p>
                </div>
            </section>

            <div style={{ marginTop: '4rem' }}>
                <a href="/" className="hero-cta" style={{ display: 'inline-flex' }}>
                    <span>Back to Home</span>
                    <div className="cta-circle">←</div>
                </a>
            </div>
        </div>
    );
}
