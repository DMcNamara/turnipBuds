import { RouteProp } from '@react-navigation/native';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB } from 'react-native-paper';
import { connect, ConnectedProps } from 'react-redux';
import { firestoreConnect, populate } from 'react-redux-firebase';
import { compose } from 'redux';
import { RootState } from '../store';
import {
	Friend,
	FriendsCollection,
	UsersCollection,
} from '../store/collections';
import { AddFriendModal } from './add-friends-modal/AddFriendModal';
import { FriendCard } from './FriendCard';
import { FriendsContainerScreenList } from './FriendsContainer';

export type FriendsIndexProps = {
	route: RouteProp<FriendsContainerScreenList, 'Friends'>;
};

type Props = FriendsIndexProps & PropsFromRedux;
export function Component(props: Props) {
	const [addModalVisible, setAddModalVisibile] = useState(false);

	const friends = props.friends ? Object.values(props.friends) : [];
	const onHide = () => {
		setAddModalVisibile(false);
	};

	const onSave = (email: string) => {
		setAddModalVisibile(false);
		console.log(email);
	};

	return (
		<View style={{ flex: 1, margin: 15 }}>
			<FlatList
				data={friends}
				renderItem={({ item: { friend } }) => (
					<FriendCard friend={friend} />
				)}
				keyExtractor={(item) => item.friend.id}
			/>
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
const connector = connect((state: RootState, props) => ({
	[FriendsCollection]: populate(
		state.firestore,
		FriendsCollection,
		populates
	) as { [id: string]: Friend },
}));

type PropsFromRedux = ConnectedProps<typeof connector>;

export const FriendsIndex = compose<typeof Component>(
	fsConnect,
	connector
)(Component);
