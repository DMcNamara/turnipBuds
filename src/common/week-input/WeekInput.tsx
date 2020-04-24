import React from 'react';
import { Text } from 'react-native';
import { Col, Grid, Row } from 'react-native-easy-grid';
import { TextInput } from 'react-native-paper';

export type WeekPrices = {
	start: Date;
	id: string;
	islandBuyPrice: number;
	monAM: number;
	monPM: number;
	tueAM: number;
	tuePM: number;
	wedAM: number;
	wedPM: number;
	thuAM: number;
	thuPM: number;
	friAM: number;
	friPM: number;
	satAM: number;
	satPM: number;
};

export function WeekInput(props: {
	weekPrices: WeekPrices;
	onChange: (name: keyof WeekPrices, price: string) => void;
}) {
	if (!props.weekPrices) {
		return <></>;
	}
	return (
		<Grid>
			<Row>
				<Col></Col>
				<Col>
					<Text>AM</Text>
				</Col>
				<Col>
					<Text>PM</Text>
				</Col>
			</Row>
			<Row>
				<Col>
					<Text>Monday</Text>
				</Col>
				<Col>
					<HalfDayInput
						name='monAM'
						value={props.weekPrices.monAM}
						onChange={props.onChange}
					/>
				</Col>
				<Col>
					<HalfDayInput
						name='monPM'
						value={props.weekPrices.monPM}
						onChange={props.onChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col>
					<Text>Tuesday</Text>
				</Col>
				<Col>
					<HalfDayInput
						name='tueAM'
						value={props.weekPrices.tueAM}
						onChange={props.onChange}
					/>
				</Col>
				<Col>
					<HalfDayInput
						name='tuePM'
						value={props.weekPrices.tuePM}
						onChange={props.onChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col>
					<Text>Wednesday</Text>
				</Col>
				<Col>
					<HalfDayInput
						name='wedAM'
						value={props.weekPrices.wedAM}
						onChange={props.onChange}
					/>
				</Col>
				<Col>
					<HalfDayInput
						name='wedPM'
						value={props.weekPrices.wedPM}
						onChange={props.onChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col>
					<Text>Thursday</Text>
				</Col>
				<Col>
					<HalfDayInput
						name='thuAM'
						value={props.weekPrices.thuAM}
						onChange={props.onChange}
					/>
				</Col>
				<Col>
					<HalfDayInput
						name='thuPM'
						value={props.weekPrices.thuPM}
						onChange={props.onChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col>
					<Text>Friday</Text>
				</Col>
				<Col>
					<HalfDayInput
						name='friAM'
						value={props.weekPrices.friAM}
						onChange={props.onChange}
					/>
				</Col>
				<Col>
					<HalfDayInput
						name='friPM'
						value={props.weekPrices.friPM}
						onChange={props.onChange}
					/>
				</Col>
			</Row>
			<Row>
				<Col>
					<Text>Friday</Text>
				</Col>
				<Col>
					<HalfDayInput
						name='satAM'
						value={props.weekPrices.satAM}
						onChange={props.onChange}
					/>
				</Col>
				<Col>
					<HalfDayInput
						name='satPM'
						value={props.weekPrices.satPM}
						onChange={props.onChange}
					/>
				</Col>
			</Row>
		</Grid>
	);
}

function HalfDayInput(props: {
	name: keyof WeekPrices;
	value: number;
	onChange: (name: keyof WeekPrices, text: string) => void;
}) {
	return (
		<TextInput
			label=''
			value={props.value.toString()}
			mode='outlined'
			dense
			onChangeText={(text) => props.onChange(props.name, text)}
		/>
	);
}
