import { RouteProp } from '@react-navigation/native';
import { format } from 'date-fns';
import React from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Title } from 'react-native-paper';
import { useFirestore } from 'react-redux-firebase';
import { getSunday } from '../common/utils';
import { WeekInput } from '../common/week-input/WeekInput';
import {
	UsersCollection,
	WeekPrice,
	WeeksCollection,
} from '../store/collections';
import { HomeContainerScreenList } from './HomeContainer';

type HomeProps = {
	route: RouteProp<HomeContainerScreenList, 'Home'>;
};
export function Home({ route }: HomeProps) {
	if (!route.params.uid) {
		return <></>;
	}
	const uid = route.params.uid;
	const sunday = getSunday();
	const firestore = useFirestore();

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
					weekHash={route.params.weekHash}
					weekPrices={route.params.weeks}
					onChange={onChange}
				/>
			</View>
		</ScrollView>
	);
}

type Props = {
	sunday: Date;
	uid: string;
	weekHash: string;
	weekPrices: WeekPrice[];
	onChange: (id: string, name: keyof WeekPrice, price: string) => void;
};
function Week(props: Props) {
	const weekPrice = props.weekPrices[0];
	return (
		<>
			<Title>Week of {format(props.sunday, 'LLLL do yyyy')}</Title>
			<WeekInput
				weekPrices={weekPrice}
				onChange={(name, price) =>
					props.onChange(weekPrice.id, name, price)
				}
			/>
		</>
	);
}
