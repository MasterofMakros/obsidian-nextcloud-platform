import Link from "next/link";
import styles from "./page.module.css";

const faqs = [
    {
        category: "General",
        questions: [
            {
                q: "What is Obsidian Nextcloud Media?",
                a: "A plugin that syncs media files (images, videos, audio) between your Obsidian vault and your Nextcloud instance. It's designed for privacy-conscious users who want full control over their data."
            },
            {
                q: "Is it free?",
                a: "Yes! Core functionality is free. Pro ($29 lifetime) adds unlimited cache, 4K streaming, background sync, and priority support."
            },
            {
                q: "Who develops this?",
                a: "Fentrea GmbH, a small software company based in Switzerland. We don't sell your data."
            }
        ]
    },
    {
        category: "Licensing & Pricing",
        questions: [
            {
                q: "Is Pro a subscription?",
                a: "No. Pro is a one-time payment of $29 for lifetime access. No recurring fees."
            },
            {
                q: "Can I use my license on multiple devices?",
                a: "Yes, your Pro license works on multiple devices linked to your account."
            },
            {
                q: "How do I activate my Pro license?",
                a: "Purchase Pro → Check email for license key → Plugin Settings → License → Paste key → Activate."
            }
        ]
    },
    {
        category: "Privacy & Security",
        questions: [
            {
                q: "Do you track my usage?",
                a: "No. We have zero analytics, telemetry, or tracking of any kind."
            },
            {
                q: "Where is my data stored?",
                a: "Your media files are stored on YOUR Nextcloud instance. We don't store any of your media."
            },
            {
                q: "Is this GDPR compliant?",
                a: "Yes. We're based in Switzerland and comply with both GDPR (EU) and Swiss data protection laws."
            }
        ]
    },
    {
        category: "Troubleshooting",
        questions: [
            {
                q: "Sync isn't working. What should I check?",
                a: "Verify your Nextcloud URL, check WebDAV is enabled, confirm credentials, and check your internet connection."
            },
            {
                q: "How do I contact support?",
                a: "Email support@obsidian-nextcloud.media. Pro users get priority responses (usually 24-48 hours)."
            }
        ]
    },
    {
        category: "Refunds",
        questions: [
            {
                q: "Can I get a refund?",
                a: "Yes, we offer a 14-day money-back guarantee. Contact support@obsidian-nextcloud.media."
            }
        ]
    }
];

export default function FAQPage() {
    return (
        <main className={styles.main}>
            <h1 className={styles.title}>Frequently Asked Questions</h1>
            <p className={styles.subtitle}>
                Can't find what you're looking for? <a href="mailto:support@obsidian-nextcloud.media" className={styles.link}>Contact Support</a>
            </p>

            <div className={styles.faqContainer}>
                {faqs.map((category) => (
                    <section key={category.category} className={styles.category}>
                        <h2 className={styles.categoryTitle}>{category.category}</h2>
                        <div className={styles.questions}>
                            {category.questions.map((faq, index) => (
                                <details key={index} className={styles.faqItem}>
                                    <summary className={styles.question}>{faq.q}</summary>
                                    <p className={styles.answer}>{faq.a}</p>
                                </details>
                            ))}
                        </div>
                    </section>
                ))}
            </div>

            <footer className={styles.footer}>
                <p>Still have questions? <a href="mailto:support@obsidian-nextcloud.media" className={styles.link}>Email us</a></p>
                <div className={styles.legalLinks}>
                    <Link href="/legal/terms">Terms</Link>
                    <Link href="/legal/privacy">Privacy</Link>
                    <Link href="/legal/eula">EULA</Link>
                </div>
            </footer>
        </main>
    );
}
