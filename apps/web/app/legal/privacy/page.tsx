import LegalLayout from '../layout';

export default function PrivacyPage() {
    return (
        <main>
            <h1>Datenschutzerklärung / Privacy Policy</h1>

            <h2>1. Einleitung</h2>
            <p>Diese Datenschutzerklärung gilt für die Nutzung der Dienste der <strong>Fentrea GmbH</strong> (nachfolgend „wir“, „uns“). Wir nehmen Datenschutz ernst und behandeln personenbezogene Daten vertraulich und entsprechend der gesetzlichen Datenschutzbestimmungen (DSGVO, Schweizer Datenschutzrecht).</p>

            <h2>2. Verantwortliche Stelle</h2>
            <p>
                <strong>Fentrea GmbH</strong><br />
                Murtenstrasse 116<br />
                3202 Frauenkappelen<br />
                Schweiz<br />
                E-Mail: <a href="mailto:support@obsidian-nextcloud.media">support@obsidian-nextcloud.media</a>
            </p>

            <h2>3. Erhobene Daten</h2>

            <h3>3.1 Technische Daten</h3>
            <ul>
                <li>IP-Adresse (anonymisiert, soweit möglich)</li>
                <li>Browser- und Geräteinformationen</li>
                <li>Zeitpunkt des Zugriffs</li>
                <li>Nutzungsmetriken (nicht personenbezogen)</li>
            </ul>

            <h3>3.2 Authentifizierungs- und Lizenzdaten</h3>
            <ul>
                <li>E-Mail-Adresse (nur wenn erforderlich)</li>
                <li>Lizenz-Token / Lizenzstatus (verschlüsselt, zur Lizenzverwaltung)</li>
            </ul>

            <h3>3.3 Zahlungsdaten</h3>
            <p>Zahlungsdaten werden <strong>ausschließlich von Stripe</strong> verarbeitet. Wir erheben und speichern <strong>keine vollständigen Kreditkarteninformationen</strong>.</p>

            <h2>4. Rechtsgrundlagen</h2>
            <p>Datenerhebung und -verarbeitung erfolgen auf Basis der:</p>
            <ul>
                <li>Erforderlichkeit zur Vertragserfüllung (Art. 6 Abs. 1 lit. b DSGVO)</li>
                <li>Berechtigten Interessen (Art. 6 Abs. 1 lit. f DSGVO)</li>
                <li>Einwilligung, sofern erforderlich</li>
            </ul>

            <h2>5. Weitergabe an Dritte</h2>
            <p>Wir geben Daten nur dann weiter,</p>
            <ul>
                <li>wenn dies zur Vertragserfüllung notwendig ist (Stripe, Webhook-Processing, Lizenz-Issuance),</li>
                <li>gesetzlich vorgeschrieben ist,</li>
                <li>oder mit ausdrücklicher Einwilligung.</li>
            </ul>

            <h2>6. Cookies / Tracking</h2>
            <p>Sofern Cookies verwendet werden, erfolgt dies ausschließlich für technische Zwecke (Sitzungsmanagement, Sicherheit). Analytische Cookies werden nur gesetzt, wenn ausdrücklich zugestimmt wurde.</p>

            <h2>7. Speicherdauer</h2>
            <p>Personenbezogene Daten werden nur so lange gespeichert, wie es für die Zwecke dieser Nutzungsbedingungen erforderlich ist oder gesetzlich vorgeschrieben wird.</p>

            <h2>8. Betroffenenrechte</h2>
            <p>Sie haben das Recht auf:</p>
            <ul>
                <li>Auskunft</li>
                <li>Berichtigung</li>
                <li>Löschung</li>
                <li>Einschränkung der Verarbeitung</li>
                <li>Widerspruch</li>
                <li>Datenübertragbarkeit</li>
            </ul>
            <p>Kontakt: <a href="mailto:support@obsidian-nextcloud.media">support@obsidian-nextcloud.media</a></p>

            <h2>9. Änderungen dieser Datenschutzrichtlinie</h2>
            <p>Wir behalten uns vor, diese Richtlinie anzupassen. Updates werden hier veröffentlicht.</p>
        </main>
    );
}
