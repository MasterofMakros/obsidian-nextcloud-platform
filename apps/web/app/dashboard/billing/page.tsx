'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

interface Subscription {
    id: string;
    status: string;
    plan: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}

interface BillingData {
    hasSubscription: boolean;
    subscription?: Subscription;
    message?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function BillingPage() {
    const [billing, setBilling] = useState<BillingData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCanceling, setIsCanceling] = useState(false);

    useEffect(() => {
        fetchBilling();
    }, []);

    async function fetchBilling() {
        try {
            const res = await fetch(`${API_URL}/dashboard/billing`, {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                setBilling(data);
            }
        } catch (err) {
            console.error('Failed to fetch billing:', err);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleCancelSubscription() {
        if (!confirm('Are you sure you want to cancel auto-renewal? Your subscription will remain active until the end of the current period.')) {
            return;
        }

        setIsCanceling(true);
        try {
            const res = await fetch(`${API_URL}/dashboard/billing/cancel`, {
                method: 'POST',
                credentials: 'include'
            });

            if (res.ok) {
                fetchBilling(); // Refresh data
            } else {
                alert('Failed to cancel subscription');
            }
        } catch (err) {
            alert('Network error');
        } finally {
            setIsCanceling(false);
        }
    }

    async function handleManageBilling() {
        try {
            const res = await fetch(`${API_URL}/dashboard/billing/portal`, {
                credentials: 'include'
            });

            if (res.ok) {
                const data = await res.json();
                window.open(data.url, '_blank');
            } else {
                alert('Failed to open billing portal');
            }
        } catch (err) {
            alert('Network error');
        }
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading billing information...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Billing</h1>
            <p className={styles.subtitle}>Manage your subscription and billing details.</p>

            {billing?.hasSubscription && billing.subscription ? (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>Subscription</h2>
                    <p className={styles.planInfo}>
                        You are currently on the <strong className={styles.planName}>{billing.subscription.plan}</strong> plan.
                        {billing.subscription.cancelAtPeriodEnd ? (
                            <span className={styles.cancelNotice}> Your subscription will end on {formatDate(billing.subscription.currentPeriodEnd)}.</span>
                        ) : (
                            <span> Your subscription will renew on {formatDate(billing.subscription.currentPeriodEnd)}.</span>
                        )}
                    </p>

                    <div className={styles.actions}>
                        <a href="/pricing" className={styles.primaryButton}>View Plans</a>
                        {!billing.subscription.cancelAtPeriodEnd && (
                            <button
                                onClick={handleCancelSubscription}
                                className={styles.secondaryButton}
                                disabled={isCanceling}
                            >
                                {isCanceling ? 'Canceling...' : 'Cancel Auto-Renewal'}
                            </button>
                        )}
                    </div>

                    <button onClick={handleManageBilling} className={styles.linkButton}>
                        Manage Billing on Stripe →
                    </button>
                </div>
            ) : (
                <div className={styles.card}>
                    <h2 className={styles.cardTitle}>No Active Subscription</h2>
                    <p className={styles.noSubText}>You don't have an active subscription.</p>
                    <a href="/pricing" className={styles.primaryButton}>View Plans</a>
                </div>
            )}
        </div>
    );
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric'
    });
}
