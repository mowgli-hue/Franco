# Update System (Mobile + Desktop)

## Mobile (Expo OTA)

This project is configured for EAS OTA updates:

- `apps/mobile/app.json`
  - `runtimeVersion.policy = appVersion`
  - `updates.url` points to your EAS project
- `apps/mobile/eas.json`
  - channels: `development`, `preview`, `production`
- App startup checks for OTA and reloads automatically when available.

### First-time setup

```bash
cd apps/mobile
eas login
eas whoami
```

### Release a store binary (required when native code changes)

```bash
cd apps/mobile
eas build --platform ios --profile production
eas build --platform android --profile production
```

### Push JS/UI updates without reinstall (OTA)

```bash
cd /Users/junglelabs/Documents/New\ project/clb-french-trainer
npm run update:mobile:production
```

For testing to internal users:

```bash
cd /Users/junglelabs/Documents/New\ project/clb-french-trainer
npm run update:mobile:preview
```

## Desktop (Electron auto-update)

Desktop app is prepared to use GitHub Releases as update source.

### Install dependency once

```bash
cd /Users/junglelabs/Documents/New\ project/clb-french-trainer
npm install electron-updater
```

### Build and publish

```bash
cd /Users/junglelabs/Documents/New\ project/clb-french-trainer
export GH_TOKEN=your_github_personal_access_token
npm run build:desktop
```

Notes:
- Keep version bumped in `package.json` for each desktop release.
- On app start, Electron checks GitHub for updates and downloads automatically.
