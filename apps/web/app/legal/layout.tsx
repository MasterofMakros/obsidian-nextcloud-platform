import Link from 'next/link';

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            <nav className="mb-8 flex gap-4 text-sm text-[var(--text-secondary)]">
                <Link href="/" className="hover:text-[var(--primary)]">← Back to Home</Link>
            </nav>
            <article className="prose prose-invert max-w-none">
                {children}
            </article>
        </div>
    );
}
