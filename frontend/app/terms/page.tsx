export default function TermsOfService() {
    return (
        <div className="page-root" style={{ padding: '8rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 className="hero-title" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Terms of Service</h1>
            <p className="hero-desc" style={{ marginBottom: '2rem' }}>Last Updated: March 2026</p>

            <section style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        By using Mzansi-Speak, you agree to comply with and be bound by these terms. If you do not agree, please do not use the service.
                    </p>
                </div>

                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>2. Use of Service</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        You may use Mzansi-Speak for legal purposes only. You agree not to generate audio that is defamatory, offensive, or violates intellectual property rights.
                    </p>
                </div>

                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>3. Intellectual Property</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        The AI voice models and software are the property of Mzansi-Speak. You retain ownership of the text you provide, but grant us a license to process it to generate audio.
                    </p>
                </div>

                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>4. Limitation of Liability</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        Mzansi-Speak is provided "as is". We are not liable for any damages resulting from the use or inability to use the service.
                    </p>
                </div>

                <div>
                    <h2 className="pg-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>5. Governing Law</h2>
                    <p style={{ color: 'var(--muted)', lineHeight: '1.6' }}>
                        These terms are governed by the laws of the Republic of South Africa.
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
