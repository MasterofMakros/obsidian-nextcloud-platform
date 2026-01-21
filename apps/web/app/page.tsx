import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
    return (
        <main className={styles.main}>
            {/* Hero Section */}
            <section className={styles.hero}>
                <div className={styles.heroContent}>
                    <h1 className={styles.title}>Your Second Brain. <br /> Now Sovereign.</h1>
                    <p className={styles.subtitle}>
                        Seamlessly sync media between Obsidian and Nextcloud. <br />
                        Private. Offline-first. Fast.
                    </p>
                    <div className={styles.ctaGroup}>
                        <Link href="/docs/install" className={styles.btnPrimary}>
                            Download Plugin
                        </Link>
                        <a href="https://github.com/MasterofMakros/obsidian-nextcloud-platform" className={styles.btnSecondary}>
                            View on GitHub
                        </a>
                    </div>
                </div>
            </section>

            {/* Features Grid */}
            <section className={styles.features}>
                <div className={styles.featureCard}>
                    <div className={styles.icon}>🔒</div>
                    <h3 className={styles.featureTitle}>Privacy First</h3>
                    <p className={styles.featureText}>End-to-end encrypted P2P and WebDAV sync. Your data stays yours.</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.icon}>📡</div>
                    <h3 className={styles.featureTitle}>Offline Ready</h3>
                    <p className={styles.featureText}>Full local caching for seamless access without internet connection.</p>
                </div>
                <div className={styles.featureCard}>
                    <div className={styles.icon}>▶️</div>
                    <h3 className={styles.featureTitle}>Media Rich</h3>
                    <p className={styles.featureText}>Optimized video streaming and instant image previews within your notes.</p>
                </div>
            </section>
        </main>
    );
}
