import React, { useState } from 'react';
import {
	Button,
	Dialog,
	Paragraph,
	Portal,
	TextInput,
} from 'react-native-paper';

interface Props {
	visible: boolean;
	onHide: () => void;
	onSave: (email: string) => void;
}

export function AddFriendModal({ visible, onHide, onSave }: Props) {
	const [email, setEmail] = useState('');

	const handleHide = () => {
		setEmail('');
		onHide();
	};

	const handleSave = (value: string) => {
		setEmail('');
		onSave(value);
	};

	return (
		<Portal>
			<Dialog visible={visible} onDismiss={handleHide}>
				<Dialog.Title>Add Friend</Dialog.Title>
				<Dialog.Content>
					<Paragraph>
						To add a friend, simply enter their email below and
						press save
					</Paragraph>
					<TextInput
						label="Email"
						value={email}
						onChangeText={(text) => setEmail(text)}
						autoCapitalize="none"
						autoCompleteType="email"
						autoFocus
						keyboardType="email-address"
						textContentType="emailAddress"
					/>
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={handleHide}>Cancel</Button>
					<Button onPress={() => handleSave(email)}>Save</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}
