import Constants from 'expo-constants';
import * as Sentry from 'sentry-expo';

const { SENTRY_DEBUG, SENTRY_DSN } = Constants.manifest.extra;

Sentry.init({
	dsn: SENTRY_DSN,
	enableInExpoDevelopment: SENTRY_DEBUG,
	debug: SENTRY_DEBUG,
});

if (Constants.manifest.revisionId) {
	Sentry.setRelease(Constants.manifest.revisionId);
}
