import { RouteProp } from '@react-navigation/native';
import { Linking } from 'expo';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Card } from 'react-native-paper';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { RootState } from '../../store';
import {
	FriendsWeekCollection,
	WeekPrice,
	WeeksCollection,
} from '../../store/collections';
import { getProphetLink } from '../../store/weeks/week-price.repository';
import { CenteredActivityIndicator } from '../Loading';
import { MinMaxChart } from './MinMaxChart';
import { SummaryTable } from './SummaryTable';

type PredictionsProps = {
	route: RouteProp<any, ''>;
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
const friendConnector = connect((state: RootState) => ({
	weekPrice: state.firestore.data[FriendsWeekCollection]
		? new WeekPrice(state.firestore.data[FriendsWeekCollection])
		: undefined,
	state: state,
}));
export const FriendPredictions = compose<
	(props: PredictionsProps) => JSX.Element
>(friendConnector)(Predictions);
