import { zip } from 'lodash';
import React from 'react';
import { Dimensions, StyleSheet } from 'react-native';
import {
	LineChart,
	LineChartData,
	LineChartProps,
} from 'react-native-chart-kit';
import { Text } from 'react-native-paper';
import { Pattern } from '../../constants';
import { WeekPrice } from '../../store/collections';

const labels = [
	'Sunday',
	'Mon AM',
	'Mon PM',
	'Tue AM',
	'Tue PM',
	'Wed AM',
	'Wed PM',
	'Thur AM',
	'Thur PM',
	'Fri AM',
	'Fri PM',
	'Sat AM',
	'Sat PM',
];
export function MinMaxChart(props: { weekPrice: WeekPrice }) {
	const { weekPrice } = props;

	const all = weekPrice.predictions.find(
		(p) => p.patternIdx === Pattern.Unknown
	);

	if (!all || !all.matches || !all.matches[0]) {
		return (
			<Text style={styles.centered}>
				Oh no! It looks like we couldn't find a pattern match. Please
				check your inputs.
			</Text>
		);
	}

	const matches = all.matches;
	const [min, max] = zip(...matches[0].slice(1)) as [number[], number[]];

	if (!min || !min.length || !max || !max.length) {
		return <></>;
	}

	const data: LineChartData = {
		labels,
		datasets: [
			{
				data: min,
			},
			{ data: max },
		],
	};

	const chartProps: LineChartProps = {
		data,
		width: Dimensions.get('window').width - 15,
		height: 325,
		verticalLabelRotation: 75,
		transparent: true,
		chartConfig: {
			decimalPlaces: 0,
			color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
		},
	};

	return <LineChart {...chartProps} bezier />;
}

const styles = StyleSheet.create({
	centered: {
		textAlign: 'center',
	},
});
