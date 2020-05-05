import React from 'react';
import { Avatar, Card } from 'react-native-paper';
import { User } from '../store/collections';

export function FriendCard(props: {
	friend: User;
	onPress: (user: User) => void;
}) {
	return (
		<Card onPress={() => props.onPress(props.friend)}>
			<Card.Title
				title={props.friend.displayName}
				left={() => (
					<Avatar.Image
						size={24}
						source={{ uri: props.friend.avatarUrl }}
					/>
				)}
			/>
			<Card.Content>
				{/* <Text>{JSON.stringify(props.friend, null, 2)}</Text> */}
			</Card.Content>
		</Card>
	);
}
