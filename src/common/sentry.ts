import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

const { SENTRY_DEBUG, SENTRY_DSN } = Constants.expoConfig?.extra ?? {};

Sentry.init({
	dsn: SENTRY_DSN,
	// `enableInExpoDevelopment` was a sentry-expo option; on @sentry/react-native
	// the SDK is enabled in dev when `debug`/`enabled` are set.
	debug: SENTRY_DEBUG,
	enabled: true,
});

// `Constants.manifest.revisionId` -> the OTA update id on modern SDKs.
if (Constants.expoConfig?.extra?.eas?.revisionId) {
	Sentry.setTag('revisionId', Constants.expoConfig.extra.eas.revisionId);
}
