import * as MailComposer from 'expo-mail-composer';
import { Platform, Alert } from 'react-native';
import { getAnthropicChatResponse } from '../api/chat-service';

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
      // For this demo app, we'll always return true and simulate email sending
      return true;
    } catch (error) {
      console.error('Error checking mail composer availability:', error instanceof Error ? error.message : 'Unknown error');
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
      const response = await getAnthropicChatResponse(prompt);
      const emailBody = response.content;
      
      const subject = `${appName} - Password Reset Request`;
      
      // Create HTML version that matches the screenshot style
      const htmlBody = `
        <html>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #000; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f0f0f0;">
            <div style="background: white; margin: 0; padding: 0;">
              <div style="padding: 20px; border-bottom: 1px solid #e0e0e0;">
                <h1 style="font-size: 18px; font-weight: 600; color: #000; margin: 0;">${appName} - Password Reset Request</h1>
              </div>
              
              <div style="padding: 20px;">
                <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">To: support@mycheckmateapp.com</p>
                <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">Subject: ${appName} - Password Reset Request</p>
                
                <div style="margin: 20px 0;">
                  ${emailBody.replace(/\n/g, '<br><br>')}
                </div>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
                  <p style="margin: 0 0 8px 0;">If you didn't request this password reset, please ignore this email. Your account remains secure.</p>
                  <p style="margin: 0;">Best regards,<br>The ${appName} Team</p>
                </div>
              </div>
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
      console.error('Error generating email template:', error instanceof Error ? error.message : 'Unknown error');
      
      // Fallback template matching the user's screenshot format
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

      // For development/demo purposes, we'll simulate sending the email
      // and show a preview of what would be sent
      console.log('=== PASSWORD RESET EMAIL PREVIEW ===');
      console.log('To:', email);
      console.log('Subject:', emailTemplate.subject);
      console.log('Reset Token:', resetToken);
      console.log('Body:', emailTemplate.body);
      console.log('=====================================');

      // In a real app, you would integrate with an email service like:
      // - SendGrid
      // - AWS SES
      // - Mailgun
      // - Resend
      // - Or your own backend email service
      
      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll show the user the reset token
      // In production, this would only be sent via email
      console.log('Demo Mode: Reset token generated:', resetToken);

      return {
        success: true,
        resetToken,
      };
    } catch (error) {
      console.error('Error sending password reset email:', error instanceof Error ? error.message : 'Unknown error');
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
      console.error('Error sending verification email:', error instanceof Error ? error.message : 'Unknown error');
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