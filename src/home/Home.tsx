import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Dropdown } from 'react-native-material-dropdown';
import { Card, Subheading, TextInput, Title } from 'react-native-paper';
import { useFirestore } from 'react-redux-firebase';
import { BannerAd } from '../common/ads/BannerAd';
import { dateInWords, getSunday } from '../common/utils';
import { WeekInput } from '../common/week-input/WeekInput';
import { Pattern } from '../constants';
import { useTypedSelector } from '../store';
import {
	UsersCollection,
	WeekPrice,
	WeeksCollection,
} from '../store/collections';
import { HomeNavigatorScreenList } from './HomeContainer';

type HomeProps = {
	route: RouteProp<HomeNavigatorScreenList, 'Home'>;
};
export function Home({ route }: HomeProps) {
	const firestore = useFirestore();
	const weekPrices = useTypedSelector<WeekPrice[]>(
		({ firestore: { ordered } }) => ordered[ WeeksCollection ]
	);

	if (!route.params.uid) {
		return <></>;
	}
	const uid = route.params.uid;
	const sunday = getSunday();

	async function onChange(id: string, name: keyof WeekPrice, price: string) {
		if (name !== 'start') {
			const updates = {
				[ name ]: price === '' ? null : Number(price),
			};
			await firestore.update(
				{
					collection: `${UsersCollection}/${uid}/${WeeksCollection}`,
					doc: id,
				},
				updates
			);
		}
	}

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<View style={{ margin: 12 }}>
				<Week
					sunday={sunday}
					uid={uid}
					weekPrices={weekPrices}
					onChange={onChange}
				/>
			</View>
		</ScrollView>
	);
}

type Props = {
	sunday: Date;
	uid: string;
	weekPrices: WeekPrice[];
	onChange: (id: string, name: keyof WeekPrice, price: string) => void;
};
function Week(props: Props) {
	const weekPrice = { ...props.weekPrices[ 0 ] };

	const patternOptions = [
		{ label: 'Unknown', value: '' },
		{ label: 'Large Spike', value: Pattern.LargeSpike.toString() },
		{ label: 'Small Spike', value: Pattern.SmallSpike.toString() },
		{ label: 'Fluctuating', value: Pattern.Fluctuating.toString() },
		{ label: 'Decreasing', value: Pattern.Decreasing.toString() },
	];

	return (
		<>
			<Title>Week of {dateInWords(props.sunday)}</Title>
			<BannerAd />
			<Card style={styles.cardSpacing}>
				<Card.Content>
					<Subheading style={{ marginBottom: 5 }}>
						What was the Purchase Price of Turnips on your Island
						this Week?
					</Subheading>
					<TextInput
						label="Island Price"
						mode="outlined"
						value={
							weekPrice.islandBuyPrice
								? weekPrice.islandBuyPrice.toString()
								: undefined
						}
						onChangeText={(text) =>
							props.onChange(weekPrice.id, 'islandBuyPrice', text)
						}
						keyboardType="number-pad"
						maxLength={3}
						autoCompleteType="off"
						autoCorrect={false}
					/>
				</Card.Content>
			</Card>
			<Card style={styles.cardSpacing}>
				<Card.Title title="What was the Pattern Last Week?" />
				<Card.Content>
					<Dropdown
						label="Previous Week's Pattern"
						data={patternOptions}
						value={weekPrice.previousPattern?.toString()}
						onChangeText={(value) =>
							props.onChange(
								weekPrice.id,
								'previousPattern',
								value
							)
						}
					/>
				</Card.Content>
			</Card>
			<Card style={styles.cardSpacing}>
				<Card.Title title="Sell Prices this Week" />
				<Card.Content>
					<WeekInput
						weekPrices={weekPrice}
						onChange={(name, price) =>
							props.onChange(weekPrice.id, name, price)
						}
					/>
				</Card.Content>
			</Card>
		</>
	);
}

const styles = StyleSheet.create({
	cardSpacing: {
		marginTop: 12,
	},
});
