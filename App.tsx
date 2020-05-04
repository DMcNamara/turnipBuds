import { MaterialIcons } from '@expo/vector-icons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider } from 'react-redux';
import { ReactReduxFirebaseProvider } from 'react-redux-firebase';
import { PersistGate } from 'redux-persist/integration/react';
import { FriendsContainer } from './src/friends/FriendsContainer';
import { HomeContainer } from './src/home/HomeContainer';
import { LoginScreen } from './src/login/LoginScreen';
import { SettingsContainer } from './src/settings/SettingsContainer';
import { persistor, rrfProps, store, useTypedSelector } from './src/store';
import './src/common/sentry';

export type TabsScreenList = {
	Me: { uid: string };
	Friends: { uid: string };
	Settings: {};
};
const Tab = createMaterialBottomTabNavigator<TabsScreenList>();
function Tabs(props: { uid: string }) {
	return (
		<NavigationContainer>
			<Tab.Navigator shifting={true}>
				<Tab.Screen
					name="Me"
					component={HomeContainer}
					options={{
						tabBarIcon: () => (
							<MaterialIcons name="person" size={26} />
						),
					}}
					initialParams={{ uid: props.uid }}
				/>
				<Tab.Screen
					name="Friends"
					component={FriendsContainer}
					options={{
						tabBarIcon: () => (
							<MaterialIcons name="people" size={26} />
						),
					}}
					initialParams={{ uid: props.uid }}
				/>
				<Tab.Screen
					name="Settings"
					component={SettingsContainer}
					options={{
						tabBarIcon: () => (
							<MaterialIcons name="settings" size={26} />
						),
					}}
				/>
			</Tab.Navigator>
		</NavigationContainer>
	);
}

function Navigation() {
	const uid = useTypedSelector(({ auth }) => auth.currentUID);
	return !!uid ? <Tabs uid={uid} /> : <LoginScreen />;
}

export default function App() {
	return (
		<Provider store={store}>
			<ReactReduxFirebaseProvider {...rrfProps}>
				<PersistGate loading={null} persistor={persistor}>
					<PaperProvider>
						<Navigation />
					</PaperProvider>
				</PersistGate>
			</ReactReduxFirebaseProvider>
		</Provider>
	);
}
