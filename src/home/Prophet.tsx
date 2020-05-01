import React from 'react';
import { WebView } from 'react-native-webview';
import { HomeContainerScreenList } from './HomeContainer';
import { RouteProp } from '@react-navigation/native';
import { getProphetLink } from '../store/weeks/week-price.repository';
import { useTypedSelector } from '../store';
import { WeekPrice, WeeksCollection } from '../store/collections';

type ProphetProps = {
	route: RouteProp<HomeContainerScreenList, 'Prophet'>;
};
export function Prophet({}: ProphetProps) {
	const weekPrices = useTypedSelector<WeekPrice[]>(
		({ firestore: { ordered } }) => ordered[WeeksCollection]
	);
	if (!weekPrices || !weekPrices[0]) {
		return <></>;
	}
	const uri = getProphetLink(weekPrices[0]);
	return <WebView source={{ uri }}/>;
}
