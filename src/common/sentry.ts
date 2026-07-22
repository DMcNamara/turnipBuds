import Constants from 'expo-constants';
import * as Sentry from '@sentry/react-native';

const { SENTRY_DEBUG, SENTRY_DSN } = Constants.expoConfig?.extra ?? {};

Sentry.init({
	dsn: SENTRY_DSN,
	debug: SENTRY_DEBUG,
	enabled: true,
});

if (Constants.expoConfig?.extra?.eas?.revisionId) {
	Sentry.setTag('revisionId', Constants.expoConfig.extra.eas.revisionId);
}
