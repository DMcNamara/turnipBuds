import React from 'react';
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

interface State {
	email: string;
}

const initialState = {
	email: '',
};

export class AddFriendModal extends React.PureComponent<Props, State> {
	state = { ...initialState };

	onHide = () => {
		this.setState({ ...initialState });
		this.props.onHide();
	};

	onSave = (email: string) => {
		this.setState({ ...initialState });
		this.props.onSave(email);
	};

	render() {
		return (
			<Portal>
				<Dialog visible={this.props.visible} onDismiss={this.onHide}>
					<Dialog.Title>Add Friend</Dialog.Title>
					<Dialog.Content>
						<Paragraph>
							To add a friend, simply enter their email below and
							press save
						</Paragraph>
						<TextInput
							label="Email"
							value={this.state.email}
							onChangeText={(email) => this.setState({ email })}
							autoCapitalize="none"
							autoCompleteType="email"
							autoFocus
							keyboardType="email-address"
							textContentType="emailAddress"
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={this.onHide}>Cancel</Button>
						<Button onPress={() => this.onSave(this.state.email)}>
							Save
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		);
	}
}
