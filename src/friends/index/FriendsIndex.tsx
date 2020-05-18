import { MaterialTopTabNavigationProp } from '@react-navigation/material-top-tabs';
import { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useState } from 'react';
import { FlatList, View } from 'react-native';
import { connect, ConnectedProps } from 'react-redux';
import { ExtendedFirebaseInstance } from 'react-redux-firebase';
import { BannerAd } from '../../common/ads/BannerAd';
import { PlusButton } from '../../common/PlusButton';
import { RootState } from '../../store';
import { FriendsCollection, User } from '../../store/collections';
import { getAllFriendsEmails, getExistingFriends } from '../../store/selectors';
import { AddFriendModal } from '../add-friends-modal/AddFriendModal';
import { addFriend } from '../add-friends-modal/AddFriends.service';
import { FriendCard } from '../FriendCard';
import { FriendsContainerScreenList } from '../FriendsContainer';
import { FriendsIndexContainerScreenList } from './FriendsIndexContainer';

type FriendsIndexNavigationProp = CompositeNavigationProp<
	MaterialTopTabNavigationProp<FriendsIndexContainerScreenList, 'Friends'>,
	StackNavigationProp<FriendsContainerScreenList>
>;
export type FriendsIndexProps = {
	route: RouteProp<FriendsIndexContainerScreenList, 'Friends'>;
	navigation: FriendsIndexNavigationProp;
};
type Props = FriendsIndexProps & PropsFromRedux;
function Component(props: Props) {
	const [addModalVisible, setAddModalVisibile] = useState(false);

	const onHide = () => setAddModalVisibile(false);

	const onPress = (friend: User) => {
		props.navigation.navigate('FriendView', {
			user: friend,
		});
	};

	const onSave = (email: string) => {
		setAddModalVisibile(false);
		addFriend(email, props.emails, props.dispatch);
	};

	const onShowAddModal = () => setAddModalVisibile(true);

	return (
		<View style={{ flex: 1, margin: 12 }}>
			<BannerAd />
			<FlatList
				contentContainerStyle={{ paddingBottom: 75 }} // so the plus button doesn't cover the last item
				data={props.friends}
				renderItem={({ item: { friend } }) => (
					<FriendCard friend={friend} onPress={onPress} />
				)}
				keyExtractor={(item) => item.friend.id}
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
	[FriendsCollection]: getExistingFriends(state),
	emails: getAllFriendsEmails(state),
}));

interface PropsFromRedux extends ConnectedProps<typeof connector> {
	firebase: ExtendedFirebaseInstance;
}

export const FriendsIndex = connector(Component);
