import { RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useFirestore, useFirestoreConnect } from 'react-redux-firebase';
import { TabsScreenList } from '../../App';
import { WeekInput, WeekPrices } from '../common/week-input/WeekInput';
import { useTypedSelector } from '../store';

type Props = {
	route: RouteProp<TabsScreenList, 'Me'>;
};

type HomeContainerScreenList = {
	Home: { uid: string };
};
export function HomeContainer({ route }: Props) {
	const Stack = createStackNavigator<HomeContainerScreenList>();

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

type HomeProps = {
	route: RouteProp<HomeContainerScreenList, 'Home'>;
};
function Home({ route }: HomeProps) {
	if (!route.params.uid) {
		return <></>;
	}
	const uid = route.params.uid;
	const firestore = useFirestore();
	useFirestoreConnect([{ collection: 'weeks', where: [['uid', '==', uid]] }]);
	const weekPrice = useTypedSelector<WeekPrices>(
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
			<View style={{ margin: 15 }}>
				<Text>Home Screen</Text>
				<WeekInput weekPrices={weekPrice} onChange={onChange} />
			</View>
		</ScrollView>
	);
}
