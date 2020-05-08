import { RouteProp } from '@react-navigation/native';
import { Linking } from 'expo';
import { zip } from 'lodash';
import React from 'react';
import { Dimensions, ScrollView } from 'react-native';
import {
	LineChart,
	LineChartData,
	LineChartProps,
} from 'react-native-chart-kit';
import { Button, Card, DataTable } from 'react-native-paper';
import { Pattern, PatternNames } from '../constants';
import { useTypedSelector } from '../store';
import { WeekPrice, WeeksCollection } from '../store/collections';
import { getProphetLink } from '../store/weeks/week-price.repository';
import { HomeNavigatorScreenList } from './HomeContainer';

type PredictionsProps = {
	route: RouteProp<HomeNavigatorScreenList, 'Predictions'>;
};
export function Predictions({}: PredictionsProps) {
	const weekPrices = useTypedSelector<WeekPrice[]>(
		({ firestore: { ordered } }) => ordered[WeeksCollection]
	);
	if (!weekPrices || !weekPrices[0]) {
		return <></>;
	}
	const weekPrice = new WeekPrice(weekPrices[0]);

	const url = getProphetLink(weekPrice);
	return (
		<ScrollView showsVerticalScrollIndicator={false} style={{ margin: 12 }}>
			<Card>
				<Card.Title title="Summary"></Card.Title>
				<Card.Content>
					<SummaryTable weekPrice={weekPrice} />
				</Card.Content>
			</Card>
			<Card style={{ marginTop: 12 }}>
				<Card.Title title="Your Week" />
				<Card.Content>
					<MinMaxChart weekPrice={weekPrice} />
				</Card.Content>
			</Card>
			<Button
				mode="contained"
				onPress={() => Linking.openURL(url)}
				style={{ marginTop: 12 }}
			>
				Visit TurnipProphet.io For More
			</Button>
		</ScrollView>
	);
}

function SummaryTable(props: { weekPrice: WeekPrice }) {
	const { weekPrice } = props;
	const minMax = weekPrice.getMinMax();

	const formatMax = (patternId: Pattern) => {
		const max = minMax[patternId].max;
		return max === -1 ? '-' : max;
	};

	const formatMin = (patternId: Pattern) => {
		const min = minMax[patternId].min;
		return min === -1 ? '-' : min;
	};

	return (
		<DataTable>
			<DataTable.Header>
				<DataTable.Title>Pattern</DataTable.Title>
				<DataTable.Title numeric>Likelihood</DataTable.Title>
				<DataTable.Title numeric>Min</DataTable.Title>
				<DataTable.Title numeric>Potential Max</DataTable.Title>
			</DataTable.Header>
			{weekPrice.predictions &&
				weekPrice.predictions
					.filter((p) => p.patternIdx >= 0)
					.map((p) => (
						<DataTable.Row>
							<DataTable.Cell>
								{PatternNames[p.patternIdx]}
							</DataTable.Cell>
							<DataTable.Cell numeric>
								{p.probability.toFixed(2)}%
							</DataTable.Cell>
							<DataTable.Cell numeric>
								{formatMin(p.patternIdx)}
							</DataTable.Cell>
							<DataTable.Cell numeric>
								{formatMax(p.patternIdx)}
							</DataTable.Cell>
						</DataTable.Row>
					))}
		</DataTable>
	);
}

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
function MinMaxChart(props: { weekPrice: WeekPrice }) {
	const { weekPrice } = props;

	const all = weekPrice.predictions.find(
		(p) => p.patternIdx === Pattern.Unknown
	);

	if (!all || !all.matches) {
		return <></>;
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
