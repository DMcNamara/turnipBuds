import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import {
	ExtendedFirebaseInstance,
	firestoreConnect,
	isEmpty,
	isLoaded,
	useFirestore,
} from 'react-redux-firebase';
import { compose } from 'redux';
import { TabsScreenList } from '../../App';
import { CenteredActivityIndicator } from '../common/Loading';
import { HomePredictions } from '../common/predictions/Predictions';
import { Toast } from '../common/Toast';
import { calculateWeekHash, dateInISO, getSunday } from '../common/utils';
import { RootState } from '../store';
import {
	UsersCollection,
	WeekPrice,
	WeeksCollection,
} from '../store/collections';
import { HeaderTheme } from '../theme';
import { Home } from './Home';

type HomeContainerProps = {
	route: RouteProp<TabsScreenList, 'Me'>;
};

type HomeContainerScreenList = {
	Home: { uid: string; weekHash: string };
};
const Stack = createStackNavigator<HomeContainerScreenList>();
export function HomeContainer({ route }: HomeContainerProps) {
	const [weekHash, setWeekHash] = useState('');
	const uid = route.params.uid;
	const sunday = getSunday();

	useEffect(() => {
		(async () => {
			const digest = await calculateWeekHash(sunday, uid);
			setWeekHash(digest);
		})();
	}, [uid, sunday]);

	if (!route.params.uid || !weekHash) {
		return <CenteredActivityIndicator />;
	}

	return (
		<>
			<Stack.Navigator
				screenOptions={{
					...HeaderTheme,
				}}
			>
				<Stack.Screen
					name="Home"
					component={HomeNavigator}
					initialParams={{ uid: route.params.uid, weekHash }}
				/>
			</Stack.Navigator>
			<Toast />
		</>
	);
}

export type HomeNavigatorScreenList = {
	Home: { uid: string; weekHash: string; weeks: WeekPrice[] };
	Predictions: {};
};
const Tab = createMaterialTopTabNavigator<HomeNavigatorScreenList>();
type HomeNavigatorProps = {
	route: RouteProp<HomeContainerScreenList, 'Home'>;
};
type Props = PropsFromRedux & HomeNavigatorProps;
function HomeNavigatorComponent(props: Props) {
	const firestore = useFirestore();
	const { uid, weekHash } = props.route.params;
	if (isEmpty(props.weeks)) {
		if (isLoaded(props.weeks)) {
			const collection = `${UsersCollection}/${uid}/${WeeksCollection}`;
			firestore.set(
				{ collection, doc: weekHash },
				{
					...new WeekPrice({
						id: weekHash,
						start: dateInISO(getSunday()),
					}),
				}
			);
		}
		return <></>;
	}
	return (
		<Tab.Navigator>
			<Tab.Screen
				name="Home"
				component={Home}
				options={{ tabBarLabel: 'My Prices' }}
				initialParams={{
					uid,
					weekHash,
					weeks: props[WeeksCollection],
				}}
			/>
			<Tab.Screen
				name="Predictions"
				component={HomePredictions}
				options={{ tabBarLabel: 'Predictions' }}
			/>
		</Tab.Navigator>
	);
}

/**
 * CONNECT
 */
const fsConnect = firestoreConnect((props: HomeNavigatorProps) => {
	const collection = `${UsersCollection}/${props.route.params.uid}/${WeeksCollection}`;
	return [
		{
			collection,
			doc: props.route.params.weekHash,
			storeAs: WeeksCollection,
		},
	];
});
const connector = connect((state: RootState) => ({
	[WeeksCollection]: state.firestore.ordered[WeeksCollection],
}));
interface PropsFromRedux extends ConnectedProps<typeof connector> {
	firebase: ExtendedFirebaseInstance;
}
export const HomeNavigator = compose<
	(props: HomeNavigatorProps) => JSX.Element
>(
	fsConnect,
	connector
)(HomeNavigatorComponent);
