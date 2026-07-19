import { render } from '@testing-library/react-native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { PriceAnalysis, WeekPrice } from '../../store/collections';
import { SummaryTable } from './SummaryTable';

const possibility = (min: number, max: number) => [
	[
		[90, 90],
		[90, 90],
		[min, max],
	],
];

/**
 * SummaryTable indexes its min/max array by `patternIdx` (a known quirk), so
 * the fixture supplies predictions for pattern indexes 0..3 in ascending order
 * to keep those indexes aligned with the array positions.
 */
const predictions = [
	{
		patternIdx: 0, // Fluctuating
		patternName: 'Fluctuating',
		matches: JSON.stringify(possibility(100, 150)),
		probability: 10,
		probabilityPerMatch: 0,
	},
	{
		patternIdx: 1, // Large Spike
		patternName: 'Large Spike',
		matches: JSON.stringify(possibility(150, 200)),
		probability: 55.5,
		probabilityPerMatch: 0,
	},
	{
		patternIdx: 2, // Decreasing -> no matches -> renders '-'
		patternName: 'Decreasing',
		matches: '[]',
		probability: 5,
		probabilityPerMatch: 0,
	},
	{
		patternIdx: 3, // Small Spike
		patternName: 'Small Spike',
		matches: JSON.stringify(possibility(120, 180)),
		probability: 29.5,
		probabilityPerMatch: 0,
	},
];

function renderTable() {
	const weekPrice = new WeekPrice({
		predictions: (predictions as unknown) as PriceAnalysis,
	});
	return render(
		<PaperProvider>
			<SummaryTable weekPrice={weekPrice} />
		</PaperProvider>
	);
}

describe('SummaryTable', () => {
	it('renders a row per pattern with its label', () => {
		const utils = renderTable();
		expect(utils.getByText('Fluctuating')).toBeTruthy();
		expect(utils.getByText('Large Spike')).toBeTruthy();
		expect(utils.getByText('Decreasing')).toBeTruthy();
		expect(utils.getByText('Small Spike')).toBeTruthy();
	});

	it('renders probabilities formatted to two decimal places', () => {
		const utils = renderTable();
		expect(utils.getByText('55.50%')).toBeTruthy();
		expect(utils.getByText('10.00%')).toBeTruthy();
		expect(utils.getByText('29.50%')).toBeTruthy();
	});

	it('renders the potential max for a pattern with matches', () => {
		const utils = renderTable();
		expect(utils.getByText('200')).toBeTruthy();
		expect(utils.getByText('180')).toBeTruthy();
	});

	it("renders '-' for min and max when a pattern has no matches", () => {
		const utils = renderTable();
		// Decreasing has no matches -> both its Min and Potential Max cells show '-'.
		expect(utils.getAllByText('-').length).toBe(2);
	});
});
