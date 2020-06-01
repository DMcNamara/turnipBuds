import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Caption, Card, Subheading } from 'react-native-paper';
import { dateInISO, getSunday } from '../common/utils';
import { PatternNames } from '../constants';
import { User } from '../store/collections';
import { getMinMax } from '../store/weeks/week-price.repository';

export function FriendCard(props: {
	friend: User;
	onPress: (user: User) => void;
}) {
	const start = dateInISO(getSunday());
	const price = props.friend.price;
	let max: number | null = null;
	if (price && price.likeliestPattern?.matches) {
		const matches = JSON.parse(price.likeliestPattern?.matches);
		const minMax = getMinMax({ ...price.likeliestPattern, matches });
		max = minMax.max;
	}

	return (
		<Card onPress={() => props.onPress(props.friend)} style={styles.margin}>
			<Card.Title
				title={props.friend.displayName}
				left={() => (
					<Avatar.Image
						size={24}
						source={{ uri: props.friend.avatarUrl }}
					/>
				)}
			/>
			<Card.Content>
				{price?.start === start && (
					<View style={styles.container}>
						<View style={styles.row}>
							<Caption style={styles.col}>Pattern</Caption>
							<Caption style={styles.col}>Probability</Caption>
							<Caption style={styles.col}>Potential Max</Caption>
						</View>
						<View style={styles.row}>
							<Subheading style={styles.col}>
								{
									PatternNames[
										price.likeliestPattern.patternIdx
									]
								}
							</Subheading>
							<Subheading style={styles.col}>
								{price.likeliestPattern.probability.toFixed(2)}%
							</Subheading>
							<Subheading style={styles.col}>{max}</Subheading>
						</View>
					</View>
				)}
				{price?.start !== start && (
					<View>
						<Subheading style={styles.center}>
							No Data for this Week Yet
						</Subheading>
					</View>
				)}
			</Card.Content>
		</Card>
	);
}

const styles = StyleSheet.create({
	center: {
		textAlign: 'center',
	},
	col: {
		textAlign: 'center',
		width: '32%',
	},
	container: {
		flex: 1,
	},
	margin: {
		marginTop: 12,
	},
	row: {
		flex: 1,
		flexDirection: 'row',
	},
});
