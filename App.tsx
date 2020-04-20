import { MaterialIcons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider, useSelector } from 'react-redux';
import { isEmpty, ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { FriendsContainer } from './src/friends/FriendsContainer';
import { HomeContainer } from './src/home/HomeContainer';
import { LoginScreen } from './src/login/LoginScreen';
import { rrfProps, store } from './src/store';
import { SettingsContainer } from './src/settings/SettingsContainer';
import { User } from 'firebase';

const Tab = createMaterialBottomTabNavigator();

function Tabs(user: User) {
	return (
		<NavigationContainer>
			<Tab.Navigator shifting={true}>
				<Tab.Screen
					name='Me'
					component={HomeContainer}
					options={{
						tabBarIcon: () => <MaterialIcons name='person' size={26} />,
					}}
					initialParams={ user }
				/>
				<Tab.Screen
					name='Friends'
					component={FriendsContainer}
					options={{
						tabBarIcon: () => <MaterialIcons name='people' size={26} />,
					}}
				/>
				<Tab.Screen
					name='Settings'
					component={SettingsContainer}
					options={{
						tabBarIcon: () => (
							<MaterialIcons name='settings' size={26} />
						),
					}}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
}

function Navigation() {
	const currentUser = useSelector(
		(state: any) => state.firestore.data.currentUser
	);

	return (
		!isEmpty(currentUser) ? (
			<Tabs user={currentUser}/>
		) : (
			<LoginScreen />
		)
	);
}

export default function App() {
	return (
		<Provider store={store}>
			<ReactReduxFirebaseProvider {...rrfProps}>
				<PaperProvider>
					<Navigation />
				</PaperProvider>
			</ReactReduxFirebaseProvider>
		</Provider>
	);
}
