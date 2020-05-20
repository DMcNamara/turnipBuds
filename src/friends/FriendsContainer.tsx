import { RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { TabsScreenList } from '../../App';
import { SortButton } from '../common/SortButton';
import { Toast } from '../common/Toast';
import { User } from '../store/collections';
import { sortFriendsAction } from '../store/friends/friend-index.actions';
import { FriendSortOptions } from '../store/friends/friends.repo';
import { HeaderTheme } from '../theme';
import { FriendsIndexContainer } from './index/FriendsIndexContainer';
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

	const sortButton = () => (
		<SortButton sorts={FriendSortOptions} action={sortFriendsAction} />
	);

	return (
		<>
			<Stack.Navigator
				screenOptions={{
					...HeaderTheme,
				}}
			>
				<Stack.Screen
					name="Friends"
					component={FriendsIndexContainer}
					initialParams={{ uid: props.route.params.uid }}
					options={{
						headerRight: sortButton,
					}}
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
