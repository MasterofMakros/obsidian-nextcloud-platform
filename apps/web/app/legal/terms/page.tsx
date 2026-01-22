import LegalLayout from '../layout';

export default function TermsPage() {
    return (
        <main>
            <h1>Allgemeine Vertragsbedingungen / Terms of Service</h1>

            <h2>1. Geltungsbereich</h2>
            <p>Diese Bedingungen regeln die Nutzung aller Dienste und Softwareprodukte der <strong>Fentrea GmbH</strong> (nachfolgend „Anbieter“).</p>

            <h2>2. Vertragspartner</h2>
            <p>
                Vertragspartner ist:<br />
                <strong>Fentrea GmbH</strong><br />
                Murtenstrasse 116<br />
                3202 Frauenkappelen<br />
                Schweiz<br />
                UID: CHE-331.848.795
            </p>

            <h2>3. Vertragsabschluss</h2>
            <p>Der Vertrag kommt mit dem Erwerb einer Lizenz über die Online-Plattform zustande. Mit dem Kauf akzeptiert der Nutzer diese Bedingungen.</p>

            <h2>4. Leistungen</h2>
            <p>Der Anbieter stellt Software-Produkte und Lizenzierungsdienste bereit, insbesondere den Synchronisations- und Lizenzservice für Obsidian-Plugins und zugehörige Backend-Dienste.</p>

            <h2>5. Pflichten des Nutzers</h2>
            <p>Der Nutzer verpflichtet sich:</p>
            <ul>
                <li>nur legitime Lizenzschlüssel zu verwenden,</li>
                <li>keine Manipulationen oder Reverse Engineering vorzunehmen,</li>
                <li>keine unbefugte Zugriffe zu versuchen.</li>
            </ul>

            <h2>6. Lizenzen</h2>

            <h3>6.1 Lizenzumfang</h3>
            <p>Mit Erwerb einer Lizenz erhält der Nutzer ein nicht-ausschließliches, nicht-übertragbares, zeitlich begrenztes Nutzungsrecht entsprechend dem gebuchten Plan.</p>

            <h3>6.2 Lizenzbegrenzung</h3>
            <p>Lizenzen sind je nach Plan auf Geräte/Instanzen begrenzt. Überschreitungen werden vom Anbieter blockiert.</p>

            <h2>7. Gebühren & Zahlung</h2>
            <p>Zahlungen erfolgen über Stripe. Sämtliche Gebühren sind zahlbar in der zum Zeitpunkt des Vertragsabschlusses gültigen Währung.</p>

            <h2>8. Haftung</h2>

            <h3>8.1 Haftungsbeschränkung</h3>
            <p>Die Haftung des Anbieters ist auf grobe Fahrlässigkeit und Vorsatz beschränkt. Für einfache Fahrlässigkeit haftet der Anbieter nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten).</p>

            <h3>8.2 Keine Garantie</h3>
            <p>Es gibt keine Garantie für unterbrechungsfreie Verfügbarkeit, es sei denn, gesetzlich anders vorgeschrieben.</p>

            <h2>9. Datenschutz</h2>
            <p>Erhebung und Verwendung personenbezogener Daten erfolgt gemäss der <strong>Datenschutzerklärung</strong> (siehe <a href="/legal/privacy">Privacy Policy</a>).</p>

            <h2>10. Schlussbestimmungen</h2>

            <h3>10.1 Anwendbares Recht</h3>
            <p>Es gilt Schweizer Recht unter Ausschluss des UN-Kaufrechts.</p>

            <h3>10.2 Gerichtsstand</h3>
            <p>Gerichtsstand ist, soweit gesetzlich zulässig, am Sitz der Fentrea GmbH (Frauenkappelen, Schweiz).</p>

            <hr className="my-8 border-[var(--border-primary)]" />
            <p><em>Durch den Erwerb eines Produkts oder die Nutzung eines Dienstes akzeptiert der Nutzer diese Bedingungen.</em></p>
        </main>
    );
}
