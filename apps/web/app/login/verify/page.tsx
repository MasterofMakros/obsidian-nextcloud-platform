'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import styles from '../page.module.css';

export default function VerifyPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { verifyMagicLink } = useAuth();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setErrorMessage('Missing verification token');
            return;
        }

        verifyMagicLink(token).then((result) => {
            if (result.success) {
                setStatus('success');
                // Redirect to dashboard after short delay
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
            } else {
                setStatus('error');
                setErrorMessage(result.error || 'Verification failed');
            }
        });
    }, [searchParams, verifyMagicLink, router]);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                {status === 'loading' && (
                    <>
                        <div className={styles.spinner}></div>
                        <h1 className={styles.title}>Verifying...</h1>
                        <p className={styles.subtitle}>Please wait while we sign you in</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className={styles.successIcon}>✓</div>
                        <h1 className={styles.title}>Success!</h1>
                        <p className={styles.subtitle}>Redirecting to your dashboard...</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className={styles.errorIcon}>✕</div>
                        <h1 className={styles.title}>Verification Failed</h1>
                        <p className={styles.subtitle}>{errorMessage}</p>
                        <a href="/login" className={styles.primaryButton} style={{ marginTop: '1.5rem', display: 'inline-block', textDecoration: 'none' }}>
                            Try Again
                        </a>
                    </>
                )}
            </div>
        </div>
    );
}
