export default function Docs() {
    return (
        <main style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Documentation</h1>
            <p>Welcome to the Obsidian Nextcloud Media documentation.</p>
            <hr style={{ borderColor: 'var(--color-border-subtle)', margin: '2rem 0' }} />
            <h2>Installation</h2>
            <ol style={{ paddingLeft: '1.5rem', color: 'var(--color-text-muted)' }}>
                <li>Open Obsidian Settings</li>
                <li>Go to Community Plugins</li>
                <li>Search for "Nextcloud Media"</li>
                <li>Click Install</li>
            </ol>
        </main>
    );
}
