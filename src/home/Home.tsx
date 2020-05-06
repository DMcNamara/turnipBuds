import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Dropdown } from 'react-native-material-dropdown';
import { Subheading, Text, TextInput, Title } from 'react-native-paper';
import { useFirestore } from 'react-redux-firebase';
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
	if (!route.params.uid) {
		return <></>;
	}
	const uid = route.params.uid;
	const sunday = getSunday();
	const firestore = useFirestore();
	const weekPrices = useTypedSelector<WeekPrice[]>(
		({ firestore: { ordered } }) => ordered[WeeksCollection]
	);

	async function onChange(id: string, name: keyof WeekPrice, price: string) {
		if (name !== 'start') {
			const updates = {
				[name]: price === '' ? null : Number(price),
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
			<View style={{ margin: 15 }}>
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
	const weekPrice = { ...props.weekPrices[0] };

	const patternOptions = [
		{ label: 'Unknown', value: '' },
		{ label: 'Large Spike', value: Pattern.LargeSpike.toString() },
		{ label: 'Decreasing', value: Pattern.Decreasing.toString() },
		{ label: 'Small Spike', value: Pattern.SmallSpike.toString() },
	];

	return (
		<>
			<Title>Week of {dateInWords(props.sunday)}</Title>
			<View style={{ marginVertical: 15 }}>
				<Subheading style={{ marginBottom: 5 }}>
					What was the Purchase Price of Turnips on your Island this
					Week?
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
				/>
				<Subheading style={{ marginTop: 15 }}>
					What was the Price Pattern for Last Week?
				</Subheading>
				<Dropdown
					label="Previous Week's Pattern"
					data={patternOptions}
					value={weekPrice.previousPattern?.toString()}
					onChangeText={(value) =>
						props.onChange(weekPrice.id, 'previousPattern', value)
					}
				/>
			</View>
			<View>
				<Subheading>Sell Prices this Week:</Subheading>
				<WeekInput
					weekPrices={weekPrice}
					onChange={(name, price) =>
						props.onChange(weekPrice.id, name, price)
					}
				/>
			</View>
		</>
	);
}
