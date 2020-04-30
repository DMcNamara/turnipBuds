import { RouteProp } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { TabsScreenList } from '../../App';
import { Home } from './Home';

type Props = {
	route: RouteProp<TabsScreenList, 'Me'>;
};

export type HomeContainerScreenList = {
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
