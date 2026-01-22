import Link from "next/link";

export default function CheckoutSuccess() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '2rem',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            {/* Success Icon */}
            <div style={{
                fontSize: '4rem',
                marginBottom: '1rem'
            }}>
                ✅
            </div>

            <h1 style={{
                color: 'var(--color-brand-success)',
                fontSize: '2rem',
                marginBottom: '0.5rem'
            }}>
                Payment Successful!
            </h1>

            <p style={{
                color: 'var(--color-text-muted)',
                marginBottom: '2rem',
                fontSize: '1.1rem'
            }}>
                Thank you for upgrading to <strong>Pro</strong>. Your license is now active.
            </p>

            {/* What You Got */}
            <div style={{
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                width: '100%',
                marginBottom: '2rem',
                textAlign: 'left'
            }}>
                <h2 style={{
                    color: 'var(--color-text-normal)',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                }}>
                    🎉 Your Pro License Includes:
                </h2>
                <ul style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    color: 'var(--color-text-muted)',
                    lineHeight: '1.8'
                }}>
                    <li>✓ 4K Video Streaming</li>
                    <li>✓ Unlimited Offline Cache</li>
                    <li>✓ Background Sync</li>
                    <li>✓ Multi-Device Support</li>
                    <li>✓ Priority Support</li>
                    <li>✓ Early Access to New Features</li>
                </ul>
            </div>

            {/* Next Steps */}
            <div style={{
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                width: '100%',
                marginBottom: '2rem',
                textAlign: 'left',
                border: '1px solid var(--color-brand-primary)'
            }}>
                <h2 style={{
                    color: 'var(--color-brand-primary)',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                }}>
                    🚀 Next Steps: Activate in Obsidian
                </h2>
                <ol style={{
                    padding: '0 0 0 1.2rem',
                    margin: 0,
                    color: 'var(--color-text-muted)',
                    lineHeight: '2'
                }}>
                    <li><strong>Check your email</strong> – Your license key was sent to your registered address.</li>
                    <li><strong>Open Obsidian</strong> → Settings → Community Plugins → Nextcloud Media</li>
                    <li><strong>Paste your license key</strong> in the &quot;License&quot; field</li>
                    <li><strong>Click &quot;Activate&quot;</strong> – Pro features unlock instantly!</li>
                </ol>
            </div>

            {/* License Key Box */}
            <div style={{
                backgroundColor: 'var(--color-background-primary)',
                border: '1px dashed var(--color-border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                width: '100%',
                marginBottom: '2rem',
                fontFamily: 'var(--typography-family-mono)',
                fontSize: '0.85rem',
                color: 'var(--color-text-muted)'
            }}>
                <p style={{ margin: 0 }}>📧 License key sent to: <strong>[your email]</strong></p>
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem' }}>
                    Didn&apos;t receive it? Check spam or contact support@obsidian-nextcloud.media
                </p>
            </div>

            {/* Support Info */}
            <div style={{
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                marginBottom: '2rem'
            }}>
                <p>Need help? <a href="mailto:support@obsidian-nextcloud.media" style={{ color: 'var(--color-brand-primary)' }}>Contact Support</a></p>
            </div>

            {/* Legal Links */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)'
            }}>
                <Link href="/legal/terms" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Terms</Link>
                <Link href="/legal/privacy" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>Privacy</Link>
                <Link href="/legal/eula" style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}>EULA</Link>
            </div>

            {/* Return Home */}
            <Link href="/" style={{
                marginTop: '2rem',
                color: 'var(--color-brand-primary)',
                textDecoration: 'none',
                fontSize: '0.9rem'
            }}>
                ← Return to Home
            </Link>
        </main>
    );
}
