import { RouteProp } from '@react-navigation/native';
import { format, formatISO, startOfDay, startOfWeek } from 'date-fns';
import * as Crypto from 'expo-crypto';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { Title } from 'react-native-paper';
import {
	isEmpty,
	isLoaded,
	useFirestore,
	useFirestoreConnect,
} from 'react-redux-firebase';
import { WeekInput } from '../common/week-input/WeekInput';
import { useTypedSelector } from '../store';
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
	const [weekHash, setWeekHash] = useState('');

	if (!route.params.uid) {
		return <></>;
	}
	const uid = route.params.uid;
	const sunday = getSunday();
	const firestore = useFirestore();
	useEffect(() => {
		(async () => {
			const date = formatISO(sunday, {
				format: 'basic',
				representation: 'date',
			});
			const digest = await Crypto.digestStringAsync(
				Crypto.CryptoDigestAlgorithm.SHA256,
				`${uid}.${date}`
			);
			setWeekHash(digest);
		})();
	}, [uid]);

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
					weekHash={weekHash}
					onChange={onChange}
				/>
			</View>
		</ScrollView>
	);
}

function getSunday() {
	return startOfWeek(startOfDay(new Date()));
}

type Props = {
	sunday: Date;
	uid: string;
	weekHash: string;
	onChange: (id: string, name: keyof WeekPrice, price: string) => void;
};
function Week(props: Props) {
	const firestore = useFirestore();
	const collection = `${UsersCollection}/${props.uid}/${WeeksCollection}`;
	useFirestoreConnect([
		{ collection, doc: props.weekHash, storeAs: WeeksCollection },
	]);
	const weekPrices = useTypedSelector<WeekPrice[]>(
		({ firestore: { ordered } }) => ordered[WeeksCollection]
	);

	if (isEmpty(weekPrices)) {
		if (isLoaded(weekPrices)) {
			firestore.set(
				{ collection, doc: props.weekHash },
				{ ...new WeekPrice({ id: props.weekHash }) }
			);
		}
		return <></>;
	}

	const weekPrice = weekPrices[0];
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
