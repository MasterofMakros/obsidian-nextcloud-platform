import Link from 'next/link';
import { Container } from "@/components/Container";
import { Prose } from "@/components/Prose";
import { SiteFooter } from "@/components/SiteFooter";
import styles from "./layout.module.css";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main className={styles.main}>
                <Container size="narrow">
                    <nav className={styles.breadcrumb}>
                        <Link href="/" className={styles.backLink}>
                            ← Back to Home
                        </Link>
                    </nav>
                    <Prose>
                        {children}
                    </Prose>
                </Container>
            </main>
            <SiteFooter />
        </>
    );
}

