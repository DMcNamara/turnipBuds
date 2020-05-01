import { RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { TabsScreenList } from '../../App';
import { Toast } from '../common/Toast';
import { FriendsIndex } from './FriendsIndex';

type Props = {
	route: RouteProp<TabsScreenList, 'Friends'>;
};

export type FriendsContainerScreenList = {
	Friends: { uid: string };
};
export function FriendsContainer(props: Props) {
	const Stack = createStackNavigator<FriendsContainerScreenList>();
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
			</Stack.Navigator>
			<Toast />
		</>
	);
}
