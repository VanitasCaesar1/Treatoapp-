# Capacitor App Production Checklist

## ✅ Already Implemented

- [x] Capacitor core packages installed
- [x] Android & iOS projects configured
- [x] Splash screens (Android)
- [x] App icons (Android)
- [x] Status bar configuration
- [x] Keyboard handling
- [x] Haptic feedback
- [x] Network detection
- [x] App state management
- [x] Back button handling (Android)
- [x] Biometric authentication
- [x] Local notifications
- [x] Geolocation
- [x] Safe area insets

## ❌ Missing Critical Items

### 1. **App Metadata & Branding**
- [ ] App name in all languages
- [ ] App description
- [ ] App version management
- [ ] Bundle ID verification
- [ ] Privacy policy URL
- [ ] Terms of service URL

### 2. **Icons & Assets**
- [ ] iOS app icons (all sizes)
- [ ] iOS splash screens
- [ ] Adaptive icon (Android)
- [ ] Notification icons
- [ ] Tab bar icons
- [ ] Asset catalog (iOS)

### 3. **Permissions & Privacy**
- [ ] Camera permission description (iOS Info.plist)
- [ ] Photo library permission description
- [ ] Location permission description
- [ ] Notification permission description
- [ ] Biometric permission description
- [ ] Microphone permission (for video calls)
- [ ] Android permissions in AndroidManifest.xml

### 4. **Deep Linking**
- [ ] URL scheme registration (iOS)
- [ ] Intent filters (Android)
- [ ] Universal links (iOS)
- [ ] App links (Android)
- [ ] Deep link handler implementation

### 5. **Push Notifications**
- [ ] Firebase Cloud Messaging setup
- [ ] APNs certificates (iOS)
- [ ] Push notification service
- [ ] Notification handlers
- [ ] Badge count management

### 6. **Security**
- [ ] SSL pinning
- [ ] Code obfuscation
- [ ] API key protection
- [ ] Secure storage for tokens
- [ ] Root/jailbreak detection
- [ ] Screenshot prevention (sensitive screens)

### 7. **Performance**
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle size optimization
- [ ] Memory leak prevention
- [ ] Crash reporting (Sentry/Crashlytics)

### 8. **Analytics & Monitoring**
- [ ] Analytics SDK (Firebase/Mixpanel)
- [ ] Error tracking
- [ ] Performance monitoring
- [ ] User behavior tracking
- [ ] A/B testing setup

### 9. **Build & Deployment**
- [ ] Production build configuration
- [ ] Code signing (iOS)
- [ ] Keystore (Android)
- [ ] CI/CD pipeline
- [ ] App Store metadata
- [ ] Play Store metadata
- [ ] Screenshots for stores

### 10. **Testing**
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Device testing (multiple devices)
- [ ] OS version testing
- [ ] Network condition testing
- [ ] Accessibility testing

### 11. **Offline Support**
- [ ] Service worker
- [ ] Offline data caching
- [ ] Queue for offline actions
- [ ] Sync when back online
- [ ] Offline UI indicators

### 12. **App Store Requirements**
- [ ] Privacy manifest (iOS 17+)
- [ ] App tracking transparency
- [ ] Data collection disclosure
- [ ] Age rating
- [ ] Content rating
- [ ] Export compliance

## 🔧 Implementation Needed

### Priority 1: Critical for Launch

#### 1. Permissions Configuration

**iOS (ios/App/App/Info.plist)**
```xml
<key>NSCameraUsageDescription</key>
<string>We need camera access to update your profile photo</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>We need photo library access to select profile photos</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>We need your location to find nearby doctors</string>
<key>NSFaceIDUsageDescription</key>
<string>Use Face ID to securely log in</string>
<key>NSMicrophoneUsageDescription</key>
<string>We need microphone access for video consultations</string>
```

**Android (android/app/src/main/AndroidManifest.xml)**
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

#### 2. Deep Linking Setup

**iOS URL Scheme (ios/App/App/Info.plist)**
```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>treato</string>
    </array>
  </dict>
</array>
```

**Android Intent Filter (android/app/src/main/AndroidManifest.xml)**
```xml
<intent-filter>
  <action android:name="android.intent.action.VIEW" />
  <category android:name="android.intent.category.DEFAULT" />
  <category android:name="android.intent.category.BROWSABLE" />
  <data android:scheme="treato" />
</intent-filter>
```

#### 3. Push Notifications

Install packages:
```bash
npm install @capacitor/push-notifications
npm install firebase
```

#### 4. Crash Reporting

