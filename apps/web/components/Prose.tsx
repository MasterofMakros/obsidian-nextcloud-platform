import styles from "./Prose.module.css";

interface ProseProps {
    children: React.ReactNode;
    className?: string;
}

/**
 * Prose component for long-form content (legal pages, blog posts, documentation).
 * Applies consistent typography, spacing, and link styles.
 */
export function Prose({ children, className = "" }: ProseProps) {
    return (
        <div className={`${styles.prose} ${className}`}>
            {children}
        </div>
    );
}
