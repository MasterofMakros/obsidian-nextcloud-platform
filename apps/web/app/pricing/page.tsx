import styles from "./page.module.css";

export default function Pricing() {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Choose your plan.</h1>

            <div className={styles.grid}>
                {/* Core Plan */}
                <div className={styles.card}>
                    <h2 className={styles.planName}>Core</h2>
                    <p className={styles.price}>$0 <span className={styles.period}>/ forever</span></p>
                    <ul className={styles.features}>
                        <li>Standard Sync</li>
                        <li>1GB Cache</li>
                        <li>Community Support</li>
                    </ul>
                    <button className={styles.btnSecondary}>Install Now</button>
                </div>

                {/* Pro Plan */}
                <div className={`${styles.card} ${styles.cardPro}`}>
                    <h2 className={`${styles.planName} ${styles.planNamePro}`}>Pro</h2>
                    <p className={styles.price}>$29 <span className={styles.period}>/ lifetime</span></p>
                    <ul className={styles.features}>
                        <li>4K Streaming</li>
                        <li>Unlimited Cache</li>
                        <li>Priority Support</li>
                        <li>Early Access</li>
                    </ul>
                    <button className={styles.btnPrimary}>Get Pro</button>
                </div>
            </div>
        </main>
    );
}
