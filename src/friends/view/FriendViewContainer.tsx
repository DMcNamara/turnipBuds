import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
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
} from '../../common/Loading';
import { FriendPredictions } from '../../common/predictions/Predictions';
import { calculateWeekHash, getSunday } from '../../common/utils';
import { RootState } from '../../store';
import {
	FriendsWeekCollection,
	User,
	UsersCollection,
	WeeksCollection,
} from '../../store/collections';
import { getFriendsWeekPrice } from '../../store/selectors';
import { TabTheme } from '../../theme';
import { FriendsContainerScreenList } from '../FriendsContainer';
import { FriendView } from './FriendView';

type Props = {
	route: RouteProp<FriendsContainerScreenList, 'FriendView'>;
};
export function FriendViewContainer({ route }: Props) {
	const [weekHash, setWeekHash] = useState('');
	const uid = route.params.user.id;
	const sunday = getSunday();

	useEffect(() => {
		(async () => {
			const digest = await calculateWeekHash(sunday, uid);
			setWeekHash(digest);
		})();
	}, [uid, sunday]);

	if (!uid || !weekHash) {
		return <CenteredActivityIndicator />;
	}
	return (
		<FriendViewNavigator
			sunday={sunday}
			user={route.params.user}
			weekHash={weekHash}
		/>
	);
}

/**
 * FriendViewNavigator Component
 */
export type FriendViewNavigatorScreenList = {
	View: FriendViewProps;
	Predictions: {};
};
const Tab = createMaterialTopTabNavigator<FriendViewNavigatorScreenList>();
interface FriendViewProps {
	sunday: Date;
	user: User;
	weekHash: string;
}
type ComponentProps = PropsFromRedux & FriendViewProps;
function Component(props: ComponentProps) {
	return (
		<Tab.Navigator tabBarOptions={TabTheme}>
			<Tab.Screen
				name="View"
				component={FriendView}
				options={{ tabBarLabel: 'Prices' }}
				initialParams={{
					sunday: props.sunday,
					weekHash: props.weekHash,
				}}
			/>
			<Tab.Screen
				name="Predictions"
				component={FriendPredictions}
				initialParams={{
					weekHash: props.weekHash,
				}}
			/>
		</Tab.Navigator>
	);
}
/**
 * CONNECT
 */
const fsConnect = firestoreConnect((props: FriendViewProps) => {
	const collection = `${UsersCollection}/${props.user.id}/${WeeksCollection}`;
	return [
		{
			collection,
			where: ['id', '==', props.weekHash],
			storeAs: FriendsWeekCollection,
		},
	];
});
const connector = connect((state: RootState, props: FriendViewProps) => ({
	week: getFriendsWeekPrice(state, props.weekHash),
	[FriendsWeekCollection]: state.firestore.data[FriendsWeekCollection],
}));
interface PropsFromRedux extends ConnectedProps<typeof connector> {
	firebase: ExtendedFirebaseInstance;
}
export const FriendViewNavigator = compose<
	(props: FriendViewProps) => JSX.Element
>(
	fsConnect,
	connector,
	spinnerWhileLoading([FriendsWeekCollection]),
	renderIfEmpty(
		[FriendsWeekCollection],
		'Your friend has no data for this week!'
	)
)(Component);
