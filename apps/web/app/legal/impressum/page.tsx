import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Impressum",
    description: "Legal notice and company information for Fentrea GmbH.",
};


export default function ImpressumPage() {
    return (
        <main>
            <h1>Impressum</h1>

            <h2>Anbieter / Verantwortlich</h2>
            <p>
                <strong>Fentrea GmbH</strong><br />
                Murtenstrasse 116<br />
                3202 Frauenkappelen<br />
                Schweiz
            </p>

            <p>
                <strong>Handelsregister:</strong> CH-036.4.056.827-1<br />
                <strong>UID / Mehrwertsteuer:</strong> CHE-331.848.795<br />
                <strong>Geschäftsführer:</strong> René Engler<br />
                <strong>E-Mail:</strong> <a href="mailto:support@obsidian-nextcloud.media">support@obsidian-nextcloud.media</a><br />
                <strong>Website:</strong> <a href="https://obsidian-nextcloud.media">https://obsidian-nextcloud.media</a>
            </p>

            <h2>Kontakt (Support)</h2>
            <p>
                <strong>E-Mail:</strong> <a href="mailto:support@obsidian-nextcloud.media">support@obsidian-nextcloud.media</a>
            </p>

            <h2>Haftungsausschluss</h2>
            <p>
                Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Inhalte externer Seiten sind ausschließlich deren Anbietern geschuldet.
            </p>
        </main>
    );
}
