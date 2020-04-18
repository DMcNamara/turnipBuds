import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Provider, useSelector } from 'react-redux';
import { ReactReduxFirebaseProvider, isEmpty } from 'react-redux-firebase';
import { LoginScreen } from './src/login/LoginScreen';
import { store, rrfProps } from './src/store';

const Stack = createStackNavigator();

function HomeScreen() {
	return (
		<View
			style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
		>
			<Text>Home Screen</Text>
		</View>
	);
}

function Navigation() {
	const currentUser = useSelector((state: any) => state.firestore.data.currentUser);

	return (
		<NavigationContainer>
			<Stack.Navigator>
				{isEmpty(currentUser) ? (
					<>
						<Stack.Screen name="Home" component={HomeScreen} />
					</>
				) : (
					<>
						<Stack.Screen
							name="Login"
							component={LoginScreen}
						/>
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}

export default function App() {
	return (
		<Provider store={store}>
			<ReactReduxFirebaseProvider {...rrfProps}>
				<Navigation />
			</ReactReduxFirebaseProvider>
		</Provider>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'center',
	},
});
