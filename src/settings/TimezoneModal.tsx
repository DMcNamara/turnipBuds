import timezones from 'compact-timezone-list';
import React from 'react';
import { Dropdown } from 'react-native-material-dropdown';
import { Button, Dialog, Paragraph, Portal } from 'react-native-paper';

interface Props {
	visible: boolean;
	currentTimeZone: string | undefined;
	onHide: () => void;
	onSave: (timeZone: string) => void;
}

interface State {
	timeZone: string;
	timeZoneOptions: { label: string; value: string }[];
}

const initialState = {
	timeZone: '',
	timeZoneOptions: timezones.map((tz: { label: string; tzCode: string }) => ({
		label: tz.label,
		value: tz.tzCode,
	})),
};

export class TimeZoneModal extends React.PureComponent<Props, State> {
	constructor(props: Props) {
		super(props);

		this.state = {
			...initialState,
			timeZone: this.props.currentTimeZone || '',
		};
	}

	onHide = () => {
		this.setState({
			...initialState,
			timeZone: this.state.timeZone,
		});
		this.props.onHide();
	};

	onSave = (timeZone: string) => {
		this.setState({
			...initialState,
			timeZone: this.state.timeZone,
		});
		this.props.onSave(timeZone);
	};

	render() {
		return (
			<Portal>
				<Dialog visible={this.props.visible} onDismiss={this.onHide}>
					<Dialog.Title>Set Island Timezone</Dialog.Title>
					<Dialog.Content>
						<Paragraph>
							Select the timezone your switch is set to. This is
							used to show your friends what your current turnip
							price is.
						</Paragraph>
						<Dropdown
							label="Time Zone"
							data={this.state.timeZoneOptions}
							value={this.props.currentTimeZone}
							onChangeText={(timeZone) =>
								this.setState({ timeZone })
							}
						/>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={this.onHide}>Cancel</Button>
						<Button
							onPress={() => this.onSave(this.state.timeZone)}
						>
							Save
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		);
	}
}
