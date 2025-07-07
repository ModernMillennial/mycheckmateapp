import * as MailComposer from 'expo-mail-composer';
import { Platform } from 'react-native';
import { chatWithAnthropic } from '../api/chat-service';

export interface EmailServiceError {
  code: string;
  message: string;
}

interface ResetEmailTemplate {
  subject: string;
  body: string;
  htmlBody?: string;
}

class EmailService {
  private static instance: EmailService;

  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  // Check if mail composer is available
  async isAvailable(): Promise<boolean> {
    try {
      return await MailComposer.isAvailableAsync();
    } catch (error) {
      console.error('Error checking mail composer availability:', error);
      return false;
    }
  }

  // Generate a secure reset token
  private generateResetToken(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }

  // Generate email template for password reset
  private async generateResetEmailTemplate(email: string, resetToken: string): Promise<ResetEmailTemplate> {
    const appName = "Checkmate";
    const resetUrl = `https://your-app-domain.com/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;
    
    // Use AI to generate a professional email template
    const prompt = `Create a professional password reset email for an app called "${appName}". 
    The email should:
    - Be friendly but professional
    - Include security best practices mention
    - Mention the link expires in 1 hour
    - Include the reset URL: ${resetUrl}
    - Be concise but informative
    
    Return ONLY the email body text, no subject line.`;

    try {
      const emailBody = await chatWithAnthropic(prompt, []);
      
      const subject = `${appName} - Password Reset Request`;
      
      // Create HTML version
      const htmlBody = `
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #3B82F6; margin: 0;">${appName}</h1>
            </div>
            
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
              ${emailBody.replace(/\n/g, '<br>')}
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p><strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
              <p>This email was sent from ${appName}. Do not reply to this email.</p>
            </div>
          </body>
        </html>
      `;

      return {
        subject,
        body: emailBody,
        htmlBody
      };
    } catch (error) {
      console.error('Error generating email template:', error);
      
      // Fallback template
      const fallbackBody = `Hello,

We received a request to reset your password for your ${appName} account associated with this email address.

To reset your password, please click the link below:
${resetUrl}

This link will expire in 1 hour for security reasons.

If you didn't request this password reset, please ignore this email. Your account remains secure.

Best regards,
The ${appName} Team`;

      return {
        subject: `${appName} - Password Reset Request`,
        body: fallbackBody,
        htmlBody: fallbackBody.replace(/\n/g, '<br>')
      };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email: string): Promise<{ success: boolean; resetToken?: string; error?: EmailServiceError }> {
    try {
      const isAvailable = await this.isAvailable();
      
      if (!isAvailable) {
        return {
          success: false,
          error: {
            code: 'MAIL_NOT_AVAILABLE',
            message: 'Email functionality is not available on this device. Please check your email app configuration.',
          },
        };
      }

      // Generate reset token
      const resetToken = this.generateResetToken();
      
      // Generate email template
      const emailTemplate = await this.generateResetEmailTemplate(email, resetToken);

      // Compose and send email
      const result = await MailComposer.composeAsync({
        recipients: [email],
        subject: emailTemplate.subject,
        body: emailTemplate.htmlBody || emailTemplate.body,
        isHtml: !!emailTemplate.htmlBody,
      });

      if (result.status === MailComposer.MailComposerStatus.SENT) {
        return {
          success: true,
          resetToken,
        };
      } else if (result.status === MailComposer.MailComposerStatus.CANCELLED) {
        return {
          success: false,
          error: {
            code: 'EMAIL_CANCELLED',
            message: 'Email sending was cancelled.',
          },
        };
      } else {
        return {
          success: false,
          error: {
            code: 'EMAIL_FAILED',
            message: 'Failed to send password reset email. Please try again.',
          },
        };
      }
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return {
        success: false,
        error: {
          code: 'EMAIL_SERVICE_ERROR',
          message: 'An error occurred while sending the email. Please try again.',
        },
      };
    }
  }

  // Send verification email (for future use)
  async sendVerificationEmail(email: string): Promise<{ success: boolean; verificationToken?: string; error?: EmailServiceError }> {
    try {
      const isAvailable = await this.isAvailable();
      
      if (!isAvailable) {
        return {
          success: false,
          error: {
            code: 'MAIL_NOT_AVAILABLE',
            message: 'Email functionality is not available on this device.',
          },
        };
      }

      const verificationToken = this.generateResetToken();
      const appName = "Checkmate";
      const verificationUrl = `https://your-app-domain.com/verify-email?token=${verificationToken}&email=${encodeURIComponent(email)}`;

      const subject = `${appName} - Verify Your Email Address`;
      const body = `Welcome to ${appName}!

Please verify your email address by clicking the link below:
${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account with ${appName}, please ignore this email.

Best regards,
The ${appName} Team`;

      const result = await MailComposer.composeAsync({
        recipients: [email],
        subject,
        body,
      });

      if (result.status === MailComposer.MailComposerStatus.SENT) {
        return {
          success: true,
          verificationToken,
        };
      } else {
        return {
          success: false,
          error: {
            code: 'EMAIL_FAILED',
            message: 'Failed to send verification email.',
          },
        };
      }
    } catch (error) {
      console.error('Error sending verification email:', error);
      return {
        success: false,
        error: {
          code: 'EMAIL_SERVICE_ERROR',
          message: 'An error occurred while sending the email.',
        },
      };
    }
  }
}

export default EmailService.getInstance();