import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { firestoreConnect } from 'react-redux-firebase';
import { compose } from 'redux';
import { FriendsCollection, UsersCollection } from '../../store/collections';
import { TabTheme } from '../../theme';
import { FriendsContainerScreenList } from '../FriendsContainer';
import { FriendRequestIndex } from './FriendRequestsIndex';
import { FriendsIndex } from './FriendsIndex';

export type FriendsIndexContainerProps = {
	route: RouteProp<FriendsContainerScreenList, 'Friends'>;
	navigation: StackNavigationProp<FriendsContainerScreenList, 'Friends'>;
};

export type FriendsIndexContainerScreenList = {
	Friends: {};
	Requests: {};
};
const Tab = createMaterialTopTabNavigator<FriendsIndexContainerScreenList>();
function Container(props: FriendsIndexContainerProps) {
	return (
		<Tab.Navigator tabBarOptions={TabTheme}>
			<Tab.Screen name="Friends" component={FriendsIndex} />
			<Tab.Screen name="Requests" component={FriendRequestIndex} />
		</Tab.Navigator>
	);
}

/**
 * CONNECT
 */
const populates = [{ child: 'friend', root: UsersCollection }];
const fsConnect = firestoreConnect((props: FriendsIndexContainerProps) => [
	{
		collection: FriendsCollection,
		populates,
		where: ['uid', '==', props.route.params.uid],
	},
]);

export const FriendsIndexContainer = compose<typeof Container>(fsConnect)(
	Container
);
