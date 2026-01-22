import Link from "next/link";
import styles from "./page.module.css";

const features = [
    { name: "Media Sync", free: true, pro: true },
    { name: "WebDAV Connection", free: true, pro: true },
    { name: "Image Thumbnails", free: true, pro: true },
    { name: "Offline Cache", free: "1GB", pro: "Unlimited" },
    { name: "Background Sync", free: false, pro: true },
    { name: "4K Video Streaming", free: false, pro: true },
    { name: "Multi-Device Sync", free: false, pro: true },
    { name: "Priority Support", free: false, pro: true },
    { name: "Early Access Features", free: false, pro: true },
];

export default function Pricing() {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Choose your plan.</h1>
            <p className={styles.subtitle}>Start free, upgrade when you need more power.</p>

            <div className={styles.grid}>
                {/* Core Plan */}
                <div className={styles.card}>
                    <h2 className={styles.planName}>Core</h2>
                    <p className={styles.price}>$0 <span className={styles.period}>/ forever</span></p>
                    <p className={styles.planDescription}>Perfect for getting started with Obsidian media sync.</p>
                    <ul className={styles.featuresList}>
                        <li>✓ Standard Sync</li>
                        <li>✓ 1GB Local Cache</li>
                        <li>✓ Community Support</li>
                    </ul>
                    <Link href="/docs/install" className={styles.btnSecondary}>
                        Install Free
                    </Link>
                </div>

                {/* Pro Plan */}
                <div className={`${styles.card} ${styles.cardPro}`}>
                    <div className={styles.popularBadge}>Most Popular</div>
                    <h2 className={`${styles.planName} ${styles.planNamePro}`}>Pro</h2>
                    <p className={styles.price}>$29 <span className={styles.period}>/ lifetime</span></p>
                    <p className={styles.planDescription}>Everything you need for power users.</p>
                    <ul className={styles.featuresList}>
                        <li>✓ Everything in Core</li>
                        <li>✓ 4K Video Streaming</li>
                        <li>✓ Unlimited Cache</li>
                        <li>✓ Background Sync</li>
                        <li>✓ Priority Support</li>
                        <li>✓ Early Access</li>
                    </ul>
                    <button className={styles.btnPrimary}>Get Pro – $29</button>
                </div>
            </div>

            {/* Feature Comparison Matrix */}
            <section className={styles.comparisonSection}>
                <h2 className={styles.comparisonTitle}>Feature Comparison</h2>
                <table className={styles.comparisonTable}>
                    <thead>
                        <tr>
                            <th>Feature</th>
                            <th>Core (Free)</th>
                            <th>Pro ($29)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {features.map((feature) => (
                            <tr key={feature.name}>
                                <td>{feature.name}</td>
                                <td>
                                    {feature.free === true ? "✓" : feature.free === false ? "—" : feature.free}
                                </td>
                                <td className={styles.proCellHighlight}>
                                    {feature.pro === true ? "✓" : feature.pro === false ? "—" : feature.pro}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            {/* Trust Footer */}
            <section className={styles.trustSection}>
                <p className={styles.trustText}>
                    🇨🇭 Developed by <strong>Fentrea GmbH</strong> in Switzerland. Privacy-first. No tracking.
                </p>
                <div className={styles.legalLinks}>
                    <Link href="/legal/terms">Terms</Link>
                    <Link href="/legal/privacy">Privacy</Link>
                    <Link href="/legal/eula">EULA</Link>
                </div>
            </section>
        </main>
    );
}
