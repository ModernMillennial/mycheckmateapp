# Password Reset Functionality - Demo

This app includes a complete password reset functionality that works like popular apps such as banking or email services.

## How it Works

### 1. User Requests Password Reset
- User navigates to "Forgot Password" from the login screen
- Enters their email address
- Clicks "Send Reset Link"

### 2. Email is Sent (Simulated)
- In production: An email with a reset link is automatically sent to the user's email
- In demo mode: We show a preview of the email content and provide the reset token directly

### 3. User Resets Password
- User would normally click the link in their email
- In demo mode: User can use the provided reset token
- User enters new password and confirms it
- Password is securely updated

## Demo Features

### Email Preview
- View exactly what the password reset email looks like
- Professional formatting matching the screenshot provided
- Includes security notice and expiration information

### Reset Token
- Secure 32-character random token
- Expires in 1 hour for security
- Links directly to the password reset screen

### Security Features
- Tokens expire automatically
- Password validation (minimum 6 characters, must include number)
- Secure password hashing
- Prevention of duplicate reset requests

## How to Test

1. **Start the app** and navigate to login
2. **Click "Forgot Password?"**
3. **Enter any email address** (e.g., test@example.com)
4. **Click "Send Reset Link"**
5. **View the email preview** to see what users would receive
6. **Use the provided reset token** to test the reset flow
7. **Set a new password** and verify it works

## Production Implementation

In a real production app, you would:

- Integrate with an email service (SendGrid, AWS SES, Mailgun, etc.)
- Store reset tokens in a secure database
- Implement rate limiting to prevent abuse
- Add additional security measures like IP validation
- Handle email delivery failures gracefully

The current implementation provides a complete foundation that can be easily extended for production use.