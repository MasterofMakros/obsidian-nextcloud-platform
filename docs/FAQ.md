# Frequently Asked Questions (FAQ)

## General

### What is Obsidian Nextcloud Media?
Obsidian Nextcloud Media is a plugin that syncs media files (images, videos, audio) between your Obsidian vault and your Nextcloud instance. It's designed for privacy-conscious users who want full control over their data.

### Is it free?
Yes! The core functionality is completely free:
- Standard media sync
- 1GB local cache
- WebDAV connection
- Image thumbnails

Pro features ($29 lifetime) include unlimited cache, 4K streaming, background sync, and priority support.

### Who develops this?
Fentrea GmbH, a small software company based in Switzerland. We're not backed by venture capital and don't sell your data.

---

## Installation & Setup

### How do I install the plugin?
1. Open Obsidian → Settings → Community Plugins
2. Search for "Nextcloud Media"
3. Click Install, then Enable
4. Configure your Nextcloud server URL and credentials

### Does it work with any Nextcloud provider?
Yes, as long as your provider supports WebDAV access. This includes self-hosted instances and most commercial Nextcloud providers.

### Do I need a Nextcloud account?
Yes. You need access to a Nextcloud instance (self-hosted or managed) with WebDAV enabled.

---

## Licensing & Pricing

### What's the difference between Free and Pro?

| Feature | Free | Pro |
|---------|------|-----|
| Media Sync | ✓ | ✓ |
| Offline Cache | 1GB | Unlimited |
| Background Sync | — | ✓ |
| 4K Video Streaming | — | ✓ |
| Multi-Device | — | ✓ |
| Priority Support | — | ✓ |

### Is the Pro license a subscription?
No. Pro is a **one-time payment of $29** for lifetime access. No recurring fees.

### Can I use my license on multiple devices?
Yes, your Pro license works on multiple devices linked to your account.

### How do I activate my Pro license?
1. Purchase Pro on our website
2. Check your email for the license key
3. Open Obsidian → Plugin Settings → Nextcloud Media → License
4. Paste your key and click "Activate"

### What if I don't receive my license key?
Check your spam folder first. If you still don't see it, contact support@obsidian-nextcloud.media with your purchase details.

---

## Privacy & Security

### Do you track my usage?
No. We have no analytics, no telemetry, and no tracking of any kind.

### Where is my data stored?
Your media files are stored on YOUR Nextcloud instance. We don't store any of your media. The only data we process is license validation (email + encrypted license token).

### Is my Nextcloud password safe?
Your credentials are stored locally in Obsidian's secure storage. They are never transmitted to our servers.

### Is this GDPR compliant?
Yes. We're based in Switzerland and comply with both GDPR (EU) and Swiss data protection laws. See our [Privacy Policy](/legal/privacy) for details.

---

## Troubleshooting

### Sync isn't working. What should I check?
1. Verify your Nextcloud URL is correct (include `https://`)
2. Check that WebDAV is enabled on your Nextcloud
3. Ensure your credentials are correct
4. Check your internet connection

### Videos won't play in Obsidian
Make sure the video format is supported (MP4, WebM). For 4K streaming, you need a Pro license.

### The plugin is slow
Try reducing your cache size or enabling background sync (Pro) to offload sync operations.

### How do I contact support?
Email us at **support@obsidian-nextcloud.media**. Pro users get priority responses (usually within 24-48 hours).

---

## Refunds & Cancellation

### Can I get a refund?
Yes, we offer a 14-day money-back guarantee. If you're not satisfied, contact support@obsidian-nextcloud.media with your purchase details.

### How do I cancel my license?
Since Pro is a lifetime license with no recurring payments, there's nothing to cancel. If you want to deactivate a device, go to Plugin Settings → License → Deactivate.

---

## Technical

### What Obsidian version is required?
Obsidian 1.4.0 or higher.

### Does it work on mobile?
Yes, the plugin works on Obsidian Mobile (iOS and Android).

### Is there an API?
Pro users have access to advanced configuration options. Full API documentation is coming soon.

---

*Last updated: January 2026*
