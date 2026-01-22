# Stripe Fail-Szenarien & Recovery-Playbook

**Operations Runbook – Für Commercial Betrieb**

## Ziel

- Zahlungsprobleme **automatisiert abfangen**
- **Supportaufwand minimieren**
- **Lizenzzustände deterministisch** halten

---

## A. Häufigste Stripe-Fail-Szenarien

### A1. Zahlung fehlgeschlagen (Initial Payment)

**Stripe Events:**
- `invoice.payment_failed`
- `checkout.session.async_payment_failed`

**Automatische Reaktion:**
- Lizenz **NICHT aktivieren**
- Kein Grace-Period-Eintrag
- Status: `pending_payment`

**User-Kommunikation:**
- Stripe übernimmt E-Mail
- Optional: Hinweis auf Success-/Retry-Seite

**Support-Regel:**
> „Bitte prüfen Sie Ihre Zahlungsdaten oder versuchen Sie es erneut."

---

### A2. Zahlung fehlgeschlagen (Renewal)

**Stripe Event:**
- `invoice.payment_failed` (Subscription)

**Automatik (empfohlen):**
- Lizenz bleibt **aktiv**
- **Grace Period: 7 Tage**
- Status: `grace`

**Nach 7 Tagen:**
- Lizenz → `revoked`
- Plugin wechselt in Read-Only / eingeschränkt

**Support-Regel:**
> Kein manuelles Verlängern ohne Zahlung

---

### A3. Subscription gekündigt

**Stripe Event:**
- `customer.subscription.deleted`

**Automatik:**
- Lizenz **sofort oder zum Periodenende** deaktivieren
- Kein weiterer Refresh erlaubt

---

### A4. Doppeltes Webhook-Event

**Problem:**
- Stripe sendet Events mehrfach

**Lösung (bereits implementiert):**
- Event-ID Idempotency über `PaymentEvent` Tabelle
- Worker: `skipped_idempotent`

✅ **Commercial-Grade korrekt umgesetzt**

---

### A5. Refund / Chargeback

**Stripe Events:**
- `charge.refunded`
- `charge.dispute.created`

**Automatik:**
- Lizenz → `revoked`
- Kein Re-Activation ohne Neukauf

**Support-Regel:**
> Refund = Lizenzverlust (klar kommunizieren in FAQ)

---

## B. Interne Recovery-Regeln

| Situation           | Aktion                        |
|---------------------|-------------------------------|
| Webhook down        | Stripe retryt automatisch     |
| Worker down         | Queue puffert (BullMQ)        |
| DB kurz down        | Grace greift                  |
| Stripe API down     | Plugin bleibt offline-fähig   |

👉 **Kein manueller Panic-Fix nötig – System ist resilient**

---

## C. Monitoring Alerts (empfohlen)

- `onm_worker_stripe_events_failed_total > 0` für 5 min
- `onm_worker_queue_depth > 100` für 10 min
- Webhook-Fehler in Stripe Dashboard

---

*Erstellt: Januar 2026*
