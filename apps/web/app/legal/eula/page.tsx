import LegalLayout from '../layout';

export default function EulaPage() {
    return (
        <main>
            <h1>End User License Agreement (EULA)</h1>

            <h2>Präambel</h2>
            <p>Dieses Lizenzabkommen („EULA“) regelt die Nutzung der Software-Produkte und zugehörigen Dienstleistungen der <strong>Fentrea GmbH</strong> (nachfolgend „Lizenzgeber“).</p>

            <h2>1. Lizenzgewährung</h2>
            <p>Der Lizenzgeber gewährt dem Endnutzer ein weltweites, nicht-ausschließliches, nicht-übertragbares Recht zur Nutzung der lizenzierten Software entsprechend dem erworbenen Lizenztyp.</p>

            <h2>2. Nutzungsrechte</h2>
            <p>Der Endnutzer darf:</p>
            <ul>
                <li>a) die Software auf den zulässigen Geräten/Instanzen installieren und nutzen;</li>
                <li>b) Updates nutzen, die der Lizenzgeber zur Verfügung stellt.</li>
            </ul>

            <h2>3. Beschränkungen</h2>
            <p>Der Endnutzer darf nicht:</p>
            <ul>
                <li>a) die Software rückentwickeln, dekompilieren oder disassemblieren;</li>
                <li>b) unberechtigte Zugriffe auf Lizenzmechanismen versuchen;</li>
                <li>c) Lizenzschlüssel weitergeben oder verkaufen.</li>
            </ul>

            <h2>4. Laufzeit</h2>
            <p>Die Lizenz ist befristet entsprechend dem gewählten Plan (Monat/Jahr/Lifetime).</p>

            <h2>5. Kündigung</h2>
            <p>Bei Verstoß gegen diese EULA kann der Lizenzgeber:</p>
            <ul>
                <li>die Lizenz deaktivieren,</li>
                <li>den Zugang sperren.</li>
            </ul>

            <h2>6. Haftung</h2>
            <p>Soweit gesetzlich zulässig, ist die Haftung des Lizenzgebers auf direkte Schäden beschränkt, die durch grobe Fahrlässigkeit oder Vorsatz verursacht wurden.</p>

            <h2>7. Schlussbestimmungen</h2>

            <h3>7.1 Anwendbares Recht</h3>
            <p>Es gilt Schweizer Recht.</p>

            <h3>7.2 Gerichtsstand</h3>
            <p>Gerichtsstand: Sitz der Fentrea GmbH.</p>
        </main>
    );
}
