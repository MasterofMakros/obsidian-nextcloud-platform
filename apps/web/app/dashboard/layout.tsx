'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from './layout.module.css';

const navItems = [
    { href: '/dashboard', label: 'License Key', icon: '🔑' },
    { href: '/dashboard/billing', label: 'Billing', icon: '💳' },
    { href: '/dashboard/settings', label: 'Settings', icon: '⚙️' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (!user) {
        return null; // Will redirect
    }

    return (
        <div className={styles.layout}>
            {/* Header */}
            <header className={styles.header}>
                <Link href="/" className={styles.logo}>
                    🎬 Obsidian Nextcloud Media
                </Link>
                <nav className={styles.headerNav}>
                    <Link href="/docs" className={styles.headerLink}>Documentation</Link>
                </nav>
                <div className={styles.userMenu}>
                    <button className={styles.refreshButton} onClick={() => window.location.reload()}>
                        🔄
                    </button>
                    <div className={styles.userDropdown}>
                        <button className={styles.userButton}>
                            {user.email.charAt(0).toUpperCase()}
                        </button>
                        <div className={styles.dropdownMenu}>
                            <span className={styles.userEmail}>{user.email}</span>
                            <button onClick={logout} className={styles.logoutButton}>
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className={styles.main}>
                {/* Sidebar */}
                <aside className={styles.sidebar}>
                    <nav className={styles.sidebarNav}>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.navItem} ${pathname === item.href ? styles.active : ''}`}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </aside>

                {/* Content */}
                <main className={styles.content}>
                    {children}
                </main>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>Copyright © {new Date().getFullYear()} Obsidian Nextcloud Media. All rights reserved.</p>
            </footer>
        </div>
    );
}
