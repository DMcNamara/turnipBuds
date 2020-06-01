import { AdMobBanner, setTestDeviceIDAsync } from 'expo-ads-admob';
import Constants from 'expo-constants';
import React from 'react';
import { Platform, StyleProp, ViewStyle } from 'react-native';
import * as Sentry from 'sentry-expo';
import { useTypedSelector } from '../../store';
import { User } from '../../store/collections';

const { ADMOB_BANNER_ANDROID, ADMOB_BANNER_IOS } = Constants.manifest.extra;

setTestDeviceIDAsync('EMULATOR');

export function BannerAd(props: { style?: StyleProp<ViewStyle> }) {
	const adUnitId: string =
		Platform.OS === 'ios' ? ADMOB_BANNER_IOS : ADMOB_BANNER_ANDROID;
	const user = useTypedSelector<User>(
		(state) => state.firestore.data.profile
	);
	return (
		<>
			{!!user.pro === false && (
				<AdMobBanner
					style={props.style}
					adUnitID={adUnitId}
					servePersonalizedAds
					onDidFailToReceiveAdWithError={(e) =>
						Sentry.captureException(e)
					}
				/>
			)}
		</>
	);
}
