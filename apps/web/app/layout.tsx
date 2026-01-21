import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Obsidian Nextcloud Media",
    description: "Seamlessly sync media between Obsidian and Nextcloud.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
