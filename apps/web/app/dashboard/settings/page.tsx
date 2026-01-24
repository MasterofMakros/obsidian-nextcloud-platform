'use client';

import { useAuth } from '../../../context/AuthContext';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function SettingsPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    async function handleLogout() {
        await logout();
        router.push('/');
    }

    async function handleDeleteAccount() {
        if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            return;
        }

        // Second confirmation
        const confirmText = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmText !== 'DELETE') {
            alert('Account deletion cancelled.');
            return;
        }

        // TODO: Implement account deletion API
        alert('Account deletion is not yet implemented. Please contact support.');
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Settings</h1>
            <p className={styles.subtitle}>Manage your account settings.</p>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Account Information</h2>
                <div className={styles.infoCard}>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Email</span>
                        <span className={styles.infoValue}>{user?.email}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.infoLabel}>Account ID</span>
                        <span className={styles.infoValue}>{user?.id}</span>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Session</h2>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Log Out
                </button>
            </div>

            <div className={styles.dangerSection}>
                <h2 className={styles.dangerTitle}>Danger Zone</h2>
                <p className={styles.dangerText}>
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button onClick={handleDeleteAccount} className={styles.deleteButton}>
                    Delete Account
                </button>
            </div>
        </div>
    );
}
