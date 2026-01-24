import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
    title: {
        default: "Obsidian Nextcloud Media",
        template: "%s | Obsidian Nextcloud Media",
    },
    description: "Seamlessly sync media between Obsidian and Nextcloud. Swiss-engineered, privacy-first, offline-ready.",
    icons: {
        icon: [
            { url: "/logo.svg", type: "image/svg+xml" },
            { url: "/favicon.ico", sizes: "any" },
            { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
        ],
        apple: "/apple-touch-icon.png",
    },
    openGraph: {
        title: "Obsidian Nextcloud Media",
        description: "Seamlessly sync media between Obsidian and Nextcloud.",
        type: "website",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                <SiteHeader />
                {children}
            </body>
        </html>
    );
}

