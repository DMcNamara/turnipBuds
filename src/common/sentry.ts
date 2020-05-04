import Constants from 'expo-constants';
import { SENTRY_DEBUG, SENTRY_DSN } from 'react-native-dotenv';
import * as Sentry from 'sentry-expo';

Sentry.init({
	dsn: SENTRY_DSN,
	enableInExpoDevelopment: SENTRY_DEBUG,
	debug: SENTRY_DEBUG,
});

if (Constants.manifest.revisionId) {
	Sentry.setRelease(Constants.manifest.revisionId);
}
