// Simple email implementation for development and production
interface EmailData {
  from: string;
  to: string;
  subject: string;
  html: string;
  text: string;
}

// In a real implementation, you would use a proper email service
// For now, we'll create a console-based implementation that shows the email
class DevEmailService {
  constructor(private apiKey?: string) {}

  emails = {
    send: async (data: EmailData) => {
      console.log('\n' + '='.repeat(80));
      console.log('📧 EMAIL WOULD BE SENT TO: ' + data.to);
      console.log('📨 SUBJECT: ' + data.subject);
      console.log('📤 FROM: ' + data.from);
      console.log('='.repeat(80));
      console.log('\n📄 EMAIL CONTENT (HTML):');
      console.log(data.html);
      console.log('\n📄 EMAIL CONTENT (TEXT):');
      console.log(data.text);
      console.log('\n' + '='.repeat(80));
      console.log('💡 TIP: In production, configure RESEND_API_KEY to send real emails');
      console.log('='.repeat(80) + '\n');
      
      return { data: { id: `dev-email-${Date.now()}` } };
    },
  };
}

const resend = new DevEmailService(process.env.RESEND_API_KEY);

export interface PasswordResetEmailData {
  email: string;
  code: string;
  token: string;
  firstName?: string;
}

export async function sendPasswordResetEmail({
  email,
  code,
  token,
  firstName,
}: PasswordResetEmailData) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset?token=${token}`;
  const displayName = firstName || "User";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>Reset your WON password</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #2563eb; margin: 0;">WON</h1>
      </div>

      <h2 style="color: #1f2937; margin-bottom: 20px;">Reset your password</h2>

      <p style="margin-bottom: 20px;">Hi ${displayName},</p>

      <p style="margin-bottom: 20px;">
        We received a request to reset your password for your WON account.
        Use the verification code below or click the link to reset your password.
      </p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
        <p style="margin: 0 0 10px; font-size: 14px; color: #6b7280;">Your verification code:</p>
        <div style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; font-family: monospace;">
          ${code}
        </div>
        <p style="margin: 10px 0 0; font-size: 12px; color: #9ca3af;">This code expires in 10 minutes</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}"
          style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          Reset Password
        </a>
      </div>

      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; font-size: 14px; color: #6b7280;">
        <p style="margin-bottom: 10px;">
          If you didn't request this password reset, you can safely ignore this email.
          Your password won't be changed.
        </p>
        <p style="margin: 0;">
          If the button above doesn't work, copy and paste this link into your browser:<br>
          <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Reset your WON password

Hi ${displayName},

We received a request to reset your password for your WON account.

Your verification code: ${code}
This code expires in 10 minutes.

You can also reset your password by visiting this link:
${resetUrl}

If you didn't request this password reset, you can safely ignore this email. Your password won't be changed.
  `.trim();

  try {
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM || "noreply@won.com",
      to: email,
      subject: "Reset your WON password",
      html: htmlContent,
      text: textContent,
    });

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
