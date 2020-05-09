import React from 'react';
import { DataTable } from 'react-native-paper';
import { Pattern, PatternNames } from '../../constants';
import { WeekPrice } from '../../store/collections';

export function SummaryTable(props: { weekPrice: WeekPrice }) {
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
						<DataTable.Row key={p.patternIdx}>
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
