import { RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useSelector } from 'react-redux';
import { useFirestore, useFirestoreConnect } from 'react-redux-firebase';
import { WeekInput, WeekPrices } from '../common/week-input/WeekInput';

type HomeContainerParamList = {
	Home: { uid: string };
};

export function HomeContainer({ route }: any) {
	const Stack = createStackNavigator<HomeContainerParamList>();

	return (
		<Stack.Navigator>
			<Stack.Screen
				name="Home"
				component={Home}
				initialParams={{ uid: route.params.uid }}
			/>
		</Stack.Navigator>
	);
}

type HomeScreenRouteProp = RouteProp<HomeContainerParamList, 'Home'>;
type Props = {
	route: HomeScreenRouteProp;
};
function Home({ route }: Props) {
	if (!route.params.uid) {
		return <></>;
	}
	const uid = route.params.uid;
	const firestore = useFirestore();
	useFirestoreConnect([{ collection: 'weeks', where: [['uid', '==', uid]] }]);
	const weekPrice = useSelector<any, WeekPrices>(
		({ firestore: { ordered } }) => ordered.weeks && ordered.weeks[0]
	);

	async function onChange(name: keyof WeekPrices, price: string) {
		if (name !== 'start') {
			const updates = {
				[name]: Number(price),
			};
			await firestore.update(
				{ collection: 'weeks', doc: weekPrice.id },
				updates
			);
		}
	}

	return (
		<ScrollView showsVerticalScrollIndicator={false}>
			<View>
				<Text>Home Screen</Text>
				<WeekInput weekPrices={weekPrice} onChange={onChange} />
			</View>
		</ScrollView>
	);
}
