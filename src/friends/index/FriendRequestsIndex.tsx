import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Paragraph, Text, Title } from 'react-native-paper';
import { connect, ConnectedProps } from 'react-redux';
import { ExtendedFirebaseInstance } from 'react-redux-firebase';
import { PlusButton } from '../../common/PlusButton';
import { RootState } from '../../store';
import { FriendsCollection } from '../../store/collections';
import { getAllFriendsEmails, getFriendRequestss } from '../../store/selectors';
import { AddFriendModal } from '../add-friends-modal/AddFriendModal';
import { addFriend } from '../add-friends-modal/AddFriends.service';
import { FriendsContainerScreenList } from '../FriendsContainer';
import { FriendsIndexContainerScreenList } from './FriendsIndexContainer';

type FriendRequestsIndexNavigationProp = CompositeNavigationProp<
	MaterialTopTabNavigationProp<FriendsIndexContainerScreenList, 'Requests'>,
	StackNavigationProp<FriendsContainerScreenList>
>;

type FriendRequestsIndexProps = {
	route: RouteProp<FriendsIndexContainerScreenList, 'Requests'>;
	navigation: FriendRequestsIndexNavigationProp;
};

type Props = FriendRequestsIndexProps & PropsFromRedux;
function Component(props: Props) {
	const [addModalVisible, setAddModalVisibile] = useState(false);

	const onHide = () => setAddModalVisibile(false);
	const onSave = (email: string) => {
		setAddModalVisibile(false);
		addFriend(email, props.emails, props.dispatch);
	};
	const onShowAddModal = () => setAddModalVisibile(true);

	return (
		<View style={{ flex: 1, margin: 12 }}>
			<Title>Future Friends</Title>
			<Paragraph>
				These friends either haven't accepted your request or haven't
				joined up yet
			</Paragraph>
			<FlatList
				style={{ marginTop: 12 }}
				data={props.friends}
				renderItem={({ item }) => <Text>{item.email}</Text>}
				keyExtractor={(item) => item.email}
			/>
			<PlusButton onPress={onShowAddModal} />
			<AddFriendModal
				visible={addModalVisible}
				onHide={onHide}
				onSave={onSave}
			/>
		</View>
	);
}

/**
 * CONNECT
 */
const connector = connect((state: RootState) => ({
	[FriendsCollection]: getFriendRequestss(state),
	emails: getAllFriendsEmails(state),
}));
interface PropsFromRedux extends ConnectedProps<typeof connector> {
	firebase: ExtendedFirebaseInstance;
}

export const FriendRequestIndex = connector(Component);
