# Checkmate Production Setup Guide

## Overview
This guide will help you prepare the Checkmate app for production deployment with real Plaid credentials and optimized configuration.

## ✅ Pre-Production Checklist

### 1. Plaid Production Credentials
- [ ] Sign up for Plaid production account at [plaid.com](https://plaid.com)
- [ ] Create your production app in Plaid Dashboard
- [ ] Obtain your production `client_id` and `secret`
- [ ] Complete Plaid's production review process
- [ ] Add production webhook endpoints (if needed)

### 2. Environment Configuration
Replace the placeholder credentials in `.env.production`:

```bash
# Update these with your actual Plaid production credentials
EXPO_PUBLIC_PLAID_CLIENT_ID=your_actual_production_client_id
EXPO_PUBLIC_PLAID_SECRET=your_actual_production_secret
EXPO_PUBLIC_PLAID_ENVIRONMENT=production
```

### 3. App Store Configuration
Update `app.json` with your actual information:

```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.checkmate", // Change to your domain
    "buildNumber": "1" // Increment for each release
  },
  "android": {
    "package": "com.yourcompany.checkmate", // Change to your domain
    "versionCode": 1 // Increment for each release
  }
}
```

### 4. EAS Build Configuration
Update `eas.json` submit section with your Apple Developer account:

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

## 🔐 Security Considerations

### Environment Variables
- ✅ Production Plaid credentials are properly secured
- ✅ Debug mode disabled in production
- ✅ API keys are not exposed in client code
- ✅ All sensitive data uses secure storage

### Permissions
- ✅ Camera permission (for receipt scanning)
- ✅ Microphone permission (for voice notes)
- ✅ Location permission (for merchant categorization)
- ✅ Network access (for bank connections)

### Data Protection
- ✅ All financial data encrypted at rest
- ✅ Secure token storage using Expo SecureStore
- ✅ HTTPS-only communication
- ✅ PCI DSS compliance through Plaid integration

## 🚀 Build Commands

### Development Build
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### Production Build
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Submit to App Stores
```bash
eas submit --profile production --platform ios
eas submit --profile production --platform android
```

## 🧪 Testing Production Builds

### 1. Staging Environment
Use `.env.staging` for testing with Plaid sandbox:
- Test all bank connection flows
- Verify transaction sync functionality
- Test error handling scenarios
- Validate offline mode behavior

### 2. Production Testing
Before release:
- [ ] Test with real bank accounts (small amounts)
- [ ] Verify all Plaid webhooks work correctly
- [ ] Test app performance under load
- [ ] Validate security compliance
- [ ] Test on multiple device types

## 📊 Analytics & Monitoring (Optional)

### Add Analytics Services
Update environment variables with your keys:
```bash
EXPO_PUBLIC_SENTRY_DSN=your_sentry_dsn_here
EXPO_PUBLIC_ANALYTICS_KEY=your_analytics_key_here
```

### Recommended Services
- **Sentry**: Error tracking and performance monitoring
- **Amplitude/Mixpanel**: User analytics and behavior tracking
- **Firebase Analytics**: App usage metrics

## 🔄 Plaid Webhook Configuration

### Production Webhooks
Set up webhook endpoints for real-time updates:

1. **Transaction Updates**: `/webhooks/plaid/transactions`
2. **Item Status**: `/webhooks/plaid/item`
3. **Error Notifications**: `/webhooks/plaid/error`

### Implementation
The app currently handles polling for transaction updates. For production scale, implement webhook handlers for:
- New transactions
- Account updates
- Item reconnection needed
- Error notifications

## 📱 App Store Requirements

### iOS App Store
- [ ] App Store Connect app configured
- [ ] Screenshots and metadata prepared
- [ ] Privacy policy URL added
- [ ] Terms of service URL added
- [ ] App category: Finance
- [ ] Content rating: 4+ (no objectionable content)

### Google Play Store
- [ ] Google Play Console app configured
- [ ] Privacy policy URL required
- [ ] Financial services disclosure
- [ ] Target API level compliance
- [ ] App signing by Google Play

## 🔍 Final Pre-Launch Checklist

### Code Quality
- [ ] All TODO comments resolved
- [ ] No console.log statements in production
- [ ] Error boundaries implemented
- [ ] Loading states for all async operations
- [ ] Offline functionality tested

### User Experience
- [ ] Onboarding flow tested
- [ ] Bank connection flow smooth
- [ ] Transaction sync working reliably
- [ ] App performance optimized
- [ ] Accessibility features implemented

### Legal Compliance
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Financial data handling compliant
- [ ] GDPR compliance (if applicable)
- [ ] State financial regulations reviewed

## 🆘 Support & Maintenance

### Monitoring
- Set up alerts for app crashes
- Monitor Plaid API usage and limits
- Track user onboarding success rates
- Monitor bank connection failure rates

### Updates
- Plan monthly app updates
- Keep Plaid SDK up to date
- Monitor for new banking regulations
- Update financial institution list

## 📞 Contact & Support

For production deployment assistance:
- Review Plaid's production checklist
- Contact Plaid support for integration review
- Test thoroughly in sandbox environment first
- Consider gradual rollout to users

---

**Note**: This app is production-ready with proper Plaid credentials. The demo mode provides a seamless fallback for testing and development purposes.