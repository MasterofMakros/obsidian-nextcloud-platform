export default function CheckoutSuccess() {
    return (
        <main style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center'
        }}>
            <h1 style={{ color: 'var(--color-brand-success)' }}>Payment Successful!</h1>
            <p style={{ color: 'var(--color-text-muted)', marginTop: '1rem' }}>
                Thank you for upgrading to Pro. Your license key has been sent to your email.
            </p>
            <div style={{
                marginTop: '2rem',
                padding: '1rem',
                backgroundColor: 'var(--color-background-secondary)',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--typography-family-mono)'
            }}>
                Check your inbox for instructions.
            </div>
        </main>
    );
}
