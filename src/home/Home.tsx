import { RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Subheading, Text, TextInput, Title } from 'react-native-paper';
import { useFirestore } from 'react-redux-firebase';
import { getSunday, dateInWords } from '../common/utils';
import { WeekInput } from '../common/week-input/WeekInput';
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
				[name]: Number(price),
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
	return (
		<>
			<Title>Week of {dateInWords(props.sunday)}</Title>
			<View style={{ marginVertical: 15 }}>
				<Text style={{ marginBottom: 5 }}>
					What was the Purchase price of Turnips on your island this
					week?
				</Text>
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
			</View>
			<View>
				<Subheading>Sell Prices this week:</Subheading>
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
