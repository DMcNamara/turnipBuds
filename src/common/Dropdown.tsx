import React, { useState } from 'react';
import { View } from 'react-native';
import { Menu, TextInput, TouchableRipple } from 'react-native-paper';

export interface DropdownOption {
	label: string;
	value: string;
}

/**
 * Paper `Menu`-backed replacement for the dead `react-native-material-dropdown`.
 *
 * Presents a read-only text field that opens a Menu of options on press,
 * preserving the old `data` / `value` / `onChangeText`-style contract (a single
 * string value out via `onChange`).
 */
export function Dropdown(props: {
	label: string;
	data: DropdownOption[];
	value?: string;
	onChange: (value: string) => void;
	testID?: string;
}) {
	const [visible, setVisible] = useState(false);
	const selected = props.data.find((option) => option.value === props.value);

	const onSelect = (value: string) => {
		setVisible(false);
		props.onChange(value);
	};

	return (
		<Menu
			visible={visible}
			onDismiss={() => setVisible(false)}
			anchor={
				<TouchableRipple
					testID={props.testID}
					onPress={() => setVisible(true)}
				>
					<View pointerEvents="none">
						<TextInput
							label={props.label}
							value={selected ? selected.label : ''}
							editable={false}
							right={<TextInput.Icon icon="menu-down" />}
						/>
					</View>
				</TouchableRipple>
			}
		>
			{props.data.map((option) => (
				<Menu.Item
					key={option.value}
					title={option.label}
					onPress={() => onSelect(option.value)}
				/>
			))}
		</Menu>
	);
}