Install Sentry:
```bash
npm install @sentry/capacitor @sentry/react
```

### Priority 2: Important for UX

#### 5. Share API
```bash
npm install @capacitor/share
```

Usage:
```typescript
import { Share } from '@capacitor/share';

await Share.share({
  title: 'Check out this doctor',
  text: 'Dr. Smith - Cardiologist',
  url: 'https://treato.app/doctor/123',
  dialogTitle: 'Share with friends',
});
```

#### 6. App Launcher
```bash
npm install @capacitor/app-launcher
```

Open maps, phone, etc:
```typescript
import { AppLauncher } from '@capacitor/app-launcher';

// Open phone dialer
await AppLauncher.openUrl({ url: 'tel:+1234567890' });

// Open maps
await AppLauncher.openUrl({ 
  url: 'https://maps.google.com/?q=Hospital+Name' 
});
```

#### 7. Calendar Integration
```bash
npm install @capacitor-community/calendar
```

Add appointments to calendar:
```typescript
import { Calendar } from '@capacitor-community/calendar';

await Calendar.createEvent({
  title: 'Doctor Appointment',
  location: 'City Hospital',
  startDate: new Date().getTime(),
  endDate: new Date().getTime() + 3600000,
});
```

### Priority 3: Nice to Have

#### 8. App Rating
```bash
npm install capacitor-rate-app
```

#### 9. In-App Browser
```bash
npm install @capacitor/browser
```

#### 10. Screenshot Prevention
```bash
npm install capacitor-plugin-prevent-screenshot
```

## 📱 Platform-Specific Files Needed

### iOS Files
```
ios/App/App/
├── Info.plist (needs permissions)
├── Assets.xcassets/
│   ├── AppIcon.appiconset/ (all icon sizes)
│   └── LaunchImage.launchimage/ (splash screens)
├── GoogleService-Info.plist (for Firebase)
└── Entitlements.plist (for capabilities)
```

### Android Files
```
android/app/src/main/
├── AndroidManifest.xml (needs permissions & intent filters)
├── res/
│   ├── mipmap-*/ (app icons - already have)
│   ├── drawable-*/ (splash screens - already have)
│   └── values/
│       ├── strings.xml (app name, descriptions)
│       └── colors.xml (theme colors)
├── google-services.json (for Firebase)
└── key.properties (for signing)
```

## 🚀 Build Commands

### Development
```bash
# Web
npm run dev

# iOS
npm run build:mobile
npm run ios

# Android
npm run build:mobile
npm run android
```

### Production
```bash
# Build web assets
npm run build

# Sync with native projects
npx cap sync

# iOS (Xcode)
npx cap open ios
# Then: Product > Archive

# Android (Android Studio)
npx cap open android
# Then: Build > Generate Signed Bundle/APK
```

## 📊 App Store Assets Needed

### Screenshots (both platforms)
- 6.5" iPhone (1284 x 2778)
- 5.5" iPhone (1242 x 2208)
- iPad Pro (2048 x 2732)
- Android Phone (1080 x 1920)
- Android Tablet (1536 x 2048)

### Marketing Materials
- App icon (1024x1024)
- Feature graphic (Android: 1024x500)
- Promotional text
- Description (short & long)
- Keywords
- Support URL
- Privacy policy URL

## 🔐 Security Checklist

- [ ] Environment variables not in code
- [ ] API keys in secure storage
- [ ] HTTPS only
- [ ] Certificate pinning
- [ ] Token refresh mechanism
- [ ] Biometric re-auth for sensitive actions
- [ ] Session timeout
- [ ] Secure flag on sensitive screens

## ⚡ Performance Checklist

- [ ] Images optimized (WebP)
- [ ] Lazy load images
- [ ] Code splitting
- [ ] Tree shaking
- [ ] Minification
- [ ] Compression (gzip/brotli)
- [ ] CDN for assets
- [ ] API response caching

## 📝 Documentation Needed

- [ ] README with setup instructions
- [ ] API documentation
- [ ] Architecture documentation
- [ ] Deployment guide
- [ ] Troubleshooting guide
- [ ] Contributing guidelines

## 🎯 Next Steps

1. **Immediate**: Add permissions to Info.plist and AndroidManifest.xml
2. **This Week**: Set up push notifications and deep linking
3. **Before Launch**: Add crash reporting and analytics
4. **Nice to Have**: Share API, calendar integration, app rating

---

**Current Status**: ~60% complete for production
**Estimated Time to Production Ready**: 2-3 weeks
