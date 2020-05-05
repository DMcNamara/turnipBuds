import { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { Paragraph, Title } from 'react-native-paper';
import { connect, ConnectedProps } from 'react-redux';
import {
	ExtendedFirebaseInstance,
	firestoreConnect,
} from 'react-redux-firebase';
import { compose } from 'redux';
import {
	CenteredActivityIndicator,
	renderIfEmpty,
	spinnerWhileLoading,
} from '../common/Loading';
import { calculateWeekHash, dateInWords, getSunday } from '../common/utils';
import { WeekInput } from '../common/week-input/WeekInput';
import { RootState } from '../store';
import {
	User,
	UsersCollection,
	WeekPrice,
	WeeksCollection,
} from '../store/collections';
import { FriendsContainerScreenList } from './FriendsContainer';

type Props = {
	route: RouteProp<FriendsContainerScreenList, 'FriendView'>;
};
export function FriendViewScreen({ route }: Props) {
	const [weekHash, setWeekHash] = useState('');
	const uid = route.params.user.id;
	const sunday = getSunday();

	useEffect(() => {
		(async () => {
			const digest = await calculateWeekHash(sunday, uid);
			setWeekHash(digest);
		})();
	}, [uid]);

	if (!uid || !weekHash) {
		return <CenteredActivityIndicator />;
	}
	return (
		<FriendView
			sunday={sunday}
			user={route.params.user}
			weekHash={weekHash}
		/>
	);
}

/**
 * FriendView Component
 */
interface FriendViewProps {
	sunday: Date;
	user: User;
	weekHash: string;
}
type ComponentProps = PropsFromRedux & FriendViewProps;
function Component(props: ComponentProps) {
	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<View style={{ margin: 15 }}>
				<Title>Week of {dateInWords(props.sunday)}</Title>
				<Paragraph>
					Island Purchase Price: {props.week.islandBuyPrice}
				</Paragraph>
				<WeekInput weekPrices={props.week} />
			</View>
		</ScrollView>
	);
}
/**
 * CONNECT
 */
const storeAs = `Friend${WeeksCollection}`;
const fsConnect = firestoreConnect((props: FriendViewProps) => {
	const collection = `${UsersCollection}/${props.user.id}/${WeeksCollection}`;
	return [
		{
			collection,
			doc: props.weekHash,
			storeAs,
		},
	];
});
const connector = connect((state: RootState) => ({
	week: state.firestore.data[storeAs] as WeekPrice,
}));
interface PropsFromRedux extends ConnectedProps<typeof connector> {
	firebase: ExtendedFirebaseInstance;
}
export const FriendView = compose<(props: FriendViewProps) => JSX.Element>(
	fsConnect,
	connector,
	spinnerWhileLoading(['week']),
	renderIfEmpty(['week'], 'Your friend has no data for this week!')
)(Component);
