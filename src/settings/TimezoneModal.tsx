import timezones from 'compact-timezone-list';
import React, { useState } from 'react';
import { Dropdown } from 'react-native-material-dropdown';
import { Button, Dialog, Paragraph, Portal } from 'react-native-paper';

interface Props {
	visible: boolean;
	currentTimeZone: string | undefined;
	onHide: () => void;
	onSave: (timeZone: string) => void;
}

const timeZoneOptions = timezones.map(
	(tz: { label: string; tzCode: string }) => ({
		label: tz.label,
		value: tz.tzCode,
	})
);

export function TimeZoneModal(props: Props) {
	const [timeZone, setTimeZone] = useState(props.currentTimeZone || '');

	return (
		<Portal>
			<Dialog visible={props.visible} onDismiss={props.onHide}>
				<Dialog.Title>Set Island Timezone</Dialog.Title>
				<Dialog.Content>
					<Paragraph>
						Select the timezone your switch is set to. This is used
						to show your friends what your current turnip price is.
					</Paragraph>
					<Dropdown
						label="Time Zone"
						data={timeZoneOptions}
						value={props.currentTimeZone}
						onChangeText={(value) => setTimeZone(value)}
					/>
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={props.onHide}>Cancel</Button>
					<Button onPress={() => props.onSave(timeZone)}>Save</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}
