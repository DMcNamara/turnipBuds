import { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Paragraph, Text, Title } from 'react-native-paper';
import { connect, ConnectedProps } from 'react-redux';
import {
	ExtendedFirebaseInstance,
	firestoreConnect,
	populate,
} from 'react-redux-firebase';
import { compose } from 'redux';
import { Functions, RootState } from '../store';
import {
	Friend,
	FriendsCollection,
	UsersCollection,
} from '../store/collections';
import { toastAction } from '../store/toast/toast.actions';
import { AddFriendModal } from './add-friends-modal/AddFriendModal';
import { FriendCard } from './FriendCard';
import { FriendsContainerScreenList } from './FriendsContainer';

export type FriendsIndexProps = {
	route: RouteProp<FriendsContainerScreenList, 'Friends'>;
};

type Props = FriendsIndexProps & PropsFromRedux;
function Component(props: Props) {
	const [addModalVisible, setAddModalVisibile] = useState(false);

	const allFriends = Object.values(props.friends || {});
	const friends = props.friends
		? allFriends.filter((f) => f.friend.id)
		: [];
	const futureFriends = props.friends
		? allFriends.filter((f) => !f.friend.id)
		: [];
	const friendEmails = allFriends.map((f) => f.email);

	const onHide = () => {
		setAddModalVisibile(false);
	};

	const onSave = (email: string) => {
		setAddModalVisibile(false);
		if (friendEmails.includes(email)) {
			props.dispatch(toastAction("You've already added this friend"));
			return;
		}

		Functions.addFriend({ email })
			.then(() => props.dispatch(toastAction('Friend Added')))
			.catch((err) => props.dispatch(toastAction(err.message)));
	};

	return (
		<View style={{ flex: 1, margin: 15 }}>
			<Title>Friends</Title>
			<FlatList
				data={friends}
				renderItem={({ item: { friend } }) => (
					<FriendCard friend={friend} />
				)}
				keyExtractor={(item) => item.friend.id}
			/>
			{!!futureFriends.length && (
				<>
					<Title>Future Friends</Title>
					<Paragraph>
						These friends either haven't accpted your request or
						haven't joined up yet
					</Paragraph>
					<FlatList
						style={{marginTop: 15}}
						data={futureFriends}
						renderItem={({ item }) => <Text>{item.email}</Text>}
						keyExtractor={(item) => item.email}
					/>
				</>
			)}
			<FAB
				style={styles.fab}
				icon="plus"
				onPress={() => setAddModalVisibile(true)}
			/>
			<AddFriendModal
				visible={addModalVisible}
				onHide={onHide}
				onSave={onSave}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	fab: {
		position: 'absolute',
		margin: 16,
		right: 0,
		bottom: 0,
	},
});

// CONNECT
const populates = [{ child: 'friend', root: UsersCollection }];
const fsConnect = firestoreConnect((props: FriendsIndexProps) => [
	{
		collection: FriendsCollection,
		populates,
		where: ['uid', '==', props.route.params.uid],
	},
]);
const connector = connect((state: RootState) => ({
	[FriendsCollection]: populate(
		state.firestore,
		FriendsCollection,
		populates
	) as { [id: string]: Friend },
}));

interface PropsFromRedux extends ConnectedProps<typeof connector> {
	firebase: ExtendedFirebaseInstance;
}

export const FriendsIndex = compose<typeof Component>(
	fsConnect,
	connector
)(Component);
