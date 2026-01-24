import Link from "next/link";
import Image from "next/image";
import { GitHubIcon } from "./icons/GitHubIcon";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Image
                        src="/logo.svg"
                        alt="Obsidian Nextcloud Media"
                        width={32}
                        height={32}
                        className={styles.logoIcon}
                    />
                    <span className={styles.logoText}>Obsidian Nextcloud Media</span>
                </Link>
                <nav className={styles.nav}>
                    <Link href="/pricing" className={styles.navLink}>Pricing</Link>
                    <Link href="/faq" className={styles.navLink}>FAQ</Link>
                    <Link href="/docs" className={styles.navLink}>Docs</Link>
                    <a
                        href="https://github.com/MasterofMakros/obsidian-nextcloud-platform"
                        className={`${styles.navLink} ${styles.githubLink}`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <GitHubIcon size={18} />
                        <span>GitHub</span>
                    </a>
                </nav>
            </div>
        </header>
    );
}


