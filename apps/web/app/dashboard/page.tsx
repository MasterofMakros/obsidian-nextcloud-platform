'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface License {
    id: string;
    publicKey: string;
    status: string;
    plan: string;
    deviceCount: number;
    deviceLimit: number;
    expiresAt: string | null;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function DashboardPage() {
    const [licenses, setLicenses] = useState<License[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchLicenses();
    }, []);

    async function fetchLicenses() {
        try {
            const res = await fetch(`${API_URL}/dashboard/licenses`, {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setLicenses(data.licenses);
            } else {
                setError('Failed to load licenses');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setIsLoading(false);
        }
    }

    async function handleResetDevices(licenseId: string) {
        if (!confirm('Are you sure you want to reset all devices for this license?')) {
            return;
        }

        try {
            const res = await fetch(`${API_URL}/dashboard/licenses/${licenseId}/reset-devices`, {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                // Refresh licenses
                fetchLicenses();
            } else {
                alert('Failed to reset devices');
            }
        } catch (err) {
            alert('Network error');
        }
    }

    function copyToClipboard(text: string, id: string) {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    }

    function getStatusBadgeClass(status: string) {
        switch (status) {
            case 'ACTIVE': return styles.statusActive;
            case 'EXPIRED': return styles.statusExpired;
            case 'GRACE': return styles.statusGrace;
            case 'REVOKED': return styles.statusRevoked;
            default: return '';
        }
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading licenses...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>License Keys</h1>
            <p className={styles.subtitle}>Create and manage your license key.</p>

            {licenses.length === 0 ? (
                <div className={styles.emptyState}>
                    <p>You don't have any licenses yet.</p>
                    <a href="/pricing" className={styles.ctaButton}>Get a License</a>
                </div>
            ) : (
                <div className={styles.table}>
                    <div className={styles.tableHeader}>
                        <span>License Key</span>
                        <span>Plan</span>
                        <span>Status</span>
                        <span>Actions</span>
                    </div>

                    {licenses.map((license) => (
                        <div key={license.id} className={styles.tableRow}>
                            <div className={styles.keyCell}>
                                <code className={styles.keyCode}>{license.publicKey}</code>
                                <button
                                    className={styles.copyButton}
                                    onClick={() => copyToClipboard(license.publicKey, license.id)}
                                    title="Copy to clipboard"
                                >
                                    {copiedId === license.id ? '✓' : '📋'}
                                </button>
                            </div>
                            <span className={styles.planBadge}>{license.plan}</span>
                            <span className={`${styles.statusBadge} ${getStatusBadgeClass(license.status)}`}>
                                {license.status}
                            </span>
                            <button
                                className={styles.actionButton}
                                onClick={() => handleResetDevices(license.id)}
                                title="Reset devices"
                            >
                                🔄
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className={styles.hint}>
                Please put your license key in the Plugin settings.
            </p>

            {/* Discord CTA */}
            <div className={styles.discordCard}>
                <div className={styles.discordHeader}>
                    <span className={styles.discordIcon}>💬</span>
                    <strong>Join Our Discord for Support</strong>
                </div>
                <p className={styles.discordText}>
                    Get help, share feedback, and connect with other users in our Discord server.
                </p>
                <a href="https://discord.gg/obsidian-nextcloud" target="_blank" rel="noopener noreferrer" className={styles.discordButton}>
                    Join Discord Server
                </a>
            </div>
        </div>
    );
}
