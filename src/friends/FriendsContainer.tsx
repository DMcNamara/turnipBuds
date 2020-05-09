import { RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { TabsScreenList } from '../../App';
import { Toast } from '../common/Toast';
import { User } from '../store/collections';
import { HeaderTheme } from '../theme';
import { FriendsIndex } from './FriendsIndex';
import { FriendViewContainer } from './view/FriendViewContainer';

type Props = {
	route: RouteProp<TabsScreenList, 'Friends'>;
};

export type FriendsContainerScreenList = {
	Friends: { uid: string };
	FriendView: { user: User };
};
const Stack = createStackNavigator<FriendsContainerScreenList>();
export function FriendsContainer(props: Props) {
	const uid = props.route.params.uid;

	if (!uid) {
		return <></>;
	}

	return (
		<>
			<Stack.Navigator
				screenOptions={{
					...HeaderTheme,
				}}
			>
				<Stack.Screen
					name="Friends"
					component={FriendsIndex}
					initialParams={{ uid: props.route.params.uid }}
				/>
				<Stack.Screen
					name="FriendView"
					component={FriendViewContainer}
					options={({ route }) => ({
						title: route.params.user.displayName,
					})}
				/>
			</Stack.Navigator>
			<Toast />
		</>
	);
}
