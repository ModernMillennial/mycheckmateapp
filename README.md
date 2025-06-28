# CheckMate - Digital Checkbook Register

A modern React Native app that serves as your digital checkbook register with automatic bank synchronization via Plaid integration.

## Features

- 🏦 **Bank Integration**: Connect real bank accounts via Plaid for automatic transaction import
- 💰 **Balance Tracking**: Real-time running balance calculations
- 📱 **Smart Matching**: Automatic conversion of manual entries to bank-confirmed transactions
- 🔄 **Sync & Refresh**: Pull-to-refresh functionality for latest bank data
- 📊 **Transaction Management**: Add, edit, and categorize transactions
- 🔒 **Secure**: Bank-level security with Plaid integration
- 📱 **iOS Optimized**: Designed following Apple's Human Interface Guidelines

## Production Requirements

### Environment Variables
Create a `.env` file in the root directory with your production Plaid credentials:

```
EXPO_PUBLIC_PLAID_CLIENT_ID=your_production_plaid_client_id
EXPO_PUBLIC_PLAID_SECRET=your_production_plaid_secret
```

### Plaid Setup
1. Sign up for a Plaid account at [dashboard.plaid.com](https://dashboard.plaid.com)
2. Create a production application
3. Get your Client ID and Secret from the Plaid dashboard
4. Add your app's bundle identifier to Plaid's allowed origins

## Building for Production

### Prerequisites
- Node.js 18+
- Expo CLI (`npm install -g @expo/eas-cli`)
- Apple Developer Account ($99/year)

### Build Process

1. **Configure EAS Build**:
   ```bash
   eas login
   eas build:configure
   ```

2. **Update app.json** with your details:
   ```json
   {
     "expo": {
       "name": "CheckMate",
       "ios": {
         "bundleIdentifier": "com.yourcompany.checkmate"
       }
     }
   }
   ```

3. **Build for iOS**:
   ```bash
   eas build --platform ios --profile production
   ```

4. **Submit to App Store**:
   ```bash
   eas submit --platform ios --profile production
   ```

## App Store Submission

### Required Information
- **App Name**: CheckMate
- **Category**: Finance
- **Age Rating**: 4+ (suitable for all ages)
- **Privacy Policy**: Required due to financial data access

### App Store Guidelines
- Financial app compliance
- Clear explanation of Plaid integration
- Privacy policy explaining data usage
- Screenshots showing main functionality

### Review Process
- Typical review time: 24-48 hours
- Financial apps may require additional review
- Ensure Plaid production credentials are active

## Technical Architecture

- **Framework**: React Native with Expo SDK 53
- **Navigation**: React Navigation 6
- **State Management**: Zustand with AsyncStorage persistence
- **Styling**: NativeWind (Tailwind CSS)
- **Bank Integration**: Plaid Link SDK
- **Notifications**: Expo Notifications
- **Type Safety**: TypeScript

## Security Features

- Plaid-powered bank connections (bank-level security)
- No storage of banking credentials
- Local data encryption via AsyncStorage
- Secure API communication
- Error boundaries for crash protection

## Support

For technical support or bug reports, contact: [your-support-email@company.com]

## License

Copyright © 2024 CheckMate. All rights reserved.