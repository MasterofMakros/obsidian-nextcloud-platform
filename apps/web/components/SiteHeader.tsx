import Link from "next/link";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <span className={styles.logoIcon}>◈</span>
                    <span className={styles.logoText}>Obsidian Nextcloud Media</span>
                </Link>
                <nav className={styles.nav}>
                    <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                    <Link href="/faq" className={styles.navLink}>FAQ</Link>
                    <Link href="/docs" className={styles.navLink}>Docs</Link>
                    <a
                        href="https://github.com/MasterofMakros/obsidian-nextcloud-platform"
                        className={styles.navLink}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        GitHub
                    </a>
                </nav>
            </div>
        </header>
    );
}
