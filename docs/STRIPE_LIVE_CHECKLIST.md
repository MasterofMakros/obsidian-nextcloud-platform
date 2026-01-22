# Stripe Live-Mode Checkliste

**Anbieter:** Fentrea GmbH (CH, SO)  
**Produkt:** Obsidian Nextcloud Media – Softwarelizenz / SaaS-ähnlich  
**Zielmärkte:** Global, Fokus DACH

---

## 1. Stripe Account – Live-Mode Basis

### 1.1 Unternehmensdaten (Pflicht)

Im Stripe Dashboard → **Settings → Business details**

- Rechtsform: **GmbH**
- Firmenname: **Fentrea GmbH**
- Sitz: Schweiz, **Kanton Solothurn**
- Adresse: (gemäss Impressum)
- UID (falls vorhanden): CHE-…
- Geschäftsführung: korrekt hinterlegt
- Support-E-Mail: `support@obsidian-nextcloud.media`
- Website: https://obsidian-nextcloud.media

### 1.2 Bank & Auszahlungen

**Settings → Payouts**

- Bankkonto: **CH-IBAN**
- Währung: **CHF**
- Auszahlungsintervall: **Weekly** (Liquidität + Übersicht)
- Statement Descriptor: `FENTREA SOFTWARE`

---

## 2. Produkt & Preise

### 2.1 Produktdefinition

**Products → Create product**

- Name: *Obsidian Nextcloud Media – Pro*
- Typ: **Digital service**
- Beschreibung: `Offline-first media sync plugin for Obsidian & Nextcloud`

### 2.2 Preisstrategie

| Merkmal    | Empfehlung                    |
|------------|-------------------------------|
| Abrechnung | Monthly + Yearly              |
| Kündigung  | jederzeit                     |
| Testphase  | ❌ (nicht nötig bei Low Price) |
| Rabatt     | optional für Yearly           |

---

## 3. Steuer-Konfiguration

### 3.1 Schweiz (CH)

- MWST-Pflicht **erst ab CHF 100'000 Umsatz weltweit/Jahr**
- Bis dahin: **KEINE CH-MWST berechnen**
- Hinweis auf Rechnung: _„No VAT charged according to Swiss VAT Act (below threshold)"_

**Stripe Einstellung:**
- Tax → Settings → Country: Switzerland → VAT registered: **NO**

### 3.2 EU / DACH (DE, AT, EU)

- **Elektronische Dienstleistung an Privatkunden (B2C)**
- Pflicht: EU-MWST nach Wohnsitzland

**Stripe Einstellungen:**
- Tax → Registrations → EU: **Enable OSS**
- Stripe Tax: **ON**

_(Du brauchst KEINE eigene EU-Steuernummer, Stripe fungiert als Vermittler)_

---

## 4. Checkout & Rechtliches

### 4.1 Pflicht-Links im Checkout

**Settings → Checkout**

- ✅ Terms of Service: `/legal/terms`
- ✅ Privacy Policy: `/legal/privacy`
- ✅ EULA: `/legal/eula`

### 4.2 Rechnungen

**Billing → Invoices**

- Logo hochladen
- Absenderdaten:
  - Fentrea GmbH
  - Murtenstrasse 116, 3202 Frauenkappelen
  - Schweiz

---

## 5. Webhooks (Live-Mode)

### 5.1 Endpoint anlegen

**Developers → Webhooks → Add endpoint**

- URL: `https://api.obsidian-nextcloud.media/api/v1/webhooks/stripe`
- Events:
  - `checkout.session.completed`
  - `invoice.paid`
  - `invoice.payment_failed`
  - `customer.subscription.deleted`
  - `customer.subscription.updated`

### 5.2 Secrets

```env
# .env.production
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_live_...
```

---

## 6. Lizenzfluss – Verifizierung

| Schritt             | Erwartung             |
|---------------------|----------------------|
| Zahlung erfolgreich | Webhook → Queue       |
| Worker              | Lizenzstatus = active |
| E-Mail              | Lizenzschlüssel       |
| Plugin              | `/activate` success   |
| Offline             | Grace-Period greift   |

---

## 7. Testkauf (Go-Live-Simulation)

### 7.1 Vorbereitungen

- Stripe **Live Mode ON**
- Preis temporär auf **CHF/EUR 1.–**
- Eigene E-Mail nutzen

### 7.2 Testablauf

1. [ ] Kauf durchführen
2. [ ] Rechnung erhalten (E-Mail prüfen + Spam)
3. [ ] Lizenzmail prüfen
4. [ ] Plugin aktivieren
5. [ ] Offline starten
6. [ ] Refresh nach 24h testen
7. [ ] Kündigung durchführen
8. [ ] Refresh → revoked prüfen

**→ Erst wenn ALLES passt → Preis wieder hochsetzen**

---

## 8. Rückerstattungen

- 14 Tage Geld-zurück-Garantie
- Manuell via Stripe Dashboard
- Keine automatischen Refunds

---

## 9. Go-Live-Checkliste

- [ ] Stripe Live-Mode aktiv
- [ ] Webhook Live-Secret gesetzt
- [ ] OSS aktiv (EU-Steuer)
- [ ] Rechnungen korrekt (Logo, Adresse)
- [ ] Testkauf erfolgreich
- [ ] README & Website final
- [ ] Support-Mail erreichbar

---

*Erstellt: Januar 2026*
