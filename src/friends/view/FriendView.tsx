import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Paragraph, Title } from 'react-native-paper';
import { CenteredActivityIndicator } from '../../common/Loading';
import { dateInWords } from '../../common/utils';
import { WeekInput } from '../../common/week-input/WeekInput';
import { useTypedSelector } from '../../store';
import { FriendsWeekCollection, WeekPrice } from '../../store/collections';
import { FriendViewNavigatorScreenList } from './FriendViewContainer';

type Props = {
	route: RouteProp<FriendViewNavigatorScreenList, 'View'>;
};
export function FriendView({ route }: Props) {
	const weekPrice = useTypedSelector<WeekPrice>(
		({ firestore: { data } }) => data[FriendsWeekCollection]
	);

	if (!weekPrice) {
		<CenteredActivityIndicator />;
	}
	const week = weekPrice;
	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<View style={{ margin: 12 }}>
				<Title>Week of {dateInWords(route.params.sunday)}</Title>
				<Paragraph>
					Island Purchase Price: {week.islandBuyPrice}
				</Paragraph>
				<WeekInput weekPrices={week} />
			</View>
		</ScrollView>
	);
}
