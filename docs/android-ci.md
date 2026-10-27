# Android builds in CI (React Native + Gradle, no Expo EAS)

DevDeck starts these builds, shows them under **Releases → Android**, hosts the APK for
download / scan-to-install, and submits AABs to Google Play after approval.

| File | What it does |
|---|---|
| `.github/workflows/android-build.yml` | GitHub Actions: `variant` = `apk` (install directly) or `aab` (Play). Uploads the `android-build` artifact |
| `.github/workflows/android-release.yml` | GitHub Actions: downloads an AAB build's artifact and uploads it to a Play track with `fastlane supply` |
| `.gitlab-ci.yml` | GitLab CI: `android_build` (runs when `DEVDECK_ANDROID=apk\|aab`) and the manual `android_release` job |
| `android/app/build.gradle` | `versionCode` from `-PversionCode`; release signing from env vars when `ANDROID_KEYSTORE_PATH` is set |

Each build uploads the app file plus `devdeck-build.json`
(`{"platform","variant","versionName","versionCode"}`). DevDeck reads the version from it.

- `versionCode` = CI run number (`github.run_number` / `CI_PIPELINE_IID`) + `VERSION_CODE_OFFSET`.
- `versionName` = `expo.version` in `app.json`.

## 1. Upload keystore (once)

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore upload.keystore \
  -alias upload -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 upload.keystore   # value for ANDROID_KEYSTORE_BASE64
```

Keep `upload.keystore` and its passwords somewhere safe, outside the repo. Without the keystore
secrets, CI signs with the debug key: the APK installs, but Play rejects it.

## 2. Secrets and variables

| Name | GitHub (Settings → Secrets and variables → Actions) | GitLab (Settings → CI/CD → Variables) |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Secret | Variable, masked + protected |
| `ANDROID_KEYSTORE_PASSWORD` | Secret | Variable, masked |
| `ANDROID_KEY_ALIAS` | Secret | Variable |
| `ANDROID_KEY_PASSWORD` | Secret | Variable, masked |
| `PLAY_SERVICE_ACCOUNT_JSON` | Secret (needed for releases only) | Variable, masked (releases only) |
| `VERSION_CODE_OFFSET` | Variable (optional, default 0) | Variable (optional, default 0) |
| `ANDROID_PACKAGE_NAME` | Variable (optional; default: `applicationId` in build.gradle) | Variable (optional) |

Protected GitLab variables only reach protected branches, so protect the deploy branches DevDeck
builds from, or leave the variables unprotected.

## 3. Google Play (once)

1. Create the app in Play Console.
2. **Change the placeholder package `com.yourname.financeapp`** (app.json, `android/app/build.gradle`
   `namespace` + `applicationId`, and the Kotlin package) **before the first upload**. It can't change afterwards.
3. Build an AAB once, download it from the run's artifact, and upload it **by hand** to Internal testing.
   Google requires the first upload to be manual. Accept Play App Signing.
4. Google Cloud → create a service account → JSON key → Play Console → Users and permissions → invite
   the service account email with release permissions. Put the JSON in `PLAY_SERVICE_ACCOUNT_JSON`.

## 4. DevDeck

Finance App must be a **Mobile** app in DevDeck, with its environments' deploy branches set
(e.g. Staging → `staging`, Production → `master`). Then on the app's source connector:

| GitHub connector field | Value |
|---|---|
| Android build workflow | `android-build.yml` |
| Android release workflow | `android-release.yml` |
| Play track | `internal` (or `alpha` / `beta` / `production`) |

| GitLab connector field | Value |
|---|---|
| Android build job | `android_build` |
| Android release job | `android_release` |
| Play track | `internal` |

DevDeck's GitHub token needs **Actions: read and write** on this repo. A GitLab token needs the `api` scope.

## Not covered yet

- iOS. It needs a macOS runner, Apple certificates and an App Store Connect key.
- The `.eas/` folder and `eas.json` are for the Expo EAS path. These CI workflows don't use them.
