import Link from "next/link";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.brand}>
                    <p className={styles.logo}>Obsidian Nextcloud Media</p>
                    <p className={styles.copyright}>© 2026 Fentrea GmbH. All rights reserved.</p>
                    <p className={styles.tagline}>🇨🇭 Swiss-Engineered • Privacy-First</p>
                </div>
                <div className={styles.links}>
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Product</h4>
                        <Link href="/pricing">Pricing</Link>
                        <Link href="/faq">FAQ</Link>
                        <Link href="/docs">Documentation</Link>
                        <a href="https://github.com/MasterofMakros/obsidian-nextcloud-platform" target="_blank" rel="noopener noreferrer">GitHub</a>
                    </div>
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Legal</h4>
                        <Link href="/legal/impressum">Impressum</Link>
                        <Link href="/legal/privacy">Privacy Policy</Link>
                        <Link href="/legal/terms">Terms of Service</Link>
                        <Link href="/legal/eula">EULA</Link>
                    </div>
                    <div className={styles.column}>
                        <h4 className={styles.heading}>Support</h4>
                        <a href="mailto:support@obsidian-nextcloud.media">Contact</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
