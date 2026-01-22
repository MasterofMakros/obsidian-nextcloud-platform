import styles from "./Container.module.css";

interface ContainerProps {
    children: React.ReactNode;
    className?: string;
    size?: "default" | "narrow" | "wide";
}

export function Container({ children, className = "", size = "default" }: ContainerProps) {
    const sizeClass = {
        default: styles.default,
        narrow: styles.narrow,
        wide: styles.wide,
    }[size];

    return (
        <div className={`${styles.container} ${sizeClass} ${className}`}>
            {children}
        </div>
    );
}
