# EVE Nomad Mobile

Cross-platform mobile companion app for EVE Online players.

## Features

- **Character Management**: Link multiple EVE characters via EVE SSO OAuth
- **Skill Queue Monitoring**: Real-time skill training progress with push notifications (Premium)
- **Wallet Tracking**: Monitor ISK balance and transaction history
- **Market Orders**: View active buy/sell orders and market activity
- **Dark Space Theme**: EVE Online-inspired UI with immersive design

## Technology Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand + React Query
- **API Client**: Axios with JWT authentication
- **Storage**: MMKV (encrypted secure storage)
- **Code Quality**: ESLint + Prettier

## Prerequisites

- **Node.js**: v22.x or higher
- **pnpm**: v10.x or higher
- **Expo CLI**: Installed globally (`pnpm add -g expo-cli`)
- **Mobile Device**: iOS (TestFlight) or Android device with Expo Go app
- **Backend API**: EVE Nomad Backend running on `http://localhost:3000`

## Installation

1. **Clone the repository**:

```bash
git clone https://github.com/UlyasPendragon/eve-online-tool.git
cd eve-online-tool/eve-nomad-mobile
```

2. **Install dependencies**:

```bash
pnpm install
```

3. **Configure environment variables**:

```bash
cp .env.example .env
```

Edit `.env` and set your configuration:

```env
API_URL=http://localhost:3000
EVE_SSO_CLIENT_ID=your_eve_sso_client_id
```

4. **Start the development server**:

```bash
pnpm start
```

## Development

### Available Scripts

- `pnpm start` - Start Expo development server
- `pnpm android` - Run on Android device/emulator
- `pnpm ios` - Run on iOS simulator (macOS only)
- `pnpm web` - Run in web browser
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors automatically
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting
- `pnpm typecheck` - Run TypeScript type checking

### Project Structure

```
eve-nomad-mobile/
├── app/                      # Expo Router file-based routing
│   ├── (auth)/              # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/              # Main app tabs
│   │   ├── index.tsx        # Dashboard
│   │   ├── skills.tsx       # Skill queue
│   │   ├── wallet.tsx       # Wallet
│   │   ├── market.tsx       # Market orders
│   │   └── characters.tsx   # Character management
│   └── _layout.tsx          # Root layout
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (Button, Card, etc.)
│   │   ├── characters/     # Character-related components
│   │   └── skills/         # Skill-related components
│   ├── services/           # Backend services
│   │   ├── api/           # API client and endpoints
│   │   └── storage.ts     # Secure storage wrapper
│   ├── hooks/             # Custom React hooks
│   │   └── queries/       # React Query hooks
│   ├── stores/            # Zustand global stores
│   ├── utils/             # Utility functions
│   │   ├── theme.ts       # Theme configuration
│   │   └── config.ts      # App configuration
│   └── types/             # TypeScript type definitions
│       └── api.ts         # API response types
├── assets/                # Static assets (images, fonts)
├── .env.example          # Environment variable template
├── tsconfig.json         # TypeScript configuration
├── .eslintrc.js          # ESLint configuration
└── .prettierrc           # Prettier configuration
```

### Code Quality

The project enforces strict TypeScript and code quality standards:

- **TypeScript**: Strict mode enabled (`strict: true`)
- **ESLint**: Catches common React/TypeScript issues
- **Prettier**: Consistent code formatting
- **Pre-commit hooks**: Auto-format and lint on commit

### API Integration

The mobile app communicates with the EVE Nomad Backend API:

- **Base URL**: Configured via `API_URL` environment variable
- **Authentication**: JWT tokens stored in encrypted MMKV storage
- **Auto-refresh**: Tokens automatically refreshed on 401 responses
- **Type-safe**: TypeScript interfaces for all API endpoints

## Testing

### Testing on Physical Device

1. **Install Expo Go** on your mobile device:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

2. **Start the dev server**:

```bash
pnpm start
```

3. **Scan the QR code** with your device camera (iOS) or Expo Go app (Android)

### Testing on Emulator

**Android Emulator**:

```bash
pnpm android
```

**iOS Simulator** (macOS only):

```bash
pnpm ios
```

## Environment Variables

| Variable            | Description                          | Default                 |
| ------------------- | ------------------------------------ | ----------------------- |
| `API_URL`           | Backend API URL                      | `http://localhost:3000` |
| `EVE_SSO_CLIENT_ID` | EVE SSO OAuth Client ID              | -                       |
| `APP_ENV`           | Environment (development/production) | `development`           |
| `ENABLE_DEV_TOOLS`  | Enable React Query DevTools          | `true`                  |

## Authentication Flow

1. User taps "Login with EVE Online"
2. App opens EVE SSO in system browser
3. User authorizes scopes (ESI permissions)
4. Callback redirects to app with authorization code
5. Backend exchanges code for JWT token
6. Token stored securely in MMKV
7. User redirected to dashboard

## Subscription Model (CCP Compliant)

### Free Tier

- All ESI data access (characters, skills, wallet, market orders)
- Skill queue monitoring
- Character management
- Market order tracking

### Premium Tier ($4.99/month)

- Push notifications for skill completion
- Historical wallet data storage
- Advanced market analytics
- Multi-character dashboard views

**Note**: The freemium model is fully CCP-compliant. Free users have complete access to all ESI data. Premium features are backend services (notifications, historical storage, analytics processing) that justify the subscription fee.

## Deployment

### iOS (TestFlight)

1. Build the app using Expo Application Services (EAS):

```bash
eas build --platform ios
```

2. Upload to App Store Connect
3. Create TestFlight build
4. Invite beta testers

### Android (Google Play)

1. Build the APK/AAB using EAS:

```bash
eas build --platform android
```

2. Upload to Google Play Console
3. Create internal testing track
4. Invite beta testers

## Troubleshooting

### Cannot connect to backend API

- Ensure backend is running: `cd eve-nomad-backend && pnpm dev`
- Check `API_URL` in `.env` matches backend URL
- If testing on physical device, use your computer's IP address instead of `localhost`

### Expo Go connection issues

- Ensure your computer and mobile device are on the same WiFi network
- Disable VPN or firewall that might block connections
- Try restarting both the dev server and Expo Go app

### TypeScript errors

```bash
pnpm typecheck
```

Fix any type errors before proceeding.

### Linting errors

```bash
pnpm lint:fix
pnpm format
```

## Contributing

Please see [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory for development workflow and contribution guidelines.

## License

MIT License - see [LICENSE](../LICENSE) for details.

## Documentation

- **Frontend Development Plan**: `Docs/Frontend_Development_Plan.md`
- **CCP Compliance**: `Docs/CCP_Compliance_Documentation.md`
- **Backend API Docs**: `eve-nomad-backend/TESTING.md`
- **EVE SSO Setup**: `eve-nomad-backend/EVE_SSO_SETUP.md`

## Linear Project

Development tracking: [EVE Nomad Mobile (Linear)](https://linear.app/eve-online-tool)

Issues EVE-72 through EVE-95 track the mobile app development across 4 phases:

- **Phase 1**: Foundation (setup, navigation, design system)
- **Phase 2**: Authentication (OAuth, token refresh, route guards)
- **Phase 3**: Character Management (list, switcher, add/remove)
- **Phase 4**: Skill Queue & Dashboard (real-time progress, notifications)

## Support

For questions or issues:

- Create an issue in [GitHub Issues](https://github.com/UlyasPendragon/eve-online-tool/issues)
- Join our Discord server (coming soon)
- Check [EVE Online Third-Party Developer Documentation](https://developers.eveonline.com/)
