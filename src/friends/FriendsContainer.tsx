import { RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { TabsScreenList } from '../../App';
import { Toast } from '../common/Toast';
import { FriendsIndex } from './FriendsIndex';
import { FriendViewScreen } from './FriendView';
import { User } from '../store/collections';

type Props = {
	route: RouteProp<TabsScreenList, 'Friends'>;
};

export type FriendsContainerScreenList = {
	Friends: { uid: string };
	FriendView: { user: User }
};
const Stack = createStackNavigator<FriendsContainerScreenList>();
export function FriendsContainer(props: Props) {
	const uid = props.route.params.uid;

	if (!uid) {
		return <></>;
	}

	return (
		<>
			<Stack.Navigator>
				<Stack.Screen
					name="Friends"
					component={FriendsIndex}
					initialParams={{ uid: props.route.params.uid }}
				/>
				<Stack.Screen
					name="FriendView"
					component={FriendViewScreen}
					options={({ route }) => ({ title: route.params.user.displayName })}
				/>
			</Stack.Navigator>
			<Toast />
		</>
	);
}
