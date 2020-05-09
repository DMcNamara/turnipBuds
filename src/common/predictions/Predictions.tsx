import { RouteProp } from '@react-navigation/native';
import { Linking } from 'expo';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { RootState } from '../../store';
import { WeekPrice, WeeksCollection } from '../../store/collections';
import { getFriendsWeekPrice } from '../../store/selectors';
import { getProphetLink } from '../../store/weeks/week-price.repository';
import { CenteredActivityIndicator } from '../Loading';
import { MinMaxChart } from './MinMaxChart';
import { SummaryTable } from './SummaryTable';

type PredictionScreen = {
	Predictions: { weekHash: string };
};
type PredictionsProps = {
	route: RouteProp<PredictionScreen, 'Predictions'>;
};
interface PropsFromRedux {
	weekPrice: WeekPrice;
}
type Props = PropsFromRedux & PredictionsProps;
function Predictions({ weekPrice }: Props) {
	if (!weekPrice) {
		return <CenteredActivityIndicator />;
	}

	const url = getProphetLink(weekPrice);
	return (
		<ScrollView
			showsVerticalScrollIndicator={false}
			style={styles.container}
		>
			<Card>
				<Card.Title title="Summary"></Card.Title>
				<Card.Content>
					<SummaryTable weekPrice={weekPrice} />
				</Card.Content>
			</Card>
			<Card style={styles.spaceAbove}>
				<Card.Title title="Your Week" />
				<Card.Content>
					<MinMaxChart weekPrice={weekPrice} />
				</Card.Content>
			</Card>
			<Button
				mode="contained"
				onPress={() => Linking.openURL(url)}
				style={styles.spaceAbove}
			>
				Visit TurnipProphet.io For More
			</Button>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		margin: 12,
	},
	spaceAbove: {
		marginTop: 12,
	},
});

/**
 * HOME CONNECT
 */
const homeConnector = connect((state: RootState) => ({
	weekPrice: state.firestore.ordered[WeeksCollection]
		? new WeekPrice(state.firestore.ordered[WeeksCollection][0])
		: undefined,
	state: state,
}));
export const HomePredictions = compose<
	(props: PredictionsProps) => JSX.Element
>(homeConnector)(Predictions);

/**
 * FRIEND CONNECT
 */
const friendConnector = connect(
	(state: RootState, { route }: PredictionsProps) => ({
		weekPrice: getFriendsWeekPrice(state, route.params.weekHash),
	})
);
export const FriendPredictions = compose<
	(props: PredictionsProps) => JSX.Element
>(friendConnector)(Predictions);
