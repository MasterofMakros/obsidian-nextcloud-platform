import nodemailer from 'nodemailer';
import type Mail from 'nodemailer/lib/mailer';

// Configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587');
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@obsidian-nextcloud.com';
const FROM_NAME = process.env.FROM_NAME || 'Obsidian Nextcloud Media';

// Create reusable transporter
let transporter: Mail | null = null;

function getTransporter(): Mail {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            host: SMTP_HOST,
            port: SMTP_PORT,
            secure: SMTP_PORT === 465, // true for 465, false for other ports
            auth: SMTP_USER && SMTP_PASS ? {
                user: SMTP_USER,
                pass: SMTP_PASS,
            } : undefined,
        });
    }
    return transporter;
}

export interface MagicLinkEmailOptions {
    email: string;
    magicLinkUrl: string;
}

/**
 * Send magic link email for passwordless authentication
 */
export async function sendMagicLinkEmail(options: MagicLinkEmailOptions): Promise<void> {
    const { email, magicLinkUrl } = options;

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign in to your account</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a; color: #ffffff; margin: 0; padding: 20px; }
        .container { max-width: 480px; margin: 0 auto; background: #1a1a1a; border-radius: 12px; padding: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 24px; font-weight: bold; color: #f5a623; }
        h1 { font-size: 24px; margin: 0 0 10px; }
        p { color: #a0a0a0; line-height: 1.6; }
        .button { display: inline-block; background: linear-gradient(135deg, #f5a623, #f57723); color: #000; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
        .link { word-break: break-all; color: #888; font-size: 12px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #333; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🎬 Obsidian Nextcloud Media</div>
        </div>
        <h1>Sign in to your account</h1>
        <p>Click the button below to sign in to your account. This link will expire in 1 hour.</p>
        <div style="text-align: center;">
            <a href="${magicLinkUrl}" class="button">Sign In</a>
        </div>
        <p>If you didn't request this email, you can safely ignore it.</p>
        <p class="link">Or copy this link: ${magicLinkUrl}</p>
        <div class="footer">
            <p>© ${new Date().getFullYear()} Obsidian Nextcloud Media Plugin</p>
        </div>
    </div>
</body>
</html>
    `.trim();

    const textContent = `
Sign in to your Obsidian Nextcloud Media account

Click the link below to sign in. This link will expire in 1 hour.

${magicLinkUrl}

If you didn't request this email, you can safely ignore it.
    `.trim();

    await getTransporter().sendMail({
        from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
        to: email,
        subject: 'Sign in to Obsidian Nextcloud Media',
        text: textContent,
        html: htmlContent,
    });
}

/**
 * Test email configuration
 */
export async function verifyEmailConfig(): Promise<boolean> {
    try {
        await getTransporter().verify();
        return true;
    } catch (error) {
        console.error('Email configuration error:', error);
        return false;
    }
}
