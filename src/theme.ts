import { MaterialTopTabBarOptions } from '@react-navigation/material-top-tabs';
import { DefaultTheme as NavDefaultTheme } from '@react-navigation/native';
import { StackNavigationOptions } from '@react-navigation/stack';
import { Colors, DefaultTheme as PaperDefaultTheme } from 'react-native-paper';

export const Theme = {
	...NavDefaultTheme,
	...PaperDefaultTheme,
	colors: {
		...NavDefaultTheme.colors,
		...PaperDefaultTheme.colors,
		primary: Colors.green400,
		accent: Colors.redA100,
	},
};

export const HeaderTheme: StackNavigationOptions = {
	headerStyle: {
		backgroundColor: Theme.colors.primary,
	},
	headerTintColor: Theme.colors.text,
};

export const TabTheme: MaterialTopTabBarOptions = {
	indicatorStyle: { backgroundColor: Theme.colors.accent },
};
