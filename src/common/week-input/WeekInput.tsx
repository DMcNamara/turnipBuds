import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
import { WeekPrice } from '../../store/collections';

export function WeekInput(props: {
	weekPrices: WeekPrice;
	onChange: (name: keyof WeekPrice, price: string) => void;
}) {
	if (!props.weekPrices) {
		return <></>;
	}
	return (
		<View style={{display: 'flex'}}>
			<View style={styles.row}>
				<View style={styles.col}></View>
				<View style={styles.col}>
					<Text>AM</Text>
				</View>
				<View style={styles.col}>
					<Text>PM</Text>
				</View>
			</View>
			<View style={styles.row}>
				<View style={styles.col}>
					<Text>Monday</Text>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="monAM"
						value={props.weekPrices.monAM}
						onChange={props.onChange}
					/>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="monPM"
						value={props.weekPrices.monPM}
						onChange={props.onChange}
					/>
				</View>
			</View>
			<View style={styles.row}>
				<View style={styles.col}>
					<Text>Tuesday</Text>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="tueAM"
						value={props.weekPrices.tueAM}
						onChange={props.onChange}
					/>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="tuePM"
						value={props.weekPrices.tuePM}
						onChange={props.onChange}
					/>
				</View>
			</View>
			<View style={styles.row}>
				<View style={styles.col}>
					<Text>Wednesday</Text>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="wedAM"
						value={props.weekPrices.wedAM}
						onChange={props.onChange}
					/>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="wedPM"
						value={props.weekPrices.wedPM}
						onChange={props.onChange}
					/>
				</View>
			</View>
			<View style={styles.row}>
				<View style={styles.col}>
					<Text>Thursday</Text>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="thuAM"
						value={props.weekPrices.thuAM}
						onChange={props.onChange}
					/>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="thuPM"
						value={props.weekPrices.thuPM}
						onChange={props.onChange}
					/>
				</View>
			</View>
			<View style={styles.row}>
				<View style={styles.col}>
					<Text>Friday</Text>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="friAM"
						value={props.weekPrices.friAM}
						onChange={props.onChange}
					/>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="friPM"
						value={props.weekPrices.friPM}
						onChange={props.onChange}
					/>
				</View>
			</View>
			<View style={styles.row}>
				<View style={styles.col}>
					<Text>Saturday</Text>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="satAM"
						value={props.weekPrices.satAM}
						onChange={props.onChange}
					/>
				</View>
				<View style={styles.col}>
					<HalfDayInput
						name="satPM"
						value={props.weekPrices.satPM}
						onChange={props.onChange}
					/>
				</View>
			</View>
		</View>
	);
}

function HalfDayInput(props: {
	name: keyof WeekPrice;
	value: number | null;
	onChange: (name: keyof WeekPrice, text: string) => void;
}) {
	return (
		<TextInput
			label=""
			value={props.value ? props.value.toString() : undefined}
			mode="outlined"
			dense
			onChangeText={(text) => props.onChange(props.name, text)}
		/>
	);
}

const styles = StyleSheet.create({
	row: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'center'
	},
	col: {
		width: '24%'
	}
});
